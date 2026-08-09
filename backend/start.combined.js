/**
 * Single-service production entry point.
 *
 * This runs the HTTP API and embedding worker in the same Node.js process for
 * small deployments where the hosting provider offers one free web service but
 * no free background worker.
 */
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';
import { getAppServer } from '#app/server.js';
import { initDb, disconnect as disconnectDb } from '#app/connections/database.js';
import { setupSocket, disconnect as disconnectSocket } from '#app/connections/websocket.js';
import { closeEmbeddingQueue } from '#app/queues/embedding.queue.js';
import { createEmbeddingWorker } from '#app/workers/embedding.worker.js';

const startTime = Date.now();

await initDb();

logger.info('='.repeat(60));
logger.info('AI Meeting Summarizer Backend + Worker');
logger.info(`Transcription Model: ${config.get('transcription_model')}`);
logger.info(`Deepgram API Key: ${config.get('deepgram.api_key') ? 'SET' : 'NOT SET'}`);
logger.info(`Euron API: ${config.get('euron.enabled') ? 'ENABLED' : 'DISABLED'}`);
logger.info('='.repeat(60));

const app = await getAppServer('main');
const port = config.get('port');
const host = config.get('host');
const embeddingWorker = createEmbeddingWorker();

logger.info('Embedding worker started in combined backend process');

const httpHandler = app.listen(port, host, () => {
  logger.info(`Server started at http://${host}:${port}`, { duration: `${Date.now() - startTime}ms` });
});

setupSocket(httpHandler);

const closeHttp = () =>
  new Promise((resolve) => {
    if (!httpHandler?.close) return resolve();
    return httpHandler.close(() => resolve());
  });

const exitHandler = async (signal) => {
  logger.info(`${signal} received: shutting down combined backend process`);
  await Promise.allSettled([
    closeHttp(),
    disconnectSocket(),
    embeddingWorker.close(),
    closeEmbeddingQueue(),
    disconnectDb(),
  ]);
  process.exit(0);
};

process.on('SIGTERM', () => exitHandler('SIGTERM'));
process.on('SIGINT', () => exitHandler('SIGINT'));
process.on('uncaughtException', (error) => logger.error('Combined backend uncaught exception:', error));
process.on('unhandledRejection', (reason) => logger.error('Combined backend unhandled rejection:', reason));
