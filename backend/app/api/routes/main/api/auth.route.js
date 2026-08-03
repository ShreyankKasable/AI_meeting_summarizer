import express from 'express';
import { AUTH_COOKIE_NAME, requireAuth } from '#app/api/middlewares/auth.js';
import config from '#app/common/config.js';
import { authService } from '#app/pkg/auth/service.js';
import { validateSignupPayload, validateLoginPayload } from '#app/pkg/auth/validation.js';

const router = express.Router();
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function setAuthCookie (res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.get('node_env') === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  });
}

function clearAuthCookie (res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: config.get('node_env') === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

router.post('/signup', validateSignupPayload, async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    const token = authService.issueToken(user);
    setAuthCookie(res, token);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validateLoginPayload, async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    const token = authService.issueToken(user);
    setAuthCookie(res, token);
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

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

export default router;
