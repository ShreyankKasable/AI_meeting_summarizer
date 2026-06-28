/**
 * Route auto-loader (neo style). Mounts each subdirectory at `/<dir>` and each
 * `*.route.js` file at `/<name>` (or `/` for root.route.js).
 */
import express from 'express';
import { getDirectories, getRouteFiles } from '#app/common/utils/file.util.js';

const router = express.Router();

const routeDirectories = getDirectories(import.meta.url);
const routeFiles = getRouteFiles(import.meta.url);

for (const dir of routeDirectories) {
  const m = await import(`./${dir}/index.js`);
  router.use(`/${dir}`, m.default);
}
for (const file of routeFiles) {
  const routePath = file.split('.')[0];
  const m = await import(`./${file}`);
  router.use(routePath === 'root' ? '/' : `/${routePath}`, m.default);
}

export default router;
