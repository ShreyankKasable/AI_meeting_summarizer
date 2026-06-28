import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import config from '#app/common/config.js';
import { NotFound } from '#app/common/error/index.js';

const router = express.Router();

// GET /data/audio/:filename — serve recorded WAV files
router.get('/:filename', (req, res, next) => {
  const filePath = path.join(config.paths.AUDIO_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return next(new NotFound('Audio file not found'));
  return res.sendFile(filePath);
});

export default router;
