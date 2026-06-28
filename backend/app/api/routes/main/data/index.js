/**
 * Auto-loads the /data routes (audio file serving).
 */
import express from 'express';
import { getRouteFiles } from '#app/common/utils/file.util.js';

const router = express.Router();

for (const file of getRouteFiles(import.meta.url)) {
  const routePath = file.split('.')[0];
  const m = await import(`./${file}`);
  router.use(routePath === 'root' ? '/' : `/${routePath}`, m.default);
}

export default router;
