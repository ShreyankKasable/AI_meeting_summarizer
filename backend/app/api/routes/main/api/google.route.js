import express from 'express';
import { expressAsyncHandler } from '#app/api/middlewares/asyncHandler.js';
import { BadRequest } from '#app/common/error/index.js';
import { calendarService } from '#app/pkg/calendar/service.js';

const router = express.Router();

// GET /api/google/available
router.get('/available', (req, res) => {
  res.json({ available: calendarService.isAvailable() });
});

// GET /api/google/auth-status
router.get('/auth-status', (req, res) => {
  if (!calendarService.isAvailable()) {
    return res.json({ authenticated: false, available: false, message: 'Google Calendar API not configured' });
  }
  return res.json({ authenticated: calendarService.isAuthenticated(), available: true });
});

// GET /api/google/auth-url
router.get('/auth-url', (req, res) => {
  res.json({ auth_url: calendarService.getAuthUrl() });
});

// GET /api/google/callback
router.get('/callback', expressAsyncHandler(async (req, res) => {
  const { code } = req.query;
  if (!code) throw new BadRequest('No authorization code provided');
  await calendarService.completeAuth(code);
  res.send('<html><body><h2>Authentication Successful!</h2><p>You can close this window and return to the app.</p><script>window.close();</script></body></html>');
}));

export default router;
