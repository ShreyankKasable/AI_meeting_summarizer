import express from 'express';
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

// Validate :id once for every route below (runs before any route-specific
// middleware, including multer) and load the meeting onto req.meeting. This
// rejects non-numeric ids — e.g. path-traversal payloads like `4%2f..%2f..` —
// before they ever reach the audio-upload filename builder. Also enforces
// that the meeting belongs to the authenticated host — 404 rather than 403
// so we don't leak the existence of other hosts' meetings.
router.param('id', (req, res, next, value) => {
  if (!/^\d+$/.test(value)) return next(new BadRequest('Invalid meeting id'));
  const meeting = meetingsService.getMeetingById(Number(value));
  if (!meeting || meeting.host_id !== req.user.id) return next(new NotFound('Meeting not found'));
  req.meeting = meeting;
  return next();
});

const MAX_AUDIO_BYTES = 200 * 1024 * 1024; // 200MB — generous headroom for a long 16kHz mono WAV

// Multer storage for browser audio uploads → data/audio/<meeting|chunk>_<id>_<ts>.wav
const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.paths.AUDIO_DIR),
    filename: (req, file, cb) => {
      const prefix = req.path.endsWith('/audio-chunk') ? 'chunk' : 'meeting';
      cb(null, `${prefix}_${req.params.id}_${Date.now()}.wav`);
    },
  }),
  limits: { fileSize: MAX_AUDIO_BYTES },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('audio/')) return cb(new BadRequest(`Unsupported file type: ${file.mimetype}`));
    return cb(null, true);
  },
});

// Wraps multer's callback-style middleware so its errors (bad mimetype,
// file-too-large) become clean AppErrors instead of raw MulterErrors.
function uploadAudio (req, res, next) {
  audioUpload.single('audio')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) return next(new BadRequest(err.message));
    return next(err);
  });
}

// GET /api/meetings
router.get('/', (req, res) => {
  res.json(meetingsService.getAllMeetings({ hostId: req.user.id }));
});

// GET /api/meetings/:id
router.get('/:id', (req, res) => {
  res.json(req.meeting);
});

// GET /api/meetings/:id/action-items
router.get('/:id/action-items', (req, res) => {
  res.json(meetingsService.getActionItemsByMeeting(Number(req.params.id)));
});

// POST /api/meetings/:id/audio — browser flow: upload the full recording WAV,
// then run the same processing pipeline as the desktop stop_recording path.
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

// POST /api/meetings/:id/audio-chunk — browser flow: live transcription chunk.
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

// PUT /api/meetings/:id/title
router.put('/:id/title', validateTitlePayload, (req, res) => {
  const updated = meetingsService.updateMeetingTitle(Number(req.params.id), req.body.title);
  return res.json({ success: true, meeting: updated });
});

// POST /api/meetings/:id/translate
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

// GET /api/meetings/:id/chat — chat history for this meeting. Scoped to the
// authenticated host's own thread — a different host (or a participant) on
// the same meeting has a separate thread, not this one.
router.get('/:id/chat', (req, res) => {
  res.json(chatbotService.getHistory(Number(req.params.id), `host:${req.user.id}`));
});

// POST /api/meetings/:id/chat — ask a question; the LLM tool-calls the
// transcript before answering.
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

// POST /api/meetings/:id/export-notion
router.post('/:id/export-notion', async (req, res, next) => {
  try {
    if (!notionService.isAuthenticated()) throw new UnauthorizedRequest('Notion not configured');
    const pageId = await notionService.exportMeeting(req.meeting);
    res.json({ success: true, page_id: pageId, message: 'Meeting exported to Notion successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/meetings/:id/speakers — tag a diarized "Speaker N" label with a
// real name for this meeting's transcript.
router.put('/:id/speakers', validateSpeakerNamePayload, (req, res) => {
  const updated = meetingsService.renameSpeaker(Number(req.params.id), req.body.speaker, req.body.name);
  res.json({ success: true, meeting: updated });
});

// GET /api/meetings/:id/share — the currently active share link, if any
router.get('/:id/share', (req, res) => {
  res.json({ share: sharesService.getActiveShare(Number(req.params.id)) });
});

// POST /api/meetings/:id/share — create a new share link (or return the
// existing active one if the host didn't ask to force a fresh one)
router.post('/:id/share', (req, res) => {
  const expiresIn = ['never', '7d', '30d'].includes(req.body?.expires_in) ? req.body.expires_in : 'never';
  const existing = sharesService.getActiveShare(Number(req.params.id));
  const share = existing || sharesService.createShare(Number(req.params.id), expiresIn);
  res.json({ success: true, share });
});

// POST /api/meetings/:id/share/revoke
router.post('/:id/share/revoke', (req, res) => {
  sharesService.revokeShare(Number(req.params.id));
  res.json({ success: true });
});

// POST /api/meetings/:id/share/regenerate
router.post('/:id/share/regenerate', (req, res) => {
  const expiresIn = ['never', '7d', '30d'].includes(req.body?.expires_in) ? req.body.expires_in : 'never';
  const share = sharesService.regenerateShare(Number(req.params.id), expiresIn);
  res.json({ success: true, share });
});

export default router;
