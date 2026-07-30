/**
 * Application configuration (convict schema — neo style).
 *
 * ALL environment variables are declared here. Access values with
 * `config.get('path.to.key')`; after validation the values are also extended
 * onto the config object (`config.foo`) and `config.isDebug` is set, mirroring
 * neo's `app/common/config.js`.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import _ from 'lodash';
import convict from 'convict';
import dotenv from 'dotenv';

const HERE = path.dirname(fileURLToPath(import.meta.url)); // backend/app/common
const BASE_DIR = path.join(HERE, '..', '..', '..'); // project root
const DATA_DIR = path.join(BASE_DIR, 'data');
const AUDIO_DIR = path.join(DATA_DIR, 'audio');
const MODELS_DIR = path.join(BASE_DIR, 'models');

dotenv.config({ path: path.join(BASE_DIR, '.env') });

const config = convict({
  node_env: {
    doc: 'Application environment',
    format: ['development', 'production', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  port: {
    doc: 'HTTP port',
    format: 'port',
    default: 5000,
    env: 'PORT',
  },
  host: {
    doc: 'HTTP host',
    format: String,
    default: '127.0.0.1',
    env: 'HOST',
  },
  secret_key: {
    doc: 'Server secret / JWT signing key',
    format: String,
    default: 'dev-secret-key-change-in-production',
    env: 'SECRET_KEY',
  },
  database: {
    url: {
      doc: 'PostgreSQL connection URL',
      format: String,
      default: 'postgres://postgres:postgres@127.0.0.1:5432/ai_meeting_summarizer',
      env: 'DATABASE_URL',
    },
    ssl: {
      doc: 'Enable TLS for PostgreSQL connections',
      format: Boolean,
      default: false,
      env: 'DATABASE_SSL',
    },
  },
  transcription_model: {
    doc: 'Transcription backend: whisper | deepgram | assemblyai | huggingface',
    format: ['whisper', 'deepgram', 'assemblyai', 'huggingface'],
    default: 'whisper',
    env: 'TRANSCRIPTION_MODEL',
  },
  transcription_language: {
    doc: 'Default transcription language',
    format: String,
    default: 'en',
    env: 'TRANSCRIPTION_LANGUAGE',
  },
  live_transcription_interval: {
    doc: 'Live transcription chunk interval (seconds)',
    format: 'int',
    default: 10,
    env: 'LIVE_TRANSCRIPTION_INTERVAL',
  },
  llm_provider: {
    doc: 'LLM backend: openai | anthropic | euron | huggingface',
    format: ['openai', 'anthropic', 'euron', 'huggingface'],
    default: 'openai',
    env: 'LLM_PROVIDER',
  },
  use_local_model: {
    doc: 'Use a local LLM for summarization',
    format: Boolean,
    default: false,
    env: 'USE_LOCAL_MODEL',
  },
  local_model_path: {
    doc: 'Path to local .gguf model',
    format: String,
    default: '',
    env: 'LOCAL_MODEL_PATH',
  },
  whisper: {
    model: { format: String, default: 'base', env: 'WHISPER_MODEL' },
  },
  openai: {
    api_key: { format: String, default: '', env: 'OPENAI_API_KEY', sensitive: true },
    model: { format: String, default: 'gpt-4-turbo-preview', env: 'OPENAI_MODEL' },
  },
  anthropic: {
    api_key: { format: String, default: '', env: 'ANTHROPIC_API_KEY', sensitive: true },
    model: { format: String, default: 'claude-3-5-sonnet-20241022', env: 'ANTHROPIC_MODEL' },
  },
  deepgram: {
    api_key: { format: String, default: '', env: 'DEEPGRAM_API_KEY', sensitive: true },
    model: { format: String, default: 'nova-2', env: 'DEEPGRAM_MODEL' },
  },
  assemblyai: {
    api_key: { format: String, default: '', env: 'ASSEMBLYAI_API_KEY', sensitive: true },
    model: { format: String, default: 'best', env: 'ASSEMBLYAI_MODEL' },
  },
  huggingface: {
    api_key: { format: String, default: '', env: 'HUGGINGFACE_API_KEY', sensitive: true },
    asr_model: { format: String, default: 'openai/whisper-large-v3', env: 'HUGGINGFACE_ASR_MODEL' },
    chat_model: { format: String, default: 'openai/gpt-oss-120b', env: 'HUGGINGFACE_CHAT_MODEL' },
  },
  euron: {
    enabled: { format: Boolean, default: false, env: 'USE_EURON_API' },
    api_key: { format: String, default: '', env: 'EURON_API_KEY', sensitive: true },
    api_base: { format: String, default: 'https://api.euron.one/api/v1/euri', env: 'EURON_API_BASE' },
    model: { format: String, default: 'gpt-4.1-mini', env: 'EURON_MODEL' },
  },
  audio: {
    sample_rate: { format: 'int', default: 16000, env: 'AUDIO_SAMPLE_RATE' },
    channels: { format: 'int', default: 1, env: 'AUDIO_CHANNELS' },
  },
  notion: {
    enabled: { format: Boolean, default: false, env: 'NOTION_ENABLED' },
    api_key: { format: String, default: '', env: 'NOTION_API_KEY', sensitive: true },
    database_id: { format: String, default: '', env: 'NOTION_DATABASE_ID' },
  },
});

config.validate({ allowed: 'warn' });

// Computed paths (not env-driven)
config.set('local_model_path', config.get('local_model_path') || path.join(MODELS_DIR, 'llama-2-7b-chat.gguf'));

// Ensure required directories exist
[DATA_DIR, AUDIO_DIR, MODELS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Flatten values onto the config object and expose helpers (neo parity)
_.extend(config, config.get());
config.paths = { BASE_DIR, DATA_DIR, AUDIO_DIR, MODELS_DIR };
config.isDebug = config.get('node_env') !== 'production';

export default config;
