/**
 * Processing pipeline service — turns a recorded audio file into a transcript,
 * summary and action items, persists them, and broadcasts progress over
 * Socket.IO.
 *
 * Final recordings are processed after the R2 multipart upload completes.
 * Live audio chunks use `processLiveChunk` for partial transcription updates.
 * Progress is broadcast with `io.emit(...)` so any connected browser tab
 * receives it.
 */
import fsp from 'node:fs/promises';
import logger from '#app/common/logger.js';
import { SOCKET_EVENTS, PROCESSING_STATUS, EMBEDDING_STATUS } from '#app/common/constants.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { transcriptionService } from '#app/pkg/transcription/service.js';
import { summarizerService } from '#app/pkg/summarizer/service.js';
import { extractionService } from '#app/pkg/extraction/service.js';
import { audioCompressionService } from '#app/pkg/audio/compression.service.js';
import { recordingStorageService } from '#app/pkg/storage/recording.service.js';
import { enqueueEmbeddingJob } from '#app/queues/embedding.queue.js';

export class ProcessingService {
  async processRecording ({ io, hostId, meetingId, audioFile }) {
    const emit = (event, payload) => { if (io) (hostId ? io.to(`host:${hostId}`) : io).emit(event, payload); };
    logger.info(`Processing recording for meeting ${meetingId}, file: ${audioFile}`);
    let storageAudio = null;
    try {
      emit(SOCKET_EVENTS.PROCESSING_STATUS, { meeting_id: meetingId, ...PROCESSING_STATUS.TRANSCRIBING });
      const transcript = await transcriptionService.transcribe(audioFile);

      emit(SOCKET_EVENTS.PROCESSING_STATUS, { meeting_id: meetingId, ...PROCESSING_STATUS.SUMMARIZING });
      const summary = await summarizerService.summarize(transcript);

      emit(SOCKET_EVENTS.PROCESSING_STATUS, { meeting_id: meetingId, ...PROCESSING_STATUS.EXTRACTING_ACTIONS });
      const rawItems = await extractionService.extract(transcript, summary);
      storageAudio = await audioCompressionService.compressForStorage(audioFile);
      const audioFilePath = await recordingStorageService.persistRecording(storageAudio.filePath, { meetingId });
      await audioCompressionService.removeIfReplaced(audioFile, storageAudio.filePath);

      const meeting = await meetingsService.endMeeting(meetingId, {
        transcript,
        summary: summary || 'No summary generated',
        audioFilePath,
      });

      try {
        await enqueueEmbeddingJob({ meetingId, hostId });
      } catch (error) {
        await meetingsService.updateEmbeddingStatus(meetingId, EMBEDDING_STATUS.FAILED, {
          error: `Queue unavailable: ${error.message}`,
        });
        logger.warn(`Could not enqueue embedding job for meeting ${meetingId}:`, error.message);
      }

      const actionItems = await meetingsService.createActionItems(meetingId, rawItems);

      emit(SOCKET_EVENTS.PROCESSING_STATUS, { meeting_id: meetingId, ...PROCESSING_STATUS.COMPLETE });
      emit(SOCKET_EVENTS.MEETING_PROCESSED, { meeting_id: meetingId, summary, action_items: actionItems, meeting });
      logger.info(`Meeting processed: ${meetingId} | Items: ${actionItems.length}`);
      return { meeting, summary, action_items: actionItems };
    } catch (e) {
      await cleanupFailedRecordingFiles(audioFile, storageAudio?.filePath);
      logger.error('Processing error:', e);
      emit(SOCKET_EVENTS.ERROR, { message: `Processing failed: ${e.message}` });
      throw e;
    }
  }

  async processLiveChunk ({ io, hostId, meetingId, chunkBuffer, chunkMimeType = 'audio/wav', chunkOriginalName = 'chunk.wav' }) {
    if (!Buffer.isBuffer(chunkBuffer) || !chunkBuffer.length) return null;
    try {
      const result = await transcriptionService.transcribeBuffer(chunkBuffer, {
        contentType: chunkMimeType,
        sourceName: chunkOriginalName,
      });
      const text = (result?.text || '').trim();
      if (text) {
        await meetingsService.appendLiveTranscript(meetingId, result);
        if (io) {
          (hostId ? io.to(`host:${hostId}`) : io).emit(SOCKET_EVENTS.LIVE_TRANSCRIPT_UPDATE, { meeting_id: meetingId, text });
        }
      }
      return { text, transcript: result };
    } catch (e) {
      logger.error('[LIVE] Error processing chunk:', e.message);
      return null;
    }
  }

  async processStoredRecording ({ io, hostId, meetingId, audioPathOrKey, cleanupSource = false }) {
    const audioFile = await recordingStorageService.materializeRecordingToTemp(audioPathOrKey);
    if (!audioFile) throw new Error('Could not materialize completed recording for processing');

    let processed = false;
    try {
      const result = await this.processRecording({ io, hostId, meetingId, audioFile });
      processed = true;
      return result;
    } finally {
      await removeFileIfExists(audioFile);
      if (processed && cleanupSource) await recordingStorageService.deleteR2Object(audioPathOrKey);
    }
  }
}

async function cleanupFailedRecordingFiles (audioFile, storageFile) {
  await Promise.all([
    removeFileIfExists(storageFile && storageFile !== audioFile ? storageFile : null),
    removeFileIfExists(audioFile),
  ]);
}

async function removeFileIfExists (filePath) {
  if (!filePath) return;
  try {
    await fsp.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') logger.warn(`Could not delete temporary audio file ${filePath}:`, error.message);
  }
}

export const processingService = new ProcessingService();
