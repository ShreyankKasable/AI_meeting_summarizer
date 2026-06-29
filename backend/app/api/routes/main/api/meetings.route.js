import express from 'express';
import multer from 'multer';
import { expressAsyncHandler } from '#app/api/middlewares/asyncHandler.js';
import { NotFound, UnauthorizedRequest, BadRequest } from '#app/common/error/index.js';
import config from '#app/common/config.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { translationService } from '#app/pkg/translation/service.js';
import { calendarService } from '#app/pkg/calendar/service.js';
import { notionService } from '#app/pkg/notion/service.js';
import { jiraService } from '#app/pkg/jira/service.js';
import { processingService } from '#app/pkg/processing/service.js';
import { getIo } from '#app/connections/websocket.js';
import { validateTitlePayload, validateTranslatePayload } from '#app/pkg/meetings/validation.js';

const router = express.Router();

// Multer storage for browser audio uploads → data/audio/<meeting|chunk>_<id>_<ts>.wav
const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, config.paths.AUDIO_DIR),
    filename: (req, file, cb) => {
      const prefix = req.path.endsWith('/audio-chunk') ? 'chunk' : 'meeting';
      cb(null, `${prefix}_${req.params.id}_${Date.now()}.wav`);
    },
  }),
});

// GET /api/meetings
router.get('/', (req, res) => {
  res.json(meetingsService.getAllMeetings());
});

// GET /api/meetings/:id
router.get('/:id', (req, res, next) => {
  const meeting = meetingsService.getMeetingById(Number(req.params.id));
  if (!meeting) return next(new NotFound('Meeting not found'));
  return res.json(meeting);
});

// GET /api/meetings/:id/action-items
router.get('/:id/action-items', (req, res) => {
  res.json(meetingsService.getActionItemsByMeeting(Number(req.params.id)));
});

// POST /api/meetings/:id/audio — browser flow: upload the full recording WAV,
// then run the same processing pipeline as the desktop stop_recording path.
router.post('/:id/audio', audioUpload.single('audio'), expressAsyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequest('No audio file uploaded');
  const result = await processingService.processRecording({
    io: getIo(),
    meetingId: Number(req.params.id),
    audioFile: req.file.path,
  });
  res.json({ success: true, ...result });
}));

// POST /api/meetings/:id/audio-chunk — browser flow: live transcription chunk.
router.post('/:id/audio-chunk', audioUpload.single('audio'), expressAsyncHandler(async (req, res) => {
  if (!req.file) throw new BadRequest('No audio chunk uploaded');
  await processingService.processLiveChunk({
    io: getIo(),
    meetingId: Number(req.params.id),
    chunkFile: req.file.path,
  });
  res.json({ success: true });
}));

// PUT /api/meetings/:id/title
router.put('/:id/title', validateTitlePayload, (req, res, next) => {
  const meeting = meetingsService.getMeetingById(Number(req.params.id));
  if (!meeting) return next(new NotFound('Meeting not found'));
  const updated = meetingsService.updateMeetingTitle(Number(req.params.id), req.body.title);
  return res.json({ success: true, meeting: updated });
});

// POST /api/meetings/:id/translate
router.post('/:id/translate', validateTranslatePayload, expressAsyncHandler(async (req, res) => {
  const meeting = meetingsService.getMeetingById(Number(req.params.id));
  if (!meeting) throw new NotFound('Meeting not found');

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

// POST /api/meetings/:id/sync-all-calendar
router.post('/:id/sync-all-calendar', expressAsyncHandler(async (req, res) => {
  const meeting = meetingsService.getMeetingById(Number(req.params.id));
  if (!meeting) throw new NotFound('Meeting not found');
  if (!calendarService.isAuthenticated()) throw new UnauthorizedRequest('Not authenticated with Google Calendar');

  let syncedCount = 0;
  const errors = [];
  for (const item of meeting.action_items) {
    if (item.synced_to_calendar) continue;
    try {
      const eventId = await calendarService.syncActionItem(item); // eslint-disable-line no-await-in-loop
      meetingsService.updateActionItemSyncStatus(item.id, { calendar: true, externalId: eventId });
      syncedCount += 1;
    } catch (e) {
      errors.push(`Item ${item.id}: ${e.message}`);
    }
  }
  res.json({ success: true, synced_count: syncedCount, total_items: meeting.action_items.length, errors });
}));

// POST /api/meetings/:id/export-notion
router.post('/:id/export-notion', expressAsyncHandler(async (req, res) => {
  const meeting = meetingsService.getMeetingById(Number(req.params.id));
  if (!meeting) throw new NotFound('Meeting not found');
  if (!notionService.isAuthenticated()) throw new UnauthorizedRequest('Notion not configured');
  const pageId = await notionService.exportMeeting(meeting);
  res.json({ success: true, page_id: pageId, message: 'Meeting exported to Notion successfully' });
}));

// POST /api/meetings/:id/sync-all-jira
router.post('/:id/sync-all-jira', expressAsyncHandler(async (req, res) => {
  const meeting = meetingsService.getMeetingById(Number(req.params.id));
  if (!meeting) throw new NotFound('Meeting not found');
  if (!jiraService.isAuthenticated()) throw new UnauthorizedRequest('Jira not configured');

  let syncedCount = 0;
  const errors = [];
  for (const item of meeting.action_items) {
    if (item.synced_to_jira) continue;
    try {
      const issueKey = await jiraService.syncActionItem(item); // eslint-disable-line no-await-in-loop
      meetingsService.updateActionItemSyncStatus(item.id, { jira: true, externalId: issueKey });
      syncedCount += 1;
    } catch (e) {
      errors.push(`Item ${item.id}: ${e.message}`);
    }
  }
  res.json({ success: true, synced_count: syncedCount, total_items: meeting.action_items.length, errors });
}));

export default router;
