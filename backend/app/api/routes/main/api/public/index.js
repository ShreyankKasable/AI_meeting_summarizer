/**
 * Mounts unauthenticated, token-gated participant routes under /api/public.
 */
import express from 'express';
import shareRoutes from './share.route.js';

const router = express.Router();

router.use('/share', shareRoutes);

export default router;
