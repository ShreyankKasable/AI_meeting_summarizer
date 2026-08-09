import cors from 'cors';
import config from '#app/common/config.js';

/**
 * CORS handler. Only configured frontend origins can make credentialed browser
 * requests to the API.
 */
export const corsHandler = cors({ origin: corsOrigin, credentials: true });

export function corsOrigin (origin, callback) {
  if (isAllowedOrigin(origin)) return callback(null, true);
  return callback(null, false);
}

export function isAllowedOrigin (origin) {
  if (!origin) return true;
  const allowed = getAllowedOrigins();
  return allowed.includes('*') || allowed.includes(origin);
}

export function getAllowedOrigins () {
  return String(config.get('frontend_origins') || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
