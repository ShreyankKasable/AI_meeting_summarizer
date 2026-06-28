/**
 * Action item extraction service — extracts { description, assignee, due_date,
 * priority } items from a transcript (+ optional summary).
 */
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';

export class ExtractionService {
  constructor () {
    this.useLocal = config.get('use_local_model');
    this.openaiClient = null;
    this.modelName = null;
    this.anthropicClient = null;
    this._ready = this._init();
  }

  async _init () {
    if (this.useLocal) return;
    if (config.get('euron.enabled') && config.get('euron.api_key')) {
      const { default: OpenAI } = await import('openai');
      this.openaiClient = new OpenAI({ apiKey: config.get('euron.api_key'), baseURL: config.get('euron.api_base') });
      this.modelName = config.get('euron.model');
    } else if (config.get('openai.api_key')) {
      const { default: OpenAI } = await import('openai');
      this.openaiClient = new OpenAI({ apiKey: config.get('openai.api_key') });
      this.modelName = 'gpt-4-turbo-preview';
    }
    if (config.get('anthropic.api_key')) {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      this.anthropicClient = new Anthropic({ apiKey: config.get('anthropic.api_key') });
    }
  }

  async extract (transcriptData, summary = null) {
    await this._ready;
    const text = transcriptData && typeof transcriptData === 'object'
      ? (transcriptData.text || '')
      : (transcriptData || '');
    const prompt = this._buildPrompt(text, summary);

    if (this.openaiClient) return this._extractOpenAI(prompt);
    if (this.anthropicClient) return this._extractClaude(prompt);
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

  async _extractOpenAI (prompt) {
    try {
      const response = await this.openaiClient.chat.completions.create({
        model: this.modelName,
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
        model: 'claude-3-5-sonnet-20241022',
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
