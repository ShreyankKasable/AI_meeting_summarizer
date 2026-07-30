/**
 * Entry point (neo style). Boots the HTTP server + Socket.IO for the
 * AI Meeting Summarizer backend and wires graceful shutdown.
 */
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';
import { getAppServer } from '#app/server.js';
import { initDb, disconnect as disconnectDb } from '#app/connections/database.js';
import { setupSocket, disconnect as disconnectSocket } from '#app/connections/websocket.js';

const startTime = Date.now();

await initDb();

logger.info('='.repeat(60));
logger.info('AI Meeting Summarizer Backend (neo-style)');
logger.info(`Transcription Model: ${config.get('transcription_model')}`);
logger.info(`Deepgram API Key: ${config.get('deepgram.api_key') ? 'SET' : 'NOT SET'}`);
logger.info(`Euron API: ${config.get('euron.enabled') ? 'ENABLED' : 'DISABLED'}`);
logger.info('='.repeat(60));

const app = await getAppServer('main');
const port = config.get('port');
const host = config.get('host');

const httpHandler = app.listen(port, host, () => {
  logger.info(`Server started at http://${host}:${port}`, { duration: `${Date.now() - startTime}ms` });
});

setupSocket(httpHandler);

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const closeHttp = () =>
  new Promise((resolve) => {
    if (!httpHandler?.close) return resolve();
    return httpHandler.close(() => resolve());
  });

const exitHandler = async (signal) => {
  logger.info(`${signal} received: shutting down`);
  await Promise.allSettled([closeHttp(), disconnectSocket(), disconnectDb()]);
  process.exit(0);
};

process.on('SIGTERM', () => exitHandler('SIGTERM'));
process.on('SIGINT', () => exitHandler('SIGINT'));
process.on('uncaughtException', (err) => logger.error('Uncaught exception:', err));
process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection:', reason));
