import cors from 'cors';

/**
 * CORS handler. Reflect the request origin so credentialed cookie requests work
 * in development when the frontend is served from Vite.
 */
export const corsHandler = cors({ origin: true, credentials: true });
