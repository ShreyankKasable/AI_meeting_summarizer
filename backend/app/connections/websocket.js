/**
 * Socket.IO setup for meeting lifecycle and processing updates.
 *
 * Events mirror the original Flask-SocketIO contract so browser clients
 * connect unchanged:
 *   start_recording -> recording_started
 *
 * Audio data is uploaded over REST: live chunks go through `/audio-chunk`,
 * while final recordings complete through R2 multipart upload.
 */
import { Server } from 'socket.io';
import logger from '#app/common/logger.js';
import { SOCKET_EVENTS } from '#app/common/constants.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { authService } from '#app/pkg/auth/service.js';
import { AUTH_ACCESS_COOKIE_NAME, getCookieValue } from '#app/api/middlewares/auth.js';
import { corsOrigin } from '#app/api/middlewares/cors.js';

let io = null;

const hostRoom = (hostId) => `host:${hostId}`;

export function setupSocket (httpServer) {
  io = new Server(httpServer, { cors: { origin: corsOrigin, credentials: true } });

  // Reject connections without the same valid host access JWT used by the REST API.
  // The production path reads it from the HTTP-only cookie; the handshake auth
  // fallback keeps older clients working during transition.
  io.use((socket, next) => {
    try {
      const token = getCookieValue(socket.handshake.headers.cookie, AUTH_ACCESS_COOKIE_NAME) ||
        socket.handshake.auth?.token ||
        '';
      const payload = authService.verifyAccessToken(token);
      socket.data.hostId = payload.sub;
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    logger.info('Client connected');
    socket.join(hostRoom(socket.data.hostId));
    socket.emit(SOCKET_EVENTS.CONNECTION_STATUS, { status: 'connected' });

    socket.on(SOCKET_EVENTS.START_RECORDING, (data = {}) => {
      handleStartRecording(socket, data).catch((err) => {
        logger.error('Start recording error:', err);
        socket.emit(SOCKET_EVENTS.ERROR, { message: `Could not start recording: ${err.message}` });
      });
    });

    socket.on('disconnect', () => logger.info('Client disconnected'));
  });

  return io;
}

export function getIo () {
  return io;
}

async function handleStartRecording (socket, data) {
  const title = data.title || 'Untitled Meeting';
  const participantsStr = data.participants || '';
  const participants = typeof participantsStr === 'string'
    ? participantsStr.split(',').map((s) => s.trim()).filter(Boolean)
    : (participantsStr || []);

  const meeting = await meetingsService.createMeeting({
    title, startTime: new Date().toISOString(), participants, hostId: socket.data.hostId,
  });
  logger.info(`Created meeting ${meeting.id} with title: ${title}`);
  socket.emit(SOCKET_EVENTS.RECORDING_STARTED, { meeting_id: meeting.id, title });
}

export function disconnect () {
  if (io) {
    io.close();
    io = null;
  }
}
