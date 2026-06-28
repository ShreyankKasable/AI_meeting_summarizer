import config from '#app/common/config.js';
import logger from '#app/common/logger.js';
import { AppError } from '#app/common/error/index.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = function (err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      errors: err.errors?.length ? err.errors : undefined,
      stack: config.isDebug ? err.stack : undefined,
    });
  }

  const statusCode = err.statusCode || 500;
  const body = { error: err.message || 'An unexpected error occurred' };
  if (config.isDebug) {
    body.stack = err.stack;
    logger.error(err);
  }
  return res.status(statusCode).json(body);
};
