import express from 'express';
import { requireAuth } from '#app/api/middlewares/auth.js';
import { authService } from '#app/pkg/auth/service.js';
import { validateSignupPayload, validateLoginPayload } from '#app/pkg/auth/validation.js';

const router = express.Router();

router.post('/signup', validateSignupPayload, async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    const token = authService.issueToken(user);
    res.json({ success: true, token, user });
  } catch (err) {
    next(err);
  }
});

router.post('/login', validateLoginPayload, async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    const token = authService.issueToken(user);
    res.json({ success: true, token, user });
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
  res.json({ success: true });
});

export default router;
