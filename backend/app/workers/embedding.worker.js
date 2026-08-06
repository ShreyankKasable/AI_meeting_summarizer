import { Worker } from 'bullmq';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';
import { EMBEDDING_STATUS } from '#app/common/constants.js';
import { EMBEDDING_JOB_NAME, EMBEDDING_QUEUE_NAME } from '#app/queues/constants.js';
import { getRedisConnection } from '#app/queues/redis.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { ragService } from '#app/pkg/rag/service.js';

export function createEmbeddingWorker () {
  const worker = new Worker(
    EMBEDDING_QUEUE_NAME,
    processEmbeddingJob,
    {
      connection: getRedisConnection({ worker: true }),
      concurrency: Math.max(1, Number(config.get('queues.embeddings.concurrency')) || 2),
    },
  );

  worker.on('completed', (job) => {
    logger.info(`Embedding job completed: ${job.id}`);
  });

  worker.on('failed', (job, error) => {
    logger.error(`Embedding job failed: ${job?.id || 'unknown'}`, error.message);
  });

  worker.on('error', (error) => {
    logger.error('Embedding worker Redis error:', error.message);
  });

  return worker;
}

async function processEmbeddingJob (job) {
  if (job.name !== EMBEDDING_JOB_NAME) {
    throw new Error(`Unsupported embedding job name: ${job.name}`);
  }

  const { meetingId } = job.data;
  if (!meetingId) throw new Error('Embedding job is missing meetingId');

  await job.updateProgress(5);
  await meetingsService.updateEmbeddingStatus(meetingId, EMBEDDING_STATUS.PROCESSING, {
    jobId: String(job.id),
  });

  try {
    const meeting = await meetingsService.getMeetingById(meetingId);
    if (!meeting) {
      logger.warn(`Embedding job ${job.id} skipped because meeting ${meetingId} no longer exists`);
      return { meetingId, status: EMBEDDING_STATUS.SKIPPED, reason: 'meeting_deleted' };
    }

    if (!meeting.transcript) {
      await meetingsService.updateEmbeddingStatus(meetingId, EMBEDDING_STATUS.SKIPPED, {
        error: 'Meeting has no transcript to index',
        jobId: String(job.id),
      });
      return { meetingId, status: EMBEDDING_STATUS.SKIPPED, reason: 'missing_transcript' };
    }

    await job.updateProgress(30);
    const chunks = await ragService.indexMeetingTranscript(meetingId, meeting.transcript);

    await job.updateProgress(100);
    await meetingsService.updateEmbeddingStatus(meetingId, EMBEDDING_STATUS.COMPLETED, {
      jobId: String(job.id),
    });

    return {
      meetingId,
      status: EMBEDDING_STATUS.COMPLETED,
      chunks: chunks.length,
    };
  } catch (error) {
    await meetingsService.updateEmbeddingStatus(meetingId, EMBEDDING_STATUS.FAILED, {
      error: error.message,
      jobId: String(job.id),
    });
    throw error;
  }
}
