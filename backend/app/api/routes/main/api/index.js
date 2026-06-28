/**
 * Auto-loads the /api resource routes (neo style).
 */
import express from 'express';
import { getDirectories, getRouteFiles } from '#app/common/utils/file.util.js';

const router = express.Router();

for (const dir of getDirectories(import.meta.url)) {
  const m = await import(`./${dir}/index.js`);
  router.use(`/${dir}`, m.default);
}
for (const file of getRouteFiles(import.meta.url)) {
  const routePath = file.split('.')[0];
  const m = await import(`./${file}`);
  router.use(routePath === 'root' ? '/' : `/${routePath}`, m.default);
}

export default router;
