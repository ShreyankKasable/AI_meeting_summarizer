import express from 'express';
import { NotFound, BadRequest, ForbiddenRequest } from '#app/common/error/index.js';
import { sharesService } from '#app/pkg/shares/service.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { chatbotService } from '#app/pkg/chat/service.js';
import { translationService } from '#app/pkg/translation/service.js';
import { requireAuth } from '#app/api/middlewares/auth.js';
import { validateTranslatePayload, validateChatPayload } from '#app/pkg/meetings/validation.js';

const router = express.Router();

router.use(requireAuth);

router.param('token', async (req, res, next, value) => {
  try {
    const share = await sharesService.resolveToken(value, { includeInactive: true });
    if (!share) return next(new NotFound('Invalid or expired link'));
    const meeting = await meetingsService.getMeetingById(share.meeting_id);
    if (!meeting) return next(new NotFound('Invalid or expired link'));
    const shareIsActive = sharesService.isShareActive(share);
    if (!shareIsActive) {
      const access = await sharesService.getUserAccessStatus(share, meeting, req.user);
      if (!access.can_access) return next(new NotFound('Invalid or expired link'));
    }
    req.share = share;
    req.meeting = meeting;
    req.shareIsActive = shareIsActive;
    return next();
  } catch (err) {
    return next(err);
  }
});

function requireParticipantId (req, res, next) {
  const participantId = participantIdFromRequest(req);
  if (!participantId) {
    return next(new BadRequest('Missing X-Participant-Id header'));
  }
  req.participantId = participantId;
  req.actorKey = `participant:${participantId}`;
  return next();
}

router.get('/meetings', async (req, res, next) => {
  try {
    const meetings = await sharesService.getApprovedMeetingsForUser(req.user.id);
    res.json({ meetings });
  } catch (err) {
    next(err);
  }
});

async function requireApprovedAccess (req, res, next) {
  try {
    const access = await sharesService.getUserAccessStatus(req.share, req.meeting, req.user);
    if (!access.can_access) {
      return next(new ForbiddenRequest(accessMessage(access.status)));
    }
    req.participantAccess = access;
    return next();
  } catch (err) {
    return next(err);
  }
}

router.get('/:token/access', async (req, res, next) => {
  try {
    const access = await sharesService.getUserAccessStatus(req.share, req.meeting, req.user);
    res.json(access);
  } catch (err) {
    next(err);
  }
});

router.post('/:token/request', async (req, res, next) => {
  try {
    if (!req.shareIsActive && !isHostRequest(req)) {
      throw new NotFound('Invalid or expired link');
    }

    if (isHostRequest(req)) {
      return res.json({
        success: true,
        status: 'approved',
        can_access: true,
        role: 'host',
        meeting_id: req.meeting.id,
        request: null,
      });
    }

    const request = await sharesService.requestAccess(req.share, req.user);
    return res.json({
      success: true,
      status: request?.status || 'pending',
      can_access: request?.status === 'approved',
      meeting_id: req.meeting.id,
      request,
    });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:token/access', requireApprovedAccess, async (req, res, next) => {
  try {
    if (!isHostRequest(req)) await sharesService.removeAccess(req.meeting.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:token', requireApprovedAccess, async (req, res, next) => {
  try {
    await recordActivity(req, { participantId: participantIdFromRequest(req), activity: 'view' });
    res.json(req.meeting);
  } catch (err) {
    next(err);
  }
});

router.get('/:token/chat', requireApprovedAccess, requireParticipantId, async (req, res, next) => {
  try {
    await recordActivity(req, { participantId: req.participantId, activity: 'chat_history' });
    res.json(await chatbotService.getHistory(req.meeting.id, req.actorKey));
  } catch (err) {
    next(err);
  }
});

router.post('/:token/chat', requireApprovedAccess, requireParticipantId, validateChatPayload, async (req, res, next) => {
  try {
    await recordActivity(req, { participantId: req.participantId, activity: 'chat' });
    const answer = await chatbotService.ask(req.meeting.id, req.body.question, req.body.provider, req.actorKey);
    res.json({ success: true, answer });
  } catch (err) {
    next(err);
  }
});

router.post('/:token/translate', requireApprovedAccess, validateTranslatePayload, async (req, res, next) => {
  try {
    await recordActivity(req, { participantId: participantIdFromRequest(req), activity: 'translate' });
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

function participantIdFromRequest (req) {
  const participantId = req.headers['x-participant-id'];
  if (!participantId || typeof participantId !== 'string' || participantId.length > 100) return null;
  return participantId;
}

async function recordActivity (req, { participantId, activity }) {
  if (isHostRequest(req)) return null;
  return sharesService.recordAccess(req.share, {
    participantId,
    viewer: req.user,
    activity,
    userAgent: req.headers['user-agent'],
  });
}

function isHostRequest (req) {
  return Number(req.meeting?.host_id) === Number(req.user?.id);
}

function accessMessage (status) {
  const messages = {
    pending: 'Access request is waiting for host approval.',
    rejected: 'Access request was declined by the host.',
    removed: 'Your access to this meeting was removed.',
  };
  return messages[status] || 'Request access before opening this meeting.';
}

export default router;
