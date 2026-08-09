/**
 * Action item extraction service — extracts { description, assignee, due_date,
 * priority } items from a transcript (+ optional summary).
 */
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';
import {
  countWords, positiveInt, selectActionCandidateText, transcriptToText, trimToWordLimit,
} from '#app/pkg/llm/transcript-context.js';

export class ExtractionService {
  constructor () {
    this.useLocal = config.get('use_local_model');
    this.openAIClients = {};
    this.anthropicClient = null;
    this._ready = this._init();
  }

  async _init () {
    if (this.useLocal) return;
    if (config.get('euron.enabled') && config.get('euron.api_key')) {
      const { default: OpenAI } = await import('openai');
      this.openAIClients.euron = new OpenAI({ apiKey: config.get('euron.api_key'), baseURL: config.get('euron.api_base') });
    }
    if (config.get('openai.api_key')) {
      const { default: OpenAI } = await import('openai');
      this.openAIClients.openai = new OpenAI({ apiKey: config.get('openai.api_key') });
    }
    if (config.get('huggingface.api_key')) {
      const { default: OpenAI } = await import('openai');
      this.openAIClients.huggingface = new OpenAI({
        apiKey: config.get('huggingface.api_key'),
        baseURL: 'https://router.huggingface.co/v1',
      });
    }
    if (config.get('anthropic.api_key')) {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      this.anthropicClient = new Anthropic({ apiKey: config.get('anthropic.api_key') });
    }
  }

  async extract (transcriptData, summary = null) {
    await this._ready;
    const text = transcriptToText(transcriptData);
    const directWordLimit = positiveInt(config.get('llm.direct_transcript_words'), 6000);
    const prompt = countWords(text) > directWordLimit
      ? this._buildCompactPrompt(text, summary)
      : this._buildPrompt(text, summary);

    const provider = this._resolveProvider();
    if (provider === 'anthropic') return this._extractClaude(prompt);
    if (provider) return this._extractOpenAI(prompt, provider);
    return this._fallback(text);
  }

  _buildPrompt (transcript, summary) {
    let context = `Transcript:\n${transcript}`;
    if (summary) context += `\n\nSummary:\n${summary}`;
    return `You are an expert at identifying action items from meeting transcripts.

Analyze the following meeting content and extract ALL action items. For each action item, provide:
1. description: Clear description of what needs to be done
2. assignee: Who is responsible (if mentioned, otherwise null)
3. due_date: When it's due (if mentioned, otherwise null)
4. priority: Priority level (high, medium, or low)

Return your response as a JSON array of action items.

${context}

Example output format:
[
  {
    "description": "Send project proposal to client",
    "assignee": "John Smith",
    "due_date": "2024-12-01",
    "priority": "high"
  },
  {
    "description": "Review Q4 budget report",
    "assignee": null,
    "due_date": null,
    "priority": "medium"
  }
]

Action Items (JSON array):`;
  }

  _buildCompactPrompt (transcript, summary) {
    const maxContextWords = positiveInt(config.get('llm.action_context_words'), 4500);
    const summaryWords = summary ? trimToWordLimit(summary, Math.min(1800, Math.floor(maxContextWords / 2))) : '';
    const transcriptBudget = Math.max(1000, maxContextWords - countWords(summaryWords));
    const candidates = selectActionCandidateText(transcript, { maxWords: transcriptBudget });

    logger.info(
      `Extracting action items from compact context (${countWords(transcript)} transcript words -> ${countWords(candidates)} candidate words)`
    );

    return `You are an expert at identifying action items from meeting transcripts.

The original transcript is long, so you are given:
1. A meeting summary generated from the full transcript
2. The transcript passages most likely to contain assignments, deadlines, owners, and follow-ups

Extract ALL concrete action items you can identify. For each action item, provide:
1. description: Clear description of what needs to be done
2. assignee: Who is responsible (if mentioned, otherwise null)
3. due_date: When it's due (if mentioned, otherwise null)
4. priority: Priority level (high, medium, or low)

Return your response as a JSON array of action items. Do not include commentary outside JSON.

Meeting Summary:
${summaryWords || 'No summary available.'}

Likely Action Passages:
${candidates || 'No action-like transcript passages found.'}

Action Items (JSON array):`;
  }

  async _extractOpenAI (prompt, provider) {
    try {
      const client = this.openAIClients[provider];
      const response = await client.chat.completions.create({
        model: this._modelFor(provider),
        messages: [
          { role: 'system', content: 'You are an expert at extracting action items from meeting transcripts. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      });
      return this._parse(response.choices[0].message.content);
    } catch (e) {
      logger.error('AI action item extraction error:', e.message);
      return [];
    }
  }

  async _extractClaude (prompt) {
    try {
      const response = await this.anthropicClient.messages.create({
        model: config.get('anthropic.model'),
        max_tokens: 2000,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      });
      return this._parse(response.content[0].text);
    } catch (e) {
      logger.error('Anthropic action item extraction error:', e.message);
      return [];
    }
  }

  _resolveProvider () {
    const available = {
      openai: !!this.openAIClients.openai,
      anthropic: !!this.anthropicClient,
      euron: !!this.openAIClients.euron,
      huggingface: !!this.openAIClients.huggingface,
    };
    const selected = config.get('llm_provider');
    if (available[selected]) return selected;
    if (available.euron) return 'euron';
    if (available.openai) return 'openai';
    if (available.anthropic) return 'anthropic';
    if (available.huggingface) return 'huggingface';
    return null;
  }

  _modelFor (provider) {
    if (provider === 'euron') return config.get('euron.model');
    if (provider === 'huggingface') return config.get('huggingface.chat_model');
    return config.get('openai.model');
  }

  _parse (content) {
    try {
      const match = content.match(/\[[\s\S]*\]/);
      if (!match) return [];
      return JSON.parse(match[0])
        .map((item) => ({
          description: item.description || '',
          assignee: item.assignee || null,
          due_date: this._parseDueDate(item.due_date),
          priority: (item.priority || 'medium').toLowerCase(),
        }))
        .filter((item) => item.description);
    } catch (e) {
      logger.error('Error parsing action items JSON:', e.message);
      return [];
    }
  }

  _parseDueDate (dueDateStr) {
    if (!dueDateStr) return null;
    const d = new Date(dueDateStr);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }

  _fallback (transcript) {
    const keywords = [
      'will', 'should', 'need to', 'have to', 'must',
      'action item', 'todo', 'to do', 'task',
      'follow up', 'follow-up', 'next step',
    ];
    return (transcript || '')
      .split('.')
      .map((s) => s.trim())
      .filter((s) => keywords.some((k) => s.toLowerCase().includes(k)))
      .slice(0, 10)
      .map((s) => ({ description: s, assignee: null, due_date: null, priority: 'medium' }));
  }
}

export const extractionService = new ExtractionService();
