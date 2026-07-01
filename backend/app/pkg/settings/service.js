/**
 * Settings service — reports which AI providers are configured (booleans
 * only, never key values) and persists changes both at runtime (so they take
 * effect immediately) and to the root `.env` file (so they survive a
 * restart), consistent with how every provider key already works via convict.
 */
import fs from 'node:fs';
import path from 'node:path';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';
import { BadRequest } from '#app/common/error/index.js';

const ENV_PATH = path.join(config.paths.BASE_DIR, '.env');

// provider -> { field: envVarName } — the only fields writable via Settings.
const PROVIDER_FIELDS = {
  openai: { api_key: 'OPENAI_API_KEY' },
  anthropic: { api_key: 'ANTHROPIC_API_KEY' },
  deepgram: { api_key: 'DEEPGRAM_API_KEY' },
  assemblyai: { api_key: 'ASSEMBLYAI_API_KEY' },
  huggingface: {
    api_key: 'HUGGINGFACE_API_KEY',
    asr_model: 'HUGGINGFACE_ASR_MODEL',
    chat_model: 'HUGGINGFACE_CHAT_MODEL',
  },
  euron: { api_key: 'EURON_API_KEY', model: 'EURON_MODEL' },
  notion: { api_key: 'NOTION_API_KEY' },
};

export class SettingsService {
  getStatus () {
    return {
      transcription: {
        active: config.get('transcription_model'),
        providers: {
          deepgram: { configured: !!config.get('deepgram.api_key') },
          assemblyai: { configured: !!config.get('assemblyai.api_key') },
          huggingface: {
            configured: !!config.get('huggingface.api_key'),
            model: config.get('huggingface.asr_model'),
          },
          whisper: { configured: true, note: 'Local, no API key needed (requires whisper-node installed)' },
        },
      },
      chat: {
        providers: {
          openai: { configured: !!config.get('openai.api_key') },
          anthropic: { configured: !!config.get('anthropic.api_key') },
          euron: {
            configured: config.get('euron.enabled') && !!config.get('euron.api_key'),
            model: config.get('euron.model'),
          },
          huggingface: {
            configured: !!config.get('huggingface.api_key'),
            model: config.get('huggingface.chat_model'),
          },
        },
      },
      integrations: {
        notion: { configured: !!config.get('notion.api_key') },
      },
    };
  }

  // `field` must be one of the keys declared for that provider in
  // PROVIDER_FIELDS (e.g. 'api_key', or 'asr_model'/'chat_model' for
  // huggingface, which has two distinct model settings) — kept explicit
  // rather than a generic "model" field, since some providers have more
  // than one model setting and a generic name would be ambiguous.
  update ({ provider, field, value }) {
    const fields = PROVIDER_FIELDS[provider];
    if (!fields) throw new BadRequest(`Unknown provider: ${provider}`);
    const envKey = fields[field];
    if (!envKey) throw new BadRequest(`Unknown field "${field}" for provider "${provider}"`);
    if (value === undefined || value === null) throw new BadRequest('A value is required');

    this._patchEnvFile({ [envKey]: value });
    config.set(`${provider}.${field}`, value);
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
