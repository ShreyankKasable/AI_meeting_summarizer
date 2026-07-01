import express from 'express';
import { requireAuth } from '#app/api/middlewares/auth.js';
import { settingsService } from '#app/pkg/settings/service.js';

const router = express.Router();

router.use(requireAuth);

// GET /api/settings
router.get('/', (req, res) => {
  res.json(settingsService.getStatus());
});

// PUT /api/settings
router.put('/', (req, res) => {
  const status = settingsService.update(req.body || {});
  res.json({ success: true, ...status });
});

export default router;
