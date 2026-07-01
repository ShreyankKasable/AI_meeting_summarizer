import cors from 'cors';

/**
 * CORS handler. The frontend calls the local backend at 127.0.0.1:5000, so all
 * origins are allowed.
 */
export const corsHandler = cors({ origin: '*' });
