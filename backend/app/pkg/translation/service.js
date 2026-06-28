/**
 * Translation service — translates text via Google's free translate endpoint
 * (the same endpoint deep-translator uses). No API key required.
 */
import axios from 'axios';
import { SUPPORTED_LANGUAGES } from '#app/common/constants.js';

const MAX_CHUNK = 5000;

export class TranslationService {
  isAvailable () {
    return true;
  }

  getSupportedLanguages () {
    return SUPPORTED_LANGUAGES;
  }

  async _translateChunk (text, targetLanguage) {
    const res = await axios.get('https://translate.googleapis.com/translate_a/single', {
      params: { client: 'gtx', sl: 'auto', tl: targetLanguage, dt: 't', q: text },
      timeout: 30000,
    });
    return (res.data?.[0] || []).map((s) => s[0]).join('');
  }

  async translateText (text, targetLanguage = 'es') {
    if (!text) return '';
    if (text.length <= MAX_CHUNK) return this._translateChunk(text, targetLanguage);
    const out = [];
    for (let i = 0; i < text.length; i += MAX_CHUNK) {
      out.push(await this._translateChunk(text.slice(i, i + MAX_CHUNK), targetLanguage)); // eslint-disable-line no-await-in-loop
    }
    return out.join(' ');
  }
}

export const translationService = new TranslationService();
