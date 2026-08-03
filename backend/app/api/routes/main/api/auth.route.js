import express from 'express';
import {
  AUTH_ACCESS_COOKIE_NAME,
  AUTH_REFRESH_COOKIE_NAME,
  getCookieValue,
  requireAuth,
} from '#app/api/middlewares/auth.js';
import config from '#app/common/config.js';
import { UnauthorizedRequest } from '#app/common/error/index.js';
import { authService } from '#app/pkg/auth/service.js';
import { validateSignupPayload, validateLoginPayload } from '#app/pkg/auth/validation.js';

const router = express.Router();
const ACCESS_COOKIE_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function cookieOptions (maxAge) {
  return {
    httpOnly: true,
    secure: config.get('node_env') === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  };
}

function clearCookieOptions () {
  return {
    httpOnly: true,
    secure: config.get('node_env') === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

function setAuthCookies (res, user) {
  res.cookie(
    AUTH_ACCESS_COOKIE_NAME,
    authService.issueAccessToken(user),
    cookieOptions(ACCESS_COOKIE_MAX_AGE_MS)
  );
  res.cookie(
    AUTH_REFRESH_COOKIE_NAME,
    authService.issueRefreshToken(user),
    cookieOptions(REFRESH_COOKIE_MAX_AGE_MS)
  );
}

function clearAuthCookies (res) {
  res.clearCookie(AUTH_ACCESS_COOKIE_NAME, clearCookieOptions());
  res.clearCookie(AUTH_REFRESH_COOKIE_NAME, clearCookieOptions());
}

router.post('/signup', validateSignupPayload, async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    setAuthCookies(res, user);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validateLoginPayload, async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    setAuthCookies(res, user);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    res.json({ user: await authService.getUserById(req.user.id) });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = getCookieValue(req.headers.cookie, AUTH_REFRESH_COOKIE_NAME);
    if (!refreshToken) throw new UnauthorizedRequest('Missing refresh token');

    let payload;
    try {
      payload = authService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedRequest('Invalid or expired refresh token');
    }

    const user = await authService.getUserById(payload.sub);
    if (!user) throw new UnauthorizedRequest('User not found');

    setAuthCookies(res, user);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  clearAuthCookies(res);
  res.json({ success: true });
});

export default router;
