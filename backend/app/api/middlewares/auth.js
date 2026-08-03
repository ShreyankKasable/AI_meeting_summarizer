/**
 * Auth middleware. Verifies the JWT from the HTTP-only auth cookie, with a
 * Bearer-token fallback for older clients, and attaches `req.user`.
 */
import { UnauthorizedRequest } from '#app/common/error/index.js';
import { authService } from '#app/pkg/auth/service.js';

export const AUTH_COOKIE_NAME = 'ams_auth';

export function getCookieValue (cookieHeader, name) {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function requireAuth (req, res, next) {
  const header = req.headers.authorization || '';
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  const cookieToken = getCookieValue(req.headers.cookie, AUTH_COOKIE_NAME);
  const token = bearerToken || cookieToken;
  if (!token) return next(new UnauthorizedRequest('Missing token'));

  try {
    const payload = authService.verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(new UnauthorizedRequest('Invalid or expired token'));
  }
}
