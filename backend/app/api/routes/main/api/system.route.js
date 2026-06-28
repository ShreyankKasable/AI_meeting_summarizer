import express from 'express';
import { systemService } from '#app/pkg/system/service.js';

const router = express.Router();

// GET /api/system/status
router.get('/status', (req, res) => {
  res.json(systemService.status());
});

// GET /api/system/models
router.get('/models', (req, res) => {
  res.json(systemService.models());
});

export default router;
