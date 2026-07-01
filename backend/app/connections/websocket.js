/**
 * Socket.IO setup and the live recording pipeline.
 *
 * Events mirror the original Flask-SocketIO contract so browser clients
 * connect unchanged:
 *   start_recording -> recording_started
 *   audio_chunk_ready -> live_transcript_update   (10s live chunks)
 *   stop_recording -> processing_status* -> meeting_processed
 *
 * The transcription/summary/extraction pipeline lives in
 * `pkg/processing/service.js` and is shared with the REST audio-upload route
 * used by the browser flow.
 */
import { Server } from 'socket.io';
import logger from '#app/common/logger.js';
import { SOCKET_EVENTS } from '#app/common/constants.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { processingService } from '#app/pkg/processing/service.js';

let io = null;

export function setupSocket (httpServer) {
  io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    logger.info('Client connected');
    socket.emit(SOCKET_EVENTS.CONNECTION_STATUS, { status: 'connected' });

    socket.on(SOCKET_EVENTS.START_RECORDING, (data = {}) => handleStartRecording(socket, data));
    socket.on(SOCKET_EVENTS.AUDIO_CHUNK_READY, (data = {}) =>
      processingService.processLiveChunk({ io, meetingId: data.meeting_id, chunkFile: data.chunk_file }));
    socket.on(SOCKET_EVENTS.STOP_RECORDING, (data = {}) =>
      processingService.processRecording({ io, meetingId: data.meeting_id, audioFile: data.audio_file }).catch(() => {}));

    socket.on('disconnect', () => logger.info('Client disconnected'));
  });

  return io;
}

export function getIo () {
  return io;
}

function handleStartRecording (socket, data) {
  const title = data.title || 'Untitled Meeting';
  const participantsStr = data.participants || '';
  const participants = typeof participantsStr === 'string'
    ? participantsStr.split(',').map((s) => s.trim()).filter(Boolean)
    : (participantsStr || []);

  const meeting = meetingsService.createMeeting({ title, startTime: new Date().toISOString(), participants });
  logger.info(`Created meeting ${meeting.id} with title: ${title}`);
  socket.emit(SOCKET_EVENTS.RECORDING_STARTED, { meeting_id: meeting.id, title });
}

export function disconnect () {
  if (io) {
    io.close();
    io = null;
  }
}
