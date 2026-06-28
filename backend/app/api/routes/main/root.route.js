import express from 'express';

const router = express.Router();

// GET /health
router.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'AI Meeting Summarizer' });
});

export default router;
