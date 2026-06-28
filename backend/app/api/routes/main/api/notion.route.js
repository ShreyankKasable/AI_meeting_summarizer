import express from 'express';
import { expressAsyncHandler } from '#app/api/middlewares/asyncHandler.js';
import { BadRequest } from '#app/common/error/index.js';
import { notionService } from '#app/pkg/notion/service.js';
import { validateNotionConfigure } from '#app/pkg/notion/validation.js';

const router = express.Router();

// POST /api/notion/configure
router.post('/configure', validateNotionConfigure, expressAsyncHandler(async (req, res) => {
  const { api_key: apiKey, database_id: databaseId } = req.body;
  await notionService.configure(apiKey, databaseId || null);
  try {
    await notionService.testConnection();
  } catch (e) {
    throw new BadRequest(`Notion connection test failed: ${e.message}`);
  }
  res.json({ success: true, message: 'Notion configured successfully' });
}));

// GET /api/notion/status
router.get('/status', (req, res) => {
  res.json({ connected: notionService.isAuthenticated() });
});

export default router;
