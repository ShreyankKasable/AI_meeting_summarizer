/**
 * Bearer-token auth middleware. Verifies the JWT and attaches `req.user`
 * ({ id, email }) for downstream route handlers.
 */
import { UnauthorizedRequest } from '#app/common/error/index.js';
import { authService } from '#app/pkg/auth/service.js';

export function requireAuth (req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new UnauthorizedRequest('Missing token'));

  try {
    const payload = authService.verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return next(new UnauthorizedRequest('Invalid or expired token'));
  }
}
