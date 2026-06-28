/**
 * Wraps an async route handler so rejected promises are forwarded to Express's
 * error middleware (neo parity).
 */
export const expressAsyncHandler = (fn) =>
  function asyncUtilWrap (...args) {
    const next = args[args.length - 1];
    return Promise.resolve(fn(...args)).catch((err) => next(err));
  };
