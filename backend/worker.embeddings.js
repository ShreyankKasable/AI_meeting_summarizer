import logger from '#app/common/logger.js';
import { initDb, disconnect as disconnectDb } from '#app/connections/database.js';
import { createEmbeddingWorker } from '#app/workers/embedding.worker.js';

await initDb();

const worker = createEmbeddingWorker();
logger.info('Embedding worker process started');

async function shutdown (signal) {
  logger.info(`${signal} received: shutting down embedding worker`);
  await Promise.allSettled([worker.close(), disconnectDb()]);
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (error) => logger.error('Embedding worker uncaught exception:', error));
process.on('unhandledRejection', (reason) => logger.error('Embedding worker unhandled rejection:', reason));
