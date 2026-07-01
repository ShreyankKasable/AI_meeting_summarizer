import express from 'express';
import { requireAuth } from '#app/api/middlewares/auth.js';
import { authService } from '#app/pkg/auth/service.js';
import { validateSignupPayload, validateLoginPayload } from '#app/pkg/auth/validation.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', validateSignupPayload, (req, res) => {
  const user = authService.signup(req.body);
  const token = authService.issueToken(user);
  res.json({ success: true, token, user });
});

// POST /api/auth/login
router.post('/login', validateLoginPayload, (req, res) => {
  const user = authService.login(req.body);
  const token = authService.issueToken(user);
  res.json({ success: true, token, user });
});

// GET /api/auth/me — lets the frontend validate a persisted token on boot
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: authService.getUserById(req.user.id) });
});

// POST /api/auth/logout — stateless JWT, no server-side session to invalidate;
// kept for API symmetry / a clean client-side call site.
router.post('/logout', (req, res) => {
  res.json({ success: true });
});

export default router;
