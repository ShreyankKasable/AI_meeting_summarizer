import express from 'express';
import { NotFound } from '#app/common/error/index.js';
import { requireAuth } from '#app/api/middlewares/auth.js';
import { meetingsService } from '#app/pkg/meetings/service.js';

const router = express.Router();

router.use(requireAuth);

// PUT /api/action-items/:id/complete — toggle completion
router.put('/:id/complete', (req, res, next) => {
  const item = meetingsService.getActionItemById(Number(req.params.id));
  if (!item) return next(new NotFound('Action item not found'));

  const meeting = meetingsService.getMeetingById(item.meeting_id);
  if (!meeting || meeting.host_id !== req.user.id) return next(new NotFound('Action item not found'));

  return res.json(meetingsService.markActionItemComplete(Number(req.params.id), !item.completed));
});

export default router;
