/**
 * Socket.IO setup and the live recording pipeline.
 *
 * Events mirror the original Flask-SocketIO contract so the Electron main
 * process connects unchanged:
 *   start_recording -> recording_started
 *   audio_chunk_ready -> live_transcript_update   (10s live chunks)
 *   stop_recording -> processing_status* -> meeting_processed
 *   sync_action_items -> sync_complete
 */
import fs from 'node:fs';
import path from 'node:path';
import { Server } from 'socket.io';
import logger from '#app/common/logger.js';
import { SOCKET_EVENTS, PROCESSING_STATUS } from '#app/common/constants.js';
import { meetingsService } from '#app/pkg/meetings/service.js';
import { transcriptionService } from '#app/pkg/transcription/service.js';
import { summarizerService } from '#app/pkg/summarizer/service.js';
import { extractionService } from '#app/pkg/extraction/service.js';
import { calendarService } from '#app/pkg/calendar/service.js';
import { notionService } from '#app/pkg/notion/service.js';
import { jiraService } from '#app/pkg/jira/service.js';

let io = null;

export function setupSocket (httpServer) {
  io = new Server(httpServer, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    logger.info('Client connected');
    socket.emit(SOCKET_EVENTS.CONNECTION_STATUS, { status: 'connected' });

    socket.on(SOCKET_EVENTS.START_RECORDING, (data = {}) => handleStartRecording(socket, data));
    socket.on(SOCKET_EVENTS.AUDIO_CHUNK_READY, (data = {}) => handleAudioChunk(data));
    socket.on(SOCKET_EVENTS.STOP_RECORDING, (data = {}) => handleStopRecording(socket, data));
    socket.on(SOCKET_EVENTS.SYNC_ACTION_ITEMS, (data = {}) => handleSyncActionItems(socket, data));

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

async function handleAudioChunk (data) {
  const { meeting_id: meetingId, chunk_file: chunkFile } = data;
  if (!chunkFile) return;
  try {
    const result = await transcriptionService.transcribe(chunkFile);
    const text = (result?.text || '').trim();
    if (text && io) io.emit(SOCKET_EVENTS.LIVE_TRANSCRIPT_UPDATE, { meeting_id: meetingId, text });
  } catch (e) {
    logger.error('[LIVE] Error processing chunk:', e.message);
  } finally {
    try { if (fs.existsSync(chunkFile)) fs.unlinkSync(chunkFile); } catch { /* ignore */ }
  }
}

async function handleStopRecording (socket, data) {
  const meetingId = data.meeting_id;
  const audioFile = data.audio_file;
  logger.info(`Stop recording for meeting ${meetingId}, file: ${audioFile}`);

  try {
    socket.emit(SOCKET_EVENTS.PROCESSING_STATUS, { meeting_id: meetingId, ...PROCESSING_STATUS.TRANSCRIBING });
    const transcript = await transcriptionService.transcribe(audioFile);

    socket.emit(SOCKET_EVENTS.PROCESSING_STATUS, { meeting_id: meetingId, ...PROCESSING_STATUS.SUMMARIZING });
    const summary = await summarizerService.summarize(transcript);

    socket.emit(SOCKET_EVENTS.PROCESSING_STATUS, { meeting_id: meetingId, ...PROCESSING_STATUS.EXTRACTING_ACTIONS });
    const rawItems = await extractionService.extract(transcript, summary);

    const meeting = meetingsService.endMeeting(meetingId, {
      transcript,
      summary: summary || 'No summary generated',
      audioFilePath: audioFile ? `/data/audio/${path.basename(audioFile)}` : null,
    });
    const actionItems = meetingsService.createActionItems(meetingId, rawItems);

    socket.emit(SOCKET_EVENTS.PROCESSING_STATUS, { meeting_id: meetingId, ...PROCESSING_STATUS.COMPLETE });
    socket.emit(SOCKET_EVENTS.MEETING_PROCESSED, { meeting_id: meetingId, summary, action_items: actionItems, meeting });
    logger.info(`Meeting processed: ${meetingId} | Items: ${actionItems.length}`);
  } catch (e) {
    logger.error('Processing error:', e);
    socket.emit(SOCKET_EVENTS.ERROR, { message: `Processing failed: ${e.message}` });
  }
}

async function handleSyncActionItems (socket, data) {
  const meetingId = data.meeting_id;
  const services = data.services || [];
  const meeting = meetingsService.getMeetingById(meetingId);
  const items = meetingsService.getActionItemsByMeeting(meetingId);
  const results = {};

  if (services.includes('google_calendar')) {
    if (calendarService.isAuthenticated()) {
      let synced = 0;
      for (const item of items) {
        try { await calendarService.syncActionItem(item); synced += 1; } catch { /* skip */ } // eslint-disable-line no-await-in-loop
      }
      results.google_calendar = { success: true, synced };
    } else {
      results.google_calendar = { success: false, error: 'Not authenticated' };
    }
  }
  if (services.includes('notion')) {
    try {
      if (!notionService.isAuthenticated()) throw new Error('Notion not configured');
      await notionService.exportMeeting(meeting);
      results.notion = { success: true };
    } catch (e) {
      results.notion = { success: false, error: e.message };
    }
  }
  if (services.includes('jira')) {
    if (jiraService.isAuthenticated()) {
      let synced = 0;
      for (const item of items) {
        try { await jiraService.syncActionItem(item); synced += 1; } catch { /* skip */ } // eslint-disable-line no-await-in-loop
      }
      results.jira = { success: true, synced };
    } else {
      results.jira = { success: false, error: 'Jira not configured' };
    }
  }

  socket.emit(SOCKET_EVENTS.SYNC_COMPLETE, { meeting_id: meetingId, results });
}

export function disconnect () {
  if (io) {
    io.close();
    io = null;
  }
}
