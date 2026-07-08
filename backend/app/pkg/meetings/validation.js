/**
 * Request validation middleware for meeting routes (neo: validation.js exports
 * express validate middleware that throws on bad input).
 */
import { BadRequest } from '#app/common/error/index.js';
import { SUPPORTED_LANGUAGES } from '#app/common/constants.js';

export function validateTitlePayload (req, res, next) {
  const title = (req.body?.title || '').trim();
  if (!title) return next(new BadRequest('Title cannot be empty'));
  req.body.title = title;
  return next();
}

export function validateTranslatePayload (req, res, next) {
  const language = req.body?.language || 'es';
  if (!SUPPORTED_LANGUAGES[language]) {
    return next(new BadRequest(`Unsupported language: ${language}`));
  }
  req.body.language = language;
  return next();
}

export function validateChatPayload (req, res, next) {
  const question = (req.body?.question || '').trim();
  if (!question) return next(new BadRequest('Question cannot be empty'));
  req.body.question = question;
  return next();
}

export function validateSpeakerNamePayload (req, res, next) {
  const speaker = (req.body?.speaker || '').trim();
  const name = (req.body?.name || '').trim();
  if (!speaker) return next(new BadRequest('speaker is required'));
  if (!name) return next(new BadRequest('name cannot be empty'));
  if (name.length > 100) return next(new BadRequest('name is too long'));
  req.body.speaker = speaker;
  req.body.name = name;
  return next();
}
