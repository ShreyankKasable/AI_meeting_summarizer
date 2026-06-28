/**
 * Summarizer service — comprehensive meeting summaries.
 * Order: local LLM (optional) -> OpenAI/Euron -> Claude -> heuristic fallback.
 */
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';

export class SummarizerService {
  constructor () {
    this.useLocal = config.get('use_local_model');
    this.openaiClient = null;
    this.modelName = null;
    this.anthropicClient = null;
    this._ready = this._init();
  }

  async _init () {
    if (this.useLocal) {
      try {
        this._llama = await import('node-llama-cpp'); // optional dependency
      } catch (e) {
        logger.warn('node-llama-cpp not available:', e.message);
        this.useLocal = false;
      }
      return;
    }
    if (config.get('euron.enabled') && config.get('euron.api_key')) {
      const { default: OpenAI } = await import('openai');
      this.openaiClient = new OpenAI({ apiKey: config.get('euron.api_key'), baseURL: config.get('euron.api_base') });
      this.modelName = config.get('euron.model');
      logger.info(`OK: Using Euron.one API with model: ${this.modelName}`);
    } else if (config.get('openai.api_key')) {
      const { default: OpenAI } = await import('openai');
      this.openaiClient = new OpenAI({ apiKey: config.get('openai.api_key') });
      this.modelName = 'gpt-4-turbo-preview';
      logger.info('OK: Using official OpenAI API');
    }
    if (config.get('anthropic.api_key')) {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      this.anthropicClient = new Anthropic({ apiKey: config.get('anthropic.api_key') });
    }
  }

  async summarize (transcriptData) {
    await this._ready;
    const text = transcriptData && typeof transcriptData === 'object'
      ? (transcriptData.text || '')
      : (transcriptData || '');
    const prompt = this._buildPrompt(text);

    if (this.useLocal && this._llama) return this._summarizeLocal(prompt);
    if (this.openaiClient) return this._summarizeOpenAI(prompt);
    if (this.anthropicClient) return this._summarizeClaude(prompt);
    return this._fallback(text);
  }

  _buildPrompt (transcript) {
    return `You are an expert meeting analyst and summarizer. Analyze the following meeting transcript and provide a COMPREHENSIVE, DETAILED summary.

Your summary should be thorough and include:

1. **Meeting Overview**
   - Purpose and context of the meeting
   - Overall tone and atmosphere
   - Duration and flow

2. **Main Topics Discussed**
   - List ALL major topics/themes covered
   - For each topic, provide 2-3 sentences of detail
   - Include any background context mentioned

3. **Key Points and Insights**
   - Important facts, data, or metrics mentioned
   - Critical insights or observations shared
   - Any concerns or challenges raised
   - Opportunities or ideas discussed

4. **Decisions Made**
   - All concrete decisions or agreements
   - Who made or approved each decision
   - Reasoning behind each decision

5. **Action Items and Next Steps**
   - Detailed list of tasks assigned
   - Who is responsible for each task
   - Deadlines mentioned
   - Dependencies between tasks

6. **Discussion Details**
   - Key questions asked and answers provided
   - Different viewpoints or opinions expressed
   - Any debates or discussions that occurred
   - Consensus reached on various points

7. **Participants and Contributions**
   - Who spoke and their roles (if identifiable)
   - Main contributions from each participant
   - Level of engagement

8. **Follow-up Items**
   - Future meetings planned
   - Information or resources needed
   - Open questions requiring answers

Meeting Transcript:
${transcript}

Please provide a well-structured, DETAILED summary with specific examples and quotes where relevant. Make it comprehensive enough that someone who missed the meeting can fully understand what happened:`;
  }

  async _summarizeOpenAI (prompt) {
    try {
      const response = await this.openaiClient.chat.completions.create({
        model: this.modelName,
        messages: [
          { role: 'system', content: 'You are an expert meeting analyst who provides comprehensive, detailed summaries. Always be thorough and include specific details, quotes, and context.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2500,
      });
      return response.choices[0].message.content;
    } catch (e) {
      logger.error('AI summarization error:', e.message);
      return null;
    }
  }

  async _summarizeClaude (prompt) {
    try {
      const response = await this.anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content[0].text;
    } catch (e) {
      logger.error('Anthropic summarization error:', e.message);
      return null;
    }
  }

  async _summarizeLocal (prompt) {
    try {
      const { getLlama, LlamaChatSession } = this._llama;
      const llama = await getLlama();
      const model = await llama.loadModel({ modelPath: config.get('local_model_path') });
      const context = await model.createContext();
      const session = new LlamaChatSession({ contextSequence: context.getSequence() });
      return await session.prompt(prompt, { temperature: 0.3, maxTokens: 1500 });
    } catch (e) {
      logger.error('Local model summarization error:', e.message);
      return null;
    }
  }

  _fallback (transcript) {
    const words = (transcript || '').split(/\s+/).filter(Boolean);
    const paragraphs = (transcript || '').split('\n\n');
    return `## Meeting Summary

**Word Count**: ${words.length}

**Content Overview**:
${paragraphs[0] || (transcript || '').slice(0, 500)}

**Note**: This is a basic summary. Configure an AI model (OpenAI, Anthropic, or local) for detailed summaries.
`;
  }
}

export const summarizerService = new SummarizerService();
