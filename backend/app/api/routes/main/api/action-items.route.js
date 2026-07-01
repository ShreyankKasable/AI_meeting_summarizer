import express from 'express';
import { NotFound } from '#app/common/error/index.js';
import { meetingsService } from '#app/pkg/meetings/service.js';

const router = express.Router();

// PUT /api/action-items/:id/complete — toggle completion
router.put('/:id/complete', (req, res, next) => {
  const item = meetingsService.getActionItemById(Number(req.params.id));
  if (!item) return next(new NotFound('Action item not found'));
  return res.json(meetingsService.markActionItemComplete(Number(req.params.id), !item.completed));
});

export default router;
