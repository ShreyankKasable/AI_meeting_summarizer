import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import config from '#app/common/config.js';
import { NotFound } from '#app/common/error/index.js';
import { recordingStorageService } from '#app/pkg/storage/recording.service.js';

const router = express.Router();

// GET /data/audio/:filename - serve local recordings or stream R2-backed ones.
router.get('/:filename', async (req, res, next) => {
  // path.basename strips any directory components (incl. `..` and `\`
  // segments), so a crafted filename can't escape AUDIO_DIR.
  const safeName = path.basename(req.params.filename);
  const filePath = path.join(config.paths.AUDIO_DIR, safeName);
  if (fs.existsSync(filePath)) return res.sendFile(filePath);

  try {
    const streamed = await recordingStorageService.streamRecording(req.params.filename, req, res);
    if (streamed) return undefined;
    return next(new NotFound('Audio file not found'));
  } catch (error) {
    return next(error);
  }
});

export default router;
