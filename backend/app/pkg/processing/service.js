/**
 * Processing pipeline service — turns a recorded audio file into a transcript,
 * summary and action items, persists them, and broadcasts progress over
 * Socket.IO.
 *
 * Shared by the Socket.IO `stop_recording` handler and the REST
 * `POST /api/meetings/:id/audio` upload route, so both entry points run the
 * exact same pipeline. Progress is broadcast with `io.emit(...)` so any
 * connected browser tab receives it.
 */
import fs from 'node:fs';
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
    try {
      emit(SOCKET_EVENTS.PROCESSING_STATUS, { meeting_id: meetingId, ...PROCESSING_STATUS.TRANSCRIBING });
      const transcript = await transcriptionService.transcribe(audioFile);

      emit(SOCKET_EVENTS.PROCESSING_STATUS, { meeting_id: meetingId, ...PROCESSING_STATUS.SUMMARIZING });
      const summary = await summarizerService.summarize(transcript);

      emit(SOCKET_EVENTS.PROCESSING_STATUS, { meeting_id: meetingId, ...PROCESSING_STATUS.EXTRACTING_ACTIONS });
      const rawItems = await extractionService.extract(transcript, summary);
      const storageAudio = await audioCompressionService.compressForStorage(audioFile);
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
      logger.error('Processing error:', e);
      emit(SOCKET_EVENTS.ERROR, { message: `Processing failed: ${e.message}` });
      throw e;
    }
  }

  async processLiveChunk ({ io, hostId, meetingId, chunkFile }) {
    if (!chunkFile) return;
    try {
      const result = await transcriptionService.transcribe(chunkFile);
      const text = (result?.text || '').trim();
      if (text && io) {
        (hostId ? io.to(`host:${hostId}`) : io).emit(SOCKET_EVENTS.LIVE_TRANSCRIPT_UPDATE, { meeting_id: meetingId, text });
      }
    } catch (e) {
      logger.error('[LIVE] Error processing chunk:', e.message);
    } finally {
      try { if (fs.existsSync(chunkFile)) fs.unlinkSync(chunkFile); } catch { /* ignore */ }
    }
  }
}

export const processingService = new ProcessingService();
