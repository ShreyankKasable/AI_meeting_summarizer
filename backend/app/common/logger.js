/**
 * Application logger.
 *
 * Neo uses `fit/tracing` for structured logging; this service uses a small
 * console-backed logger that exposes the same `info/warn/error/debug` surface so
 * call sites are identical to neo's.
 */
const ts = () => new Date().toISOString();

const write = (level, args) => {
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(`[${ts()}] ${level.toUpperCase()}`, ...args);
};

const logger = {
  info: (...args) => write('info', args),
  warn: (...args) => write('warn', args),
  error: (...args) => write('error', args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') write('debug', args);
  },
};

export default logger;
