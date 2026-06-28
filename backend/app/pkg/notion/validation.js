import { BadRequest } from '#app/common/error/index.js';

export function validateNotionConfigure (req, res, next) {
  const apiKey = req.body?.api_key;
  if (!apiKey) return next(new BadRequest('API key is required'));
  return next();
}
