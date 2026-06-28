import express from 'express';
import { translationService } from '#app/pkg/translation/service.js';

const router = express.Router();

// GET /api/translation/languages
router.get('/languages', (req, res) => {
  res.json(translationService.getSupportedLanguages());
});

export default router;
