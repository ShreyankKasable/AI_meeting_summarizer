

/**
 * Shared enums and constants.
 */

// Supported translation languages (code -> display name)
export const SUPPORTED_LANGUAGES = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  ar: 'Arabic',
  hi: 'Hindi',
};

// Processing pipeline progress milestones emitted over Socket.IO
export const PROCESSING_STATUS = {
  TRANSCRIBING: { status: 'transcribing', progress: 10 },
  SUMMARIZING: { status: 'summarizing', progress: 40 },
  EXTRACTING_ACTIONS: { status: 'extracting_actions', progress: 70 },
  COMPLETE: { status: 'complete', progress: 100 },
};

// Socket.IO event names
export const SOCKET_EVENTS = {
  CONNECTION_STATUS: 'connection_status',
  START_RECORDING: 'start_recording',
  RECORDING_STARTED: 'recording_started',
  AUDIO_CHUNK_READY: 'audio_chunk_ready',
  LIVE_TRANSCRIPT_UPDATE: 'live_transcript_update',
  STOP_RECORDING: 'stop_recording',
  PROCESSING_STATUS: 'processing_status',
  MEETING_PROCESSED: 'meeting_processed',
  SYNC_ACTION_ITEMS: 'sync_action_items',
  SYNC_COMPLETE: 'sync_complete',
  ERROR: 'error',
};

export const PRIORITIES = ['high', 'medium', 'low'];
