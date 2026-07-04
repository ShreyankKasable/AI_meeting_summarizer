/**
 * Token-gated, unauthenticated routes for participants holding a share link.
 * Deliberately read-only and kept on a separate path prefix (`/api/public`)
 * from the `requireAuth`-protected `/api/meetings/*` routes, so there's no
 * risk of the two auth modes crossing.
 */
import express from 'express';
import { NotFound, BadRequest } from '#app/common/error/index.js';
import { sharesService } from '#app/pkg/shares/service.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { chatbotService } from '#app/pkg/chat/service.js';
import { translationService } from '#app/pkg/translation/service.js';
import { validateTranslatePayload, validateChatPayload } from '#app/pkg/meetings/validation.js';

const router = express.Router();

router.param('token', (req, res, next, value) => {
  const share = sharesService.resolveToken(value);
  if (!share) return next(new NotFound('Invalid or expired link'));
  const meeting = meetingsService.getMeetingById(share.meeting_id);
  if (!meeting) return next(new NotFound('Invalid or expired link'));
  req.share = share;
  req.meeting = meeting;
  return next();
});

// Participants aren't authenticated, so each browser generates a random id
// (persisted client-side) and sends it here — this is what gives each
// participant their own private chat thread instead of sharing one with
// every other participant (and the host) on the same meeting.
function requireParticipantId (req, res, next) {
  const participantId = req.headers['x-participant-id'];
  if (!participantId || typeof participantId !== 'string' || participantId.length > 100) {
    return next(new BadRequest('Missing X-Participant-Id header'));
  }
  req.actorKey = `participant:${participantId}`;
  return next();
}

// GET /api/public/share/:token — read-only meeting content
router.get('/:token', (req, res) => {
  res.json(req.meeting);
});

// GET /api/public/share/:token/chat
router.get('/:token/chat', requireParticipantId, (req, res) => {
  res.json(chatbotService.getHistory(req.meeting.id, req.actorKey));
});

// POST /api/public/share/:token/chat
router.post('/:token/chat', requireParticipantId, validateChatPayload, async (req, res, next) => {
  try {
    const answer = await chatbotService.ask(req.meeting.id, req.body.question, req.body.provider, req.actorKey);
    res.json({ success: true, answer });
  } catch (err) {
    next(err);
  }
});

// POST /api/public/share/:token/translate
router.post('/:token/translate', validateTranslatePayload, async (req, res, next) => {
  try {
    const transcriptText = req.meeting.transcript && typeof req.meeting.transcript === 'object'
      ? req.meeting.transcript.text || ''
      : req.meeting.transcript || '';
    if (!transcriptText) throw new BadRequest('No transcript available');

    const translatedTranscript = await translationService.translateText(transcriptText, req.body.language);
    const translatedSummary = req.meeting.summary
      ? await translationService.translateText(req.meeting.summary, req.body.language)
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

export default router;
