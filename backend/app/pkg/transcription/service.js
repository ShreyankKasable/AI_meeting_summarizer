/**
 * Transcription service — local Whisper (optional), Deepgram, AssemblyAI, or
 * the Hugging Face Inference Providers API (free-tier Whisper).
 * Returns { text, segments, language }.
 */
import fs from 'node:fs';
import axios from 'axios';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';

export class TranscriptionService {
  constructor () {
    this.modelType = config.get('transcription_model');
    this.whisper = null;
    if (this.modelType === 'whisper') {
      this._loadWhisper();
    }
  }

  async _loadWhisper () {
    try {
      const mod = await import('whisper-node'); // optional dependency
      this.whisper = mod.whisper || mod.default?.whisper;
      logger.info('OK: whisper-node loaded');
    } catch (e) {
      logger.warn('whisper-node not available:', e.message, '— using API or fallback');
    }
  }

  async transcribe (audioFile) {
    if (!audioFile || !fs.existsSync(audioFile)) {
      throw new Error(`Audio file not found: ${audioFile}`);
    }
    logger.info('Transcribing audio file:', audioFile);

    if (this.modelType === 'deepgram') return this._deepgram(audioFile);
    if (this.modelType === 'assemblyai') return this._assemblyai(audioFile);
    if (this.modelType === 'huggingface') return this._huggingface(audioFile);
    return this._whisper(audioFile);
  }

  async _whisper (audioFile) {
    if (!this.whisper) return this._fallback(audioFile);
    try {
      const result = await this.whisper(audioFile, {
        modelName: 'base',
        whisperOptions: { word_timestamps: false },
      });
      const segments = (result || []).map((r) => ({ start: r.start, end: r.end, text: r.speech }));
      return { text: segments.map((s) => s.text).join(' ').trim(), segments, language: 'en' };
    } catch (e) {
      logger.error('Whisper transcription error:', e.message);
      return this._fallback(audioFile);
    }
  }

  async _deepgram (audioFile) {
    try {
      const apiKey = config.get('deepgram.api_key');
      if (!apiKey) throw new Error('DEEPGRAM_API_KEY not configured');
      const audioData = fs.readFileSync(audioFile);
      const res = await axios.post(
        'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&diarize=true',
        audioData,
        {
          headers: { Authorization: `Token ${apiKey}`, 'Content-Type': 'audio/wav' },
          timeout: 60000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );
      const alt = res.data?.results?.channels?.[0]?.alternatives?.[0];
      const transcript = alt?.transcript || '';
      logger.info(`Deepgram transcription successful: ${transcript.length} characters`);
      return { text: transcript, segments: segmentsFromDeepgramWords(alt?.words), language: 'en' };
    } catch (e) {
      logger.error('Deepgram transcription error:', e.message);
      return this._fallback(audioFile);
    }
  }

  async _assemblyai (audioFile) {
    try {
      const apiKey = config.get('assemblyai.api_key');
      if (!apiKey) throw new Error('ASSEMBLYAI_API_KEY not configured');
      const base = 'https://api.assemblyai.com/v2';
      const headers = { Authorization: apiKey };

      const audioData = fs.readFileSync(audioFile);
      const upload = await axios.post(`${base}/upload`, audioData, {
        headers: { ...headers, 'Content-Type': 'application/octet-stream' },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });
      const create = await axios.post(
        `${base}/transcript`,
        { audio_url: upload.data.upload_url, speaker_labels: true },
        { headers }
      );
      const id = create.data.id;

      for (;;) {
        const poll = await axios.get(`${base}/transcript/${id}`, { headers }); // eslint-disable-line no-await-in-loop
        if (poll.data.status === 'completed') {
          return {
            text: poll.data.text || '',
            segments: segmentsFromAssemblyAiUtterances(poll.data.utterances),
            language: 'en',
          };
        }
        if (poll.data.status === 'error') throw new Error(poll.data.error || 'AssemblyAI error');
        await new Promise((r) => setTimeout(r, 2000)); // eslint-disable-line no-await-in-loop
      }
    } catch (e) {
      logger.error('AssemblyAI transcription error:', e.message);
      return this._fallback(audioFile);
    }
  }

  async _huggingface (audioFile) {
    try {
      const apiKey = config.get('huggingface.api_key');
      if (!apiKey) throw new Error('HUGGINGFACE_API_KEY not configured');
      const model = config.get('huggingface.asr_model');
      const audioData = fs.readFileSync(audioFile);
      const res = await axios.post(
        `https://router.huggingface.co/hf-inference/models/${model}`,
        audioData,
        {
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'audio/wav', Accept: 'application/json' },
          timeout: 60000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        }
      );
      const transcript = res.data?.text || '';
      logger.info(`Hugging Face transcription successful: ${transcript.length} characters`);
      return { text: transcript, segments: [], language: 'en' };
    } catch (e) {
      logger.error('Hugging Face transcription error:', e.response?.data ? JSON.stringify(e.response.data) : e.message);
      return this._fallback(audioFile);
    }
  }

  _fallback (audioFile) {
    return {
      text:
        `[Audio recorded from ${audioFile}]\n\nTranscription temporarily unavailable. Please:\n` +
        '1. Set TRANSCRIPTION_MODEL=deepgram or assemblyai with a valid API key\n' +
        '2. Or install whisper-node for local transcription',
      segments: [],
      language: 'en',
    };
  }
}

// Renumbers whatever raw speaker ids a provider used (0/1/2, 'A'/'B', ...) to
// "Speaker 1", "Speaker 2", ... in order of first appearance, so both
// providers produce the same label shape.
function relabelSpeakers (rawSegments) {
  const labelByRawId = new Map();
  return rawSegments.map(({ rawSpeaker, text, start, end }) => {
    if (!labelByRawId.has(rawSpeaker)) {
      labelByRawId.set(rawSpeaker, `Speaker ${labelByRawId.size + 1}`);
    }
    return { speaker: labelByRawId.get(rawSpeaker), text, start, end };
  });
}

// Deepgram (with diarize=true) returns per-word speaker indices, not
// pre-grouped turns — group consecutive same-speaker words into segments.
function segmentsFromDeepgramWords (words) {
  if (!Array.isArray(words) || !words.length) return [];
  const raw = [];
  for (const w of words) {
    const last = raw[raw.length - 1];
    if (last && last.rawSpeaker === w.speaker) {
      last.text += ` ${w.punctuated_word || w.word}`;
      last.end = w.end;
    } else {
      raw.push({ rawSpeaker: w.speaker, text: w.punctuated_word || w.word, start: w.start, end: w.end });
    }
  }
  return relabelSpeakers(raw);
}

// AssemblyAI (with speaker_labels: true) already returns pre-grouped turns.
function segmentsFromAssemblyAiUtterances (utterances) {
  if (!Array.isArray(utterances) || !utterances.length) return [];
  const raw = utterances.map((u) => ({
    rawSpeaker: u.speaker, text: u.text, start: u.start / 1000, end: u.end / 1000,
  }));
  return relabelSpeakers(raw);
}

export const transcriptionService = new TranscriptionService();
