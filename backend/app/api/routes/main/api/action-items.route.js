import express from 'express';
import { NotFound } from '#app/common/error/index.js';
import { requireAuth } from '#app/api/middlewares/auth.js';
import { meetingsService } from '#app/pkg/meetings/service.js';

const router = express.Router();

router.use(requireAuth);

router.put('/:id/complete', async (req, res, next) => {
  try {
    const item = await meetingsService.getActionItemById(Number(req.params.id));
    if (!item) return next(new NotFound('Action item not found'));

    const meeting = await meetingsService.getMeetingById(item.meeting_id);
    if (!meeting || meeting.host_id !== req.user.id) return next(new NotFound('Action item not found'));

    return res.json(await meetingsService.markActionItemComplete(Number(req.params.id), !item.completed));
  } catch (err) {
    return next(err);
  }
});

export default router;
