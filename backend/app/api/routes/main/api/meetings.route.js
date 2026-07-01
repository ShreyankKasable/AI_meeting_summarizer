import express from 'express';
import multer from 'multer';
import { expressAsyncHandler } from '#app/api/middlewares/asyncHandler.js';
import { NotFound, UnauthorizedRequest, BadRequest } from '#app/common/error/index.js';
import config from '#app/common/config.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { translationService } from '#app/pkg/translation/service.js';
import { notionService } from '#app/pkg/notion/service.js';
import { processingService } from '#app/pkg/processing/service.js';
import { chatbotService } from '#app/pkg/chat/service.js';
import { getIo } from '#app/connections/websocket.js';
import { validateTitlePayload, validateTranslatePayload, validateChatPayload } from '#app/pkg/meetings/validation.js';

const router = express.Router();

// Validate :id once for every route below (runs before any route-specific
// middleware, including multer) and load the meeting onto req.meeting. This
// rejects non-numeric ids — e.g. path-traversal payloads like `4%2f..%2f..` —
// before they ever reach the audio-upload filename builder.
router.param('id', (req, res, next, value) => {
  if (!/^\d+$/.test(value)) return next(new BadRequest('Invalid meeting id'));
  const meeting = meetingsService.getMeetingById(Number(value));
  if (!meeting) return next(new NotFound('Meeting not found'));
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
  res.json(meetingsService.getAllMeetings());
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
router.post('/:id/audio', uploadAudio, expressAsyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequest('No audio file uploaded');
  const result = await processingService.processRecording({
    io: getIo(),
    meetingId: Number(req.params.id),
    audioFile: req.file.path,
  });
  res.json({ success: true, ...result });
}));

// POST /api/meetings/:id/audio-chunk — browser flow: live transcription chunk.
router.post('/:id/audio-chunk', uploadAudio, expressAsyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequest('No audio chunk uploaded');
  await processingService.processLiveChunk({
    io: getIo(),
    meetingId: Number(req.params.id),
    chunkFile: req.file.path,
  });
  res.json({ success: true });
}));

// PUT /api/meetings/:id/title
router.put('/:id/title', validateTitlePayload, (req, res) => {
  const updated = meetingsService.updateMeetingTitle(Number(req.params.id), req.body.title);
  return res.json({ success: true, meeting: updated });
});

// POST /api/meetings/:id/translate
router.post('/:id/translate', validateTranslatePayload, expressAsyncHandler(async (req, res) => {
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
}));

// GET /api/meetings/:id/chat — chat history for this meeting
router.get('/:id/chat', (req, res) => {
  res.json(chatbotService.getHistory(Number(req.params.id)));
});

// POST /api/meetings/:id/chat — ask a question; the LLM tool-calls the
// transcript before answering.
router.post('/:id/chat', validateChatPayload, expressAsyncHandler(async (req, res) => {
  const answer = await chatbotService.ask(Number(req.params.id), req.body.question, req.body.provider);
  res.json({ success: true, answer });
}));

// POST /api/meetings/:id/export-notion
router.post('/:id/export-notion', expressAsyncHandler(async (req, res) => {
  if (!notionService.isAuthenticated()) throw new UnauthorizedRequest('Notion not configured');
  const pageId = await notionService.exportMeeting(req.meeting);
  res.json({ success: true, page_id: pageId, message: 'Meeting exported to Notion successfully' });
}));

export default router;
