/**
 * Express app factory (neo style). Builds the app for a given server type,
 * dynamically mounting that server's route tree from api/routes/{serverType}.
 */
import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { corsHandler } from '#app/api/middlewares/cors.js';
import { errorHandler } from '#app/api/middlewares/errorhandler.js';
import { NotFound } from '#app/common/error/index.js';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';

export async function getAppServer (serverType = 'main') {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.set('trust proxy', true);
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(corsHandler);

  // Serve the frontend so the app can run in a browser at http://localhost:5000
  // (the Electron renderer loads the same files from disk via file://).
  app.use(express.static(path.join(config.paths.BASE_DIR, 'frontend')));
  // Vendored browser libraries (axios) for the browser flow.
  app.use('/vendor', express.static(path.join(config.paths.BASE_DIR, 'node_modules', 'axios', 'dist')));

  let routes;
  try {
    routes = await import(`./api/routes/${serverType}/index.js`);
  } catch (error) {
    logger.error(error);
    throw error;
  }
  if (routes) app.use(routes.default);

  // 404 + error handlers
  app.use((req, res, next) => next(new NotFound(`not found: ${req.originalUrl}`)));
  app.use(errorHandler);

  return app;
}
