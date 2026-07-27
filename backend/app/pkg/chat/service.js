/**
 * Meeting chatbot service — answers questions about a single meeting.
 *
 * Before answering, the LLM is forced to call the `get_meeting_transcript`
 * tool so its answer is always grounded in the meeting's actual transcript
 * rather than guessed from the question alone.
 */
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';
import { getDb } from '#app/connections/database.js';
import { meetingsService } from '#app/pkg/meetings/service.js';

const TOOL_NAME = 'get_meeting_transcript';
const TOOL_DESCRIPTION =
  "Fetch the full transcript of this meeting. Always call this before answering the user's question so your answer is grounded in what was actually said.";
const SYSTEM_PROMPT =
  'You are a helpful assistant answering questions about one specific recorded meeting. ' +
  `Always call the ${TOOL_NAME} tool first to retrieve the transcript, then answer using only ` +
  'what is in it. If the transcript does not contain the answer, say so.';

const nowIso = () => new Date().toISOString();

export class ChatbotService {
  // `actorKey` scopes the thread — e.g. `host:<hostId>` or
  // `participant:<participantId>` — so each distinct person chatting about a
  // meeting gets their own private conversation rather than one shared
  // thread per meeting.
  getHistory (meetingId, actorKey) {
    return getDb()
      .prepare('SELECT * FROM chat_messages WHERE meeting_id = ? AND actor_key = ? ORDER BY id')
      .all(meetingId, actorKey)
      .map((r) => ({ id: r.id, role: r.role, content: r.content, created_at: r.created_at }));
  }

  async ask (meetingId, question, provider, actorKey) {
    const meeting = meetingsService.getMeetingById(meetingId);
    if (!meeting) throw new Error('Meeting not found');

    const priorHistory = this.getHistory(meetingId, actorKey);
    this._saveMessage(meetingId, actorKey, 'user', question);

    const transcriptText = meeting.transcript && typeof meeting.transcript === 'object'
      ? meeting.transcript.text || ''
      : meeting.transcript || '';
    const getTranscript = () => transcriptText || 'No transcript is available for this meeting yet.';

    const resolved = this._resolveProvider(provider);
    let answer;
    if (resolved === 'anthropic') {
      answer = await this._askClaude(question, priorHistory, getTranscript);
    } else if (resolved === 'openai' || resolved === 'euron' || resolved === 'huggingface') {
      answer = await this._askOpenAICompatible(resolved, question, priorHistory, getTranscript);
    } else {
      answer = 'No AI provider is configured on the server. Please contact the workspace administrator.';
    }

    this._saveMessage(meetingId, actorKey, 'assistant', answer);
    return answer;
  }

  _saveMessage (meetingId, actorKey, role, content) {
    getDb().prepare(
      'INSERT INTO chat_messages (meeting_id, actor_key, role, content, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(meetingId, actorKey, role, content, nowIso());
  }

  _resolveProvider (requested) {
    const available = {
      openai: !!config.get('openai.api_key'),
      anthropic: !!config.get('anthropic.api_key'),
      euron: config.get('euron.enabled') && !!config.get('euron.api_key'),
      huggingface: !!config.get('huggingface.api_key'),
    };
    if (requested && available[requested]) return requested;
    const selected = config.get('llm_provider');
    if (available[selected]) return selected;
    if (available.euron) return 'euron';
    if (available.openai) return 'openai';
    if (available.anthropic) return 'anthropic';
    if (available.huggingface) return 'huggingface';
    return null;
  }

  _clientConfigFor (providerKey) {
    if (providerKey === 'euron') {
      return { apiKey: config.get('euron.api_key'), baseURL: config.get('euron.api_base'), model: config.get('euron.model') };
    }
    if (providerKey === 'huggingface') {
      return { apiKey: config.get('huggingface.api_key'), baseURL: 'https://router.huggingface.co/v1', model: config.get('huggingface.chat_model') };
    }
    return { apiKey: config.get('openai.api_key'), baseURL: undefined, model: config.get('openai.model') };
  }

  async _askOpenAICompatible (providerKey, question, priorHistory, getTranscript) {
    try {
      const { default: OpenAI } = await import('openai');
      const { apiKey, baseURL, model } = this._clientConfigFor(providerKey);
      const client = new OpenAI({ apiKey, baseURL });

      const tools = [{
        type: 'function',
        function: { name: TOOL_NAME, description: TOOL_DESCRIPTION, parameters: { type: 'object', properties: {} } },
      }];

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...priorHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: question },
      ];

      const first = await client.chat.completions.create({
        model,
        messages,
        tools,
        tool_choice: { type: 'function', function: { name: TOOL_NAME } },
      });

      const choice = first.choices[0].message;
      messages.push(choice);
      for (const call of choice.tool_calls || []) {
        messages.push({ role: 'tool', tool_call_id: call.id, content: getTranscript() });
      }

      const final = await client.chat.completions.create({ model, messages });
      return final.choices[0].message.content;
    } catch (e) {
      logger.error(`Chatbot ${providerKey} error:`, e.message);
      return `Sorry, I couldn't answer that: ${e.message}`;
    }
  }

  async _askClaude (question, priorHistory, getTranscript) {
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: config.get('anthropic.api_key') });
      const model = config.get('anthropic.model');

      const tools = [{ name: TOOL_NAME, description: TOOL_DESCRIPTION, input_schema: { type: 'object', properties: {} } }];

      const messages = [
        ...priorHistory.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: question },
      ];

      const first = await client.messages.create({
        model,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
        tools,
        tool_choice: { type: 'tool', name: TOOL_NAME },
      });

      messages.push({ role: 'assistant', content: first.content });
      const toolResults = first.content
        .filter((b) => b.type === 'tool_use')
        .map((b) => ({ type: 'tool_result', tool_use_id: b.id, content: getTranscript() }));
      messages.push({ role: 'user', content: toolResults });

      const final = await client.messages.create({ model, max_tokens: 1024, system: SYSTEM_PROMPT, messages });
      const textBlock = final.content.find((b) => b.type === 'text');
      return textBlock ? textBlock.text : '';
    } catch (e) {
      logger.error('Chatbot Anthropic error:', e.message);
      return `Sorry, I couldn't answer that: ${e.message}`;
    }
  }
}

export const chatbotService = new ChatbotService();
