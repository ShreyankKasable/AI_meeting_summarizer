import { BadRequest } from '#app/common/error/index.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function validateSignupPayload (req, res, next) {
  const email = (req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password || '';

  if (!EMAIL_RE.test(email)) return next(new BadRequest('Enter a valid email address'));
  if (password.length < MIN_PASSWORD_LENGTH) {
    return next(new BadRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`));
  }

  req.body.email = email;
  req.body.password = password;
  return next();
}

export function validateLoginPayload (req, res, next) {
  const email = (req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password || '';

  if (!email || !password) return next(new BadRequest('Email and password are required'));

  req.body.email = email;
  req.body.password = password;
  return next();
}
