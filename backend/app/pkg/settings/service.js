/**
 * Settings service — reports which AI providers are configured (booleans
 * only, never key values) and persists safe user-editable settings both at
 * runtime (so they take effect immediately) and to the root `.env` file (so
 * they survive a restart).
 */
import fs from 'node:fs';
import path from 'node:path';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';
import { BadRequest } from '#app/common/error/index.js';

const ENV_PATH = path.join(config.paths.BASE_DIR, '.env');

// provider -> { field: envVarName } — the only fields writable via Settings.
// AI provider API keys are app-owned server secrets and are intentionally not
// writable from the UI; users can only adjust model ids here.
const PROVIDER_FIELDS = {
  system: {
    transcription_model: { env: 'TRANSCRIPTION_MODEL', configPath: 'transcription_model' },
    llm_provider: { env: 'LLM_PROVIDER', configPath: 'llm_provider' },
  },
  whisper: { model: 'WHISPER_MODEL' },
  openai: { model: 'OPENAI_MODEL' },
  anthropic: { model: 'ANTHROPIC_MODEL' },
  deepgram: { model: 'DEEPGRAM_MODEL' },
  assemblyai: { model: 'ASSEMBLYAI_MODEL' },
  huggingface: {
    asr_model: 'HUGGINGFACE_ASR_MODEL',
    chat_model: 'HUGGINGFACE_CHAT_MODEL',
  },
  euron: { model: 'EURON_MODEL' },
  notion: { api_key: 'NOTION_API_KEY' },
};

const MODEL_OPTIONS = {
  whisper: ['tiny', 'base', 'small', 'medium', 'large'],
  deepgram: ['nova-2', 'nova-3', 'enhanced', 'base'],
  assemblyai: ['best', 'nano'],
  huggingfaceAsr: ['openai/whisper-large-v3', 'openai/whisper-medium', 'openai/whisper-small'],
  openai: ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o-mini', 'gpt-4o'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  euron: ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o-mini'],
  huggingfaceChat: ['openai/gpt-oss-120b', 'meta-llama/Llama-3.1-70B-Instruct', 'Qwen/Qwen2.5-72B-Instruct'],
};

const withCurrentOption = (options, current) => (
  current && !options.includes(current) ? [current, ...options] : options
);

export class SettingsService {
  getStatus () {
    return {
      transcription: {
        active: config.get('transcription_model'),
        providers: {
          whisper: {
            configured: true,
            model: config.get('whisper.model'),
            model_field: 'model',
            models: withCurrentOption(MODEL_OPTIONS.whisper, config.get('whisper.model')),
          },
          deepgram: {
            configured: !!config.get('deepgram.api_key'),
            model: config.get('deepgram.model'),
            model_field: 'model',
            models: withCurrentOption(MODEL_OPTIONS.deepgram, config.get('deepgram.model')),
          },
          assemblyai: {
            configured: !!config.get('assemblyai.api_key'),
            model: config.get('assemblyai.model'),
            model_field: 'model',
            models: withCurrentOption(MODEL_OPTIONS.assemblyai, config.get('assemblyai.model')),
          },
          huggingface: {
            configured: !!config.get('huggingface.api_key'),
            model: config.get('huggingface.asr_model'),
            model_field: 'asr_model',
            models: withCurrentOption(MODEL_OPTIONS.huggingfaceAsr, config.get('huggingface.asr_model')),
          },
        },
      },
      chat: {
        active: config.get('llm_provider'),
        providers: {
          openai: {
            configured: !!config.get('openai.api_key'),
            model: config.get('openai.model'),
            model_field: 'model',
            models: withCurrentOption(MODEL_OPTIONS.openai, config.get('openai.model')),
          },
          anthropic: {
            configured: !!config.get('anthropic.api_key'),
            model: config.get('anthropic.model'),
            model_field: 'model',
            models: withCurrentOption(MODEL_OPTIONS.anthropic, config.get('anthropic.model')),
          },
          euron: {
            configured: config.get('euron.enabled') && !!config.get('euron.api_key'),
            model: config.get('euron.model'),
            model_field: 'model',
            models: withCurrentOption(MODEL_OPTIONS.euron, config.get('euron.model')),
          },
          huggingface: {
            configured: !!config.get('huggingface.api_key'),
            model: config.get('huggingface.chat_model'),
            model_field: 'chat_model',
            models: withCurrentOption(MODEL_OPTIONS.huggingfaceChat, config.get('huggingface.chat_model')),
          },
        },
      },
      integrations: {
        notion: { configured: !!config.get('notion.api_key') },
      },
    };
  }

  // `field` must be one of the safe writable keys declared for that provider
  // in PROVIDER_FIELDS. AI API keys are not accepted here.
  update ({ provider, field, value }) {
    const fields = PROVIDER_FIELDS[provider];
    if (!fields) throw new BadRequest(`Unknown provider: ${provider}`);
    const fieldSpec = fields[field];
    if (!fieldSpec) throw new BadRequest(`Unknown field "${field}" for provider "${provider}"`);
    if (value === undefined || value === null) throw new BadRequest('A value is required');

    const envKey = typeof fieldSpec === 'string' ? fieldSpec : fieldSpec.env;
    const configPath = typeof fieldSpec === 'string' ? `${provider}.${field}` : fieldSpec.configPath;

    this._patchEnvFile({ [envKey]: value });
    config.set(configPath, value);
    return this.getStatus();
  }

  _patchEnvFile (writes) {
    let content = '';
    try {
      content = fs.readFileSync(ENV_PATH, 'utf8');
    } catch {
      content = '';
    }
    // Drop trailing blank lines from the split so appended keys don't end up
    // with a stray blank line before them.
    const lines = content.length ? content.split('\n') : [];
    while (lines.length && lines[lines.length - 1] === '') lines.pop();
    const remaining = { ...writes };

    const updated = lines.map((line) => {
      const match = line.match(/^([A-Z0-9_]+)=/);
      if (match && Object.prototype.hasOwnProperty.call(remaining, match[1])) {
        const key = match[1];
        const value = remaining[key];
        delete remaining[key];
        return `${key}=${value}`;
      }
      return line;
    });

    for (const [key, value] of Object.entries(remaining)) {
      updated.push(`${key}=${value}`);
    }

    try {
      fs.writeFileSync(ENV_PATH, updated.join('\n').replace(/\n+$/, '\n'));
    } catch (e) {
      logger.error('Failed to write .env:', e.message);
      throw new BadRequest('Could not persist settings to .env');
    }
  }
}

export const settingsService = new SettingsService();
