import express from 'express';
import crypto from 'node:crypto';
import multer from 'multer';
import { NotFound, UnauthorizedRequest, BadRequest } from '#app/common/error/index.js';
import config from '#app/common/config.js';
import { requireAuth } from '#app/api/middlewares/auth.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { translationService } from '#app/pkg/translation/service.js';
import { notionService } from '#app/pkg/notion/service.js';
import { processingService } from '#app/pkg/processing/service.js';
import { chatbotService } from '#app/pkg/chat/service.js';
import { sharesService } from '#app/pkg/shares/service.js';
import { getIo } from '#app/connections/websocket.js';
import {
  validateTitlePayload, validateTranslatePayload, validateChatPayload, validateSpeakerNamePayload,
} from '#app/pkg/meetings/validation.js';

const router = express.Router();

router.use(requireAuth);

router.param('id', async (req, res, next, value) => {
  try {
    if (!/^\d+$/.test(value)) return next(new BadRequest('Invalid meeting id'));
    const meeting = await meetingsService.getMeetingById(Number(value));
    if (!meeting || meeting.host_id !== req.user.id) return next(new NotFound('Meeting not found'));
    req.meeting = meeting;
    return next();
  } catch (err) {
    return next(err);
  }
});

const MAX_AUDIO_BYTES = 200 * 1024 * 1024;

const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.paths.AUDIO_DIR),
    filename: (req, file, cb) => {
      const prefix = req.path.endsWith('/audio-chunk') ? 'chunk' : 'meeting';
      cb(null, `${prefix}_${req.params.id}_${Date.now()}_${crypto.randomUUID()}.wav`);
    },
  }),
  limits: { fileSize: MAX_AUDIO_BYTES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('audio/')) return cb(new BadRequest(`Unsupported file type: ${file.mimetype}`));
    return cb(null, true);
  },
});

function uploadAudio (req, res, next) {
  audioUpload.single('audio')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) return next(new BadRequest(err.message));
    return next(err);
  });
}

router.get('/', async (req, res, next) => {
  try {
    res.json(await meetingsService.getAllMeetings({ hostId: req.user.id }));
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res) => {
  res.json(req.meeting);
});

router.delete('/:id', async (req, res, next) => {
  try {
    await meetingsService.deleteMeeting(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/action-items', async (req, res, next) => {
  try {
    res.json(await meetingsService.getActionItemsByMeeting(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/audio', uploadAudio, async (req, res, next) => {
  try {
    if (!req.file) throw new BadRequest('No audio file uploaded');
    const result = await processingService.processRecording({
      io: getIo(),
      hostId: req.user.id,
      meetingId: Number(req.params.id),
      audioFile: req.file.path,
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/audio-chunk', uploadAudio, async (req, res, next) => {
  try {
    if (!req.file) throw new BadRequest('No audio chunk uploaded');
    await processingService.processLiveChunk({
      io: getIo(),
      hostId: req.user.id,
      meetingId: Number(req.params.id),
      chunkFile: req.file.path,
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/title', validateTitlePayload, async (req, res, next) => {
  try {
    const updated = await meetingsService.updateMeetingTitle(Number(req.params.id), req.body.title);
    return res.json({ success: true, meeting: updated });
  } catch (err) {
    return next(err);
  }
});

router.post('/:id/translate', validateTranslatePayload, async (req, res, next) => {
  try {
    const { meeting } = req;
    const transcriptText = meeting.transcript && typeof meeting.transcript === 'object'
      ? meeting.transcript.text || ''
      : meeting.transcript || '';
    if (!transcriptText) throw new BadRequest('No transcript available');

    const translatedTranscript = await translationService.translateText(transcriptText, req.body.language);
    const translatedSummary = meeting.summary
      ? await translationService.translateText(meeting.summary, req.body.language)
      : null;

    res.json({
      success: true,
      language: req.body.language,
      translated_transcript: translatedTranscript,
      translated_summary: translatedSummary,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/chat', async (req, res, next) => {
  try {
    res.json(await chatbotService.getHistory(Number(req.params.id), `host:${req.user.id}`));
  } catch (err) {
    next(err);
  }
});

router.post('/:id/chat', validateChatPayload, async (req, res, next) => {
  try {
    const answer = await chatbotService.ask(
      Number(req.params.id), req.body.question, req.body.provider, `host:${req.user.id}`
    );
    res.json({ success: true, answer });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/export-notion', async (req, res, next) => {
  try {
    if (!notionService.isAuthenticated()) throw new UnauthorizedRequest('Notion not configured');
    const pageId = await notionService.exportMeeting(req.meeting);
    res.json({ success: true, page_id: pageId, message: 'Meeting exported to Notion successfully' });
  } catch (err) {
    next(err);
  }
});

router.put('/:id/speakers', validateSpeakerNamePayload, async (req, res, next) => {
  try {
    const updated = await meetingsService.renameSpeaker(Number(req.params.id), req.body.speaker, req.body.name);
    res.json({ success: true, meeting: updated });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/share', async (req, res, next) => {
  try {
    res.json({ share: await sharesService.getActiveShare(Number(req.params.id)) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/share/access', async (req, res, next) => {
  try {
    res.json({ access: await sharesService.getAccessByMeeting(Number(req.params.id)) });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/share/access/:userId/approve', async (req, res, next) => {
  try {
    const access = await sharesService.approveAccess(Number(req.params.id), parseUserId(req.params.userId));
    if (!access) throw new NotFound('Access request not found');
    res.json({ success: true, access });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/share/access/:userId/reject', async (req, res, next) => {
  try {
    const access = await sharesService.rejectAccess(Number(req.params.id), parseUserId(req.params.userId));
    if (!access) throw new NotFound('Access request not found');
    res.json({ success: true, access });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/share/access/:userId', async (req, res, next) => {
  try {
    const access = await sharesService.removeAccess(Number(req.params.id), parseUserId(req.params.userId));
    if (!access) throw new NotFound('Access request not found');
    res.json({ success: true, access });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/share', async (req, res, next) => {
  try {
    const expiresIn = ['never', '7d', '30d'].includes(req.body?.expires_in) ? req.body.expires_in : 'never';
    const existing = await sharesService.getActiveShare(Number(req.params.id));
    const share = existing || await sharesService.createShare(Number(req.params.id), expiresIn);
    res.json({ success: true, share });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/share/revoke', async (req, res, next) => {
  try {
    await sharesService.revokeShare(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/share/regenerate', async (req, res, next) => {
  try {
    const expiresIn = ['never', '7d', '30d'].includes(req.body?.expires_in) ? req.body.expires_in : 'never';
    const share = await sharesService.regenerateShare(Number(req.params.id), expiresIn);
    res.json({ success: true, share });
  } catch (err) {
    next(err);
  }
});

function parseUserId (value) {
  if (!/^\d+$/.test(String(value))) throw new BadRequest('Invalid user id');
  return Number(value);
}

export default router;
