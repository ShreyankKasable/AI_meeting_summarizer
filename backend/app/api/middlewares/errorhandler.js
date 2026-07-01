import logger from '#app/common/logger.js';
import { AppError } from '#app/common/error/index.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = function (err, req, res, next) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error(err);
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      errors: err.errors?.length ? err.errors : undefined,
    });
  }

  logger.error(err);
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({ error: err.message || 'An unexpected error occurred' });
};
