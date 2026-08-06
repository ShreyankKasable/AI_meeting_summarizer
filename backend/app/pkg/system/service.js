/**
 * System service — reports runtime/offline capabilities and integration status
 * for the /api/system/* endpoints.
 */
import fs from 'node:fs';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';

export class SystemService {
  constructor () {
    this.localLlm = null;
    this.whisper = null;
    this._ready = this._init();
  }

  async _init () {
    if (!config.get('use_local_model')) return;
    if (fs.existsSync(config.get('local_model_path'))) {
      try {
        await import('node-llama-cpp');
        this.localLlm = 'available';
      } catch (e) {
        logger.warn('node-llama-cpp not available:', e.message);
      }
    }
    try {
      const mod = await import('whisper-node');
      this.whisper = mod.whisper || mod.default?.whisper;
    } catch { /* whisper not installed */ }
  }

  capabilities () {
    return {
      offline_ready: this.localLlm !== null && this.whisper !== null,
      local_llm_available: this.localLlm !== null,
      whisper_available: this.whisper !== null,
      transcription_mode: config.get('transcription_model'),
      use_local_model: config.get('use_local_model'),
    };
  }

  status () {
    return {
      status: 'running',
      version: '2.0.0',
      node_version: process.version,
      config: {
        transcription_model: config.get('transcription_model'),
        use_local_model: config.get('use_local_model'),
        database: {
          client: 'postgres',
          url: redactDatabaseUrl(config.get('database.url')),
          ssl: config.get('database.ssl'),
        },
        rag: {
          embedding_model: config.get('embedding.model'),
          embedding_dimensions: config.get('embedding.dimensions'),
          max_chunks: config.get('rag.max_chunks'),
        },
      },
      capabilities: this.capabilities(),
      integrations: {
        notion: !!config.get('notion.api_key'),
      },
    };
  }

  models () {
    return {
      local_llm: { loaded: this.localLlm !== null, path: this.localLlm ? config.get('local_model_path') : null },
      whisper: { loaded: this.whisper !== null, model: this.whisper ? 'base' : null },
    };
  }
}

export const systemService = new SystemService();

function redactDatabaseUrl (value) {
  try {
    const url = new URL(value);
    if (url.password) url.password = '***';
    return url.toString();
  } catch {
    return value;
  }
}
