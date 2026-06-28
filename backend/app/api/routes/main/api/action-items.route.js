import express from 'express';
import { expressAsyncHandler } from '#app/api/middlewares/asyncHandler.js';
import { NotFound, UnauthorizedRequest } from '#app/common/error/index.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { calendarService } from '#app/pkg/calendar/service.js';
import { jiraService } from '#app/pkg/jira/service.js';

const router = express.Router();

// PUT /api/action-items/:id/complete — toggle completion
router.put('/:id/complete', (req, res, next) => {
  const item = meetingsService.getActionItemById(Number(req.params.id));
  if (!item) return next(new NotFound('Action item not found'));
  return res.json(meetingsService.markActionItemComplete(Number(req.params.id), !item.completed));
});

// POST /api/action-items/:id/sync-calendar
router.post('/:id/sync-calendar', expressAsyncHandler(async (req, res) => {
  const item = meetingsService.getActionItemById(Number(req.params.id));
  if (!item) throw new NotFound('Action item not found');
  if (!calendarService.isAuthenticated()) throw new UnauthorizedRequest('Not authenticated with Google Calendar');
  const eventId = await calendarService.syncActionItem(item);
  const updated = meetingsService.updateActionItemSyncStatus(Number(req.params.id), { calendar: true, externalId: eventId });
  res.json({ success: true, event_id: eventId, action_item: updated });
}));

// POST /api/action-items/:id/sync-jira
router.post('/:id/sync-jira', expressAsyncHandler(async (req, res) => {
  const item = meetingsService.getActionItemById(Number(req.params.id));
  if (!item) throw new NotFound('Action item not found');
  if (!jiraService.isAuthenticated()) throw new UnauthorizedRequest('Jira not configured');
  const issueKey = await jiraService.syncActionItem(item);
  const updated = meetingsService.updateActionItemSyncStatus(Number(req.params.id), { jira: true, externalId: issueKey });
  res.json({ success: true, issue_key: issueKey, action_item: updated });
}));

export default router;
