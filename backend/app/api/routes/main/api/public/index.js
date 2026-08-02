/**
 * Mounts signed-in, token-gated participant routes under /api/public.
 * The path remains /public for share-link compatibility.
 */
import express from 'express';
import shareRoutes from './share.route.js';

const router = express.Router();

router.use('/share', shareRoutes);

export default router;
