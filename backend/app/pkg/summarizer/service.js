/**
 * Summarizer service — comprehensive meeting summaries.
 * Order: local LLM (optional) -> OpenAI/Euron -> Claude -> heuristic fallback.
 */
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';
import {
  chunkTextByWords, countWords, positiveInt, transcriptToText, trimToWordLimit,
} from '#app/pkg/llm/transcript-context.js';

export class SummarizerService {
  constructor () {
    this.useLocal = config.get('use_local_model');
    this.openAIClients = {};
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
      this.openAIClients.euron = new OpenAI({ apiKey: config.get('euron.api_key'), baseURL: config.get('euron.api_base') });
      logger.info(`OK: Euron.one API available with model: ${config.get('euron.model')}`);
    }
    if (config.get('openai.api_key')) {
      const { default: OpenAI } = await import('openai');
      this.openAIClients.openai = new OpenAI({ apiKey: config.get('openai.api_key') });
      logger.info('OK: OpenAI API available');
    }
    if (config.get('huggingface.api_key')) {
      const { default: OpenAI } = await import('openai');
      this.openAIClients.huggingface = new OpenAI({
        apiKey: config.get('huggingface.api_key'),
        baseURL: 'https://router.huggingface.co/v1',
      });
      logger.info('OK: Hugging Face router API available');
    }
    if (config.get('anthropic.api_key')) {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      this.anthropicClient = new Anthropic({ apiKey: config.get('anthropic.api_key') });
    }
  }

  async summarize (transcriptData) {
    await this._ready;
    const text = transcriptToText(transcriptData);
    if (!text) return this._fallback(text);

    const directWordLimit = positiveInt(config.get('llm.direct_transcript_words'), 6000);
    if (countWords(text) > directWordLimit) {
      return this._summarizeLongTranscript(text, directWordLimit);
    }

    const summary = await this._summarizePrompt(this._buildPrompt(text), { maxTokens: 2500 });
    return summary || this._fallback(text);
  }

  async _summarizeLongTranscript (transcript, directWordLimit) {
    const chunkWords = positiveInt(config.get('llm.summary_chunk_words'), 1200);
    const overlapWords = Math.min(
      positiveInt(config.get('llm.summary_chunk_overlap_words'), 120),
      Math.floor(chunkWords / 2)
    );
    const chunks = chunkTextByWords(transcript, { chunkWords, overlapWords });

    logger.info(`Summarizing long transcript in ${chunks.length} chunks (${countWords(transcript)} words)`);

    const chunkSummaries = [];
    for (const chunk of chunks) {
      const summary = await this._summarizePrompt(this._buildChunkPrompt(chunk, chunks.length), { maxTokens: 700 }); // eslint-disable-line no-await-in-loop
      if (summary) chunkSummaries.push(`Excerpt ${chunk.index}:\n${summary}`);
    }

    if (!chunkSummaries.length) return this._fallback(transcript);

    const compactSummaries = trimToWordLimit(chunkSummaries.join('\n\n'), directWordLimit);
    const merged = await this._summarizePrompt(this._buildMergePrompt(compactSummaries), { maxTokens: 2500 });
    return merged || compactSummaries;
  }

  _buildPrompt (transcript) {
    return `You are an expert meeting analyst and summarizer. Analyze the following meeting transcript and provide a COMPREHENSIVE, DETAILED summary in clean Markdown.

Formatting requirements:
- Return Markdown only. Do not wrap the response in a code block.
- Use section headings with ##.
- Use bullet lists for grouped details.
- Use bold labels for important fields, for example **Decision** or **Owner**.
- Avoid Markdown tables and HTML.
- Keep wording clear enough that someone who missed the meeting can understand the discussion.

Your summary should be thorough and include these Markdown sections:

## Meeting Overview
   - Purpose and context of the meeting
   - Overall tone and atmosphere
   - Duration and flow

## Main Topics Discussed
   - List ALL major topics/themes covered
   - For each topic, provide 2-3 sentences of detail
   - Include any background context mentioned

## Key Points and Insights
   - Important facts, data, or metrics mentioned
   - Critical insights or observations shared
   - Any concerns or challenges raised
   - Opportunities or ideas discussed

## Decisions Made
   - All concrete decisions or agreements
   - Who made or approved each decision
   - Reasoning behind each decision

## Action Items and Next Steps
   - Detailed list of tasks assigned
   - Who is responsible for each task
   - Deadlines mentioned
   - Dependencies between tasks

## Discussion Details
   - Key questions asked and answers provided
   - Different viewpoints or opinions expressed
   - Any debates or discussions that occurred
   - Consensus reached on various points

## Participants and Contributions
   - Who spoke and their roles (if identifiable)
   - Main contributions from each participant
   - Level of engagement

## Follow-up Items
   - Future meetings planned
   - Information or resources needed
   - Open questions requiring answers

Meeting Transcript:
${transcript}

Please provide the final answer as polished Markdown with specific examples and short quotes where relevant:`;
  }

  _buildChunkPrompt (chunk, totalChunks) {
    return `You are summarizing one excerpt from a longer meeting transcript.

Return a compact Markdown brief for this excerpt only. Focus on:
- Main topics
- Key facts or concerns
- Decisions
- Action items and owners
- Open questions

Excerpt ${chunk.index} of ${totalChunks}:
${chunk.text}

Compact excerpt brief:`;
  }

  _buildMergePrompt (chunkSummaries) {
    return `You are an expert meeting analyst. Combine the following excerpt briefs into one polished meeting summary.

Return Markdown only. Avoid repeating the same point multiple times. Preserve concrete decisions, action items, owners, risks, and open questions.

Use these sections:

## Meeting Overview
## Main Topics Discussed
## Key Points and Insights
## Decisions Made
## Action Items and Next Steps
## Discussion Details
## Participants and Contributions
## Follow-up Items

Excerpt Briefs:
${chunkSummaries}

Final meeting summary:`;
  }

  async _summarizePrompt (prompt, { maxTokens = 2500 } = {}) {
    if (this.useLocal && this._llama) return this._summarizeLocal(prompt, maxTokens);
    const provider = this._resolveProvider();
    if (provider === 'anthropic') return this._summarizeClaude(prompt, maxTokens);
    if (provider) return this._summarizeOpenAI(prompt, provider, maxTokens);
    return null;
  }

  async _summarizeOpenAI (prompt, provider, maxTokens = 2500) {
    try {
      const client = this.openAIClients[provider];
      const response = await client.chat.completions.create({
        model: this._modelFor(provider),
        messages: [
          { role: 'system', content: 'You are an expert meeting analyst who provides comprehensive, detailed meeting summaries in clean Markdown. Always return Markdown only, with headings and bullet lists.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: maxTokens,
      });
      return response.choices[0].message.content;
    } catch (e) {
      logger.error('AI summarization error:', e.message);
      return null;
    }
  }

  async _summarizeClaude (prompt, maxTokens = 1500) {
    try {
      const response = await this.anthropicClient.messages.create({
        model: config.get('anthropic.model'),
        max_tokens: maxTokens,
        temperature: 0.3,
        system: 'You are an expert meeting analyst who provides comprehensive, detailed meeting summaries in clean Markdown. Always return Markdown only, with headings and bullet lists.',
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content[0].text;
    } catch (e) {
      logger.error('Anthropic summarization error:', e.message);
      return null;
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

  async _summarizeLocal (prompt, maxTokens = 1500) {
    try {
      const { getLlama, LlamaChatSession } = this._llama;
      const llama = await getLlama();
      const model = await llama.loadModel({ modelPath: config.get('local_model_path') });
      const context = await model.createContext();
      const session = new LlamaChatSession({ contextSequence: context.getSequence() });
      return await session.prompt(prompt, { temperature: 0.3, maxTokens });
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
