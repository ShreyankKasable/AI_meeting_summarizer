import { Queue } from 'bullmq';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';
import { EMBEDDING_STATUS } from '#app/common/constants.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { getRedisConnection } from '#app/queues/redis.js';
import { EMBEDDING_JOB_NAME, EMBEDDING_QUEUE_NAME } from '#app/queues/constants.js';

export const embeddingQueue = new Queue(EMBEDDING_QUEUE_NAME, {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: Math.max(1, Number(config.get('queues.embeddings.attempts')) || 3),
    backoff: {
      type: 'exponential',
      delay: Math.max(1000, Number(config.get('queues.embeddings.backoff_ms')) || 5000),
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

embeddingQueue.on('error', (error) => {
  logger.warn(`Embedding queue Redis error: ${error.message}`);
});

export async function enqueueEmbeddingJob ({ meetingId, hostId = null } = {}) {
  if (!meetingId) throw new Error('meetingId is required to enqueue an embedding job');

  const jobId = `meeting_embedding_${meetingId}`;
  const existingJob = await embeddingQueue.getJob(jobId);

  if (existingJob) {
    const state = await existingJob.getState();
    if (['completed', 'failed'].includes(state)) {
      await existingJob.remove();
    } else {
      await meetingsService.updateEmbeddingStatus(
        meetingId,
        state === 'active' ? EMBEDDING_STATUS.PROCESSING : EMBEDDING_STATUS.QUEUED,
        { jobId: String(existingJob.id) },
      );
      logger.info(`Embedding job ${existingJob.id} already ${state} for meeting ${meetingId}`);
      return existingJob;
    }
  }

  const job = await embeddingQueue.add(
    EMBEDDING_JOB_NAME,
    { meetingId, hostId },
    { jobId },
  );

  await meetingsService.updateEmbeddingStatus(meetingId, EMBEDDING_STATUS.QUEUED, {
    jobId: String(job.id),
  });

  logger.info(`Queued embedding job ${job.id} for meeting ${meetingId}`);
  return job;
}

export async function closeEmbeddingQueue () {
  await embeddingQueue.close();
}
