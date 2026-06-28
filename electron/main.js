const { app, BrowserWindow, ipcMain, Notification, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const io = require('socket.io-client');

let mainWindow;
let backendProcess;
let socket;

// ── Audio recording state ─────────────────────────────────────────────────────
// Audio is captured in the renderer (Web Audio API) and streamed here as raw
// Float32 PCM blocks. We buffer them, write 10s chunk WAVs for live
// transcription, and write the full WAV when recording stops.
const AUDIO_DIR = path.join(__dirname, '..', 'data', 'audio');
const LIVE_CHUNK_MS = 10000;
let recording = null; // { meetingId, sampleRate, blocks:[Float32Array], chunkBlocks:[], chunkTimer }
let currentMeetingId = null; // latest meeting id from `recording_started` (order-independent)

function ensureAudioDir() {
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// Encode mono Float32 PCM samples into a 16-bit PCM WAV Buffer.
function encodeWav(float32Samples, sampleRate) {
  const numSamples = float32Samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);
  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);
  let offset = 44;
  for (let i = 0; i < numSamples; i += 1) {
    let s = Math.max(-1, Math.min(1, float32Samples[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7fff;
    buffer.writeInt16LE(s | 0, offset);
    offset += 2;
  }
  return buffer;
}

function concatFloat32(blocks) {
  const total = blocks.reduce((n, b) => n + b.length, 0);
  const out = new Float32Array(total);
  let o = 0;
  for (const b of blocks) { out.set(b, o); o += b.length; }
  return out;
}

function flushLiveChunk() {
  if (!recording || recording.chunkBlocks.length === 0) return;
  const samples = concatFloat32(recording.chunkBlocks);
  recording.chunkBlocks = [];
  try {
    ensureAudioDir();
    const chunkFile = path.join(AUDIO_DIR, `chunk_${recording.meetingId}_${Date.now()}.wav`);
    fs.writeFileSync(chunkFile, encodeWav(samples, recording.sampleRate));
    if (socket && socket.connected) {
      socket.emit('audio_chunk_ready', { meeting_id: recording.meetingId, chunk_file: chunkFile });
    }
  } catch (e) {
    console.error('Error writing live chunk:', e.message);
  }
}

// ── Backend (Node server) lifecycle ────────────────────────────────────────────
function startBackend() {
  const serverScript = path.join(__dirname, '..', 'backend', 'index.js');
  // Use the system Node runtime (needs Node >= 22 for the built-in node:sqlite).
  backendProcess = spawn('node', [serverScript], {
    cwd: path.join(__dirname, '..'),
    env: process.env,
  });

  backendProcess.stdout.on('data', (data) => console.log(`Backend: ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`Backend: ${data}`));
  backendProcess.on('error', (err) => console.error('Failed to start backend:', err.message));
  backendProcess.on('close', (code) => console.log(`Backend process exited with code ${code}`));
}

function connectToBackend() {
  console.log('Connecting to backend at http://127.0.0.1:5000');
  socket = io('http://127.0.0.1:5000', {
    transports: ['polling', 'websocket'],
    upgrade: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 60,
    timeout: 10000,
  });

  socket.on('connect', () => {
    console.log('Connected to backend successfully!');
    if (mainWindow) mainWindow.webContents.send('backend-status', { connected: true });
  });
  socket.on('connect_error', (error) => console.error('Connection error:', error.message));
  socket.on('disconnect', () => {
    console.log('Disconnected from backend');
    if (mainWindow) mainWindow.webContents.send('backend-status', { connected: false });
  });

  socket.on('recording_started', (data) => {
    // Remember which meeting the buffered audio belongs to (order-independent).
    currentMeetingId = data.meeting_id;
    if (recording) recording.meetingId = data.meeting_id;
    if (mainWindow) mainWindow.webContents.send('recording-started', data);
    showNotification('Recording Started', `Meeting "${data.title}" is now being recorded`);
  });

  socket.on('processing_status', (data) => {
    if (mainWindow) mainWindow.webContents.send('processing-status', data);
    if (data.status === 'transcribing') showNotification('Transcribing Audio', 'Converting speech to text...');
    else if (data.status === 'summarizing') showNotification('Generating Summary', 'AI is analyzing the meeting...');
    else if (data.status === 'extracting_actions') showNotification('Extracting Actions', 'Identifying action items...');
  });

  socket.on('meeting_processed', (data) => {
    if (mainWindow) mainWindow.webContents.send('meeting-processed', data);
    showNotification('Meeting Processed', 'Summary and action items are ready!');
  });

  socket.on('audio_status', (data) => {
    if (mainWindow) mainWindow.webContents.send('audio-status', data);
  });

  socket.on('live_transcript_update', (data) => {
    if (mainWindow) mainWindow.webContents.send('live-transcript-update', data);
  });

  socket.on('sync_complete', (data) => {
    if (mainWindow) mainWindow.webContents.send('sync-complete', data);
  });

  socket.on('error', (data) => {
    if (mainWindow) mainWindow.webContents.send('error', data);
    showNotification('Error', (data && data.message) || 'An error occurred');
  });
}

// ── Window + menu ──────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => { mainWindow = null; });
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { label: 'New Meeting', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('new-meeting') },
        { type: 'separator' },
        { label: 'Exit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Meeting',
      submenu: [
        { label: 'Start Recording', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.webContents.send('start-recording') },
        { label: 'Stop Recording', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('stop-recording') },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', click: () => require('electron').shell.openExternal('https://github.com/yourusername/ai-meeting-summarizer') },
        { label: 'About', click: () => mainWindow.webContents.send('show-about') },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function showNotification(title, body) {
  if (!Notification.isSupported()) return;
  const Store = require('electron-store');
  const store = new Store();
  if (!store.get('enableNotifications', true)) return;
  const notification = new Notification({
    title,
    body,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    silent: false,
    timeoutType: 'default',
  });
  notification.show();
  setTimeout(() => notification.close(), 5000);
}

// ── IPC: recording control ──────────────────────────────────────────────────────
ipcMain.on('start-recording', (event, data) => {
  if (socket && socket.connected) socket.emit('start_recording', data);
  else console.error('[ELECTRON] Socket not connected! Cannot start recording.');
});

// Renderer signals audio capture is starting (carries the AudioContext sample rate).
ipcMain.on('recording-audio-start', (event, { sampleRate }) => {
  recording = {
    meetingId: currentMeetingId,
    sampleRate: sampleRate || 44100,
    blocks: [],
    chunkBlocks: [],
    chunkTimer: setInterval(flushLiveChunk, LIVE_CHUNK_MS),
  };
});

// Raw Float32 PCM block from the renderer.
ipcMain.on('audio-chunk', (event, arrayBuffer) => {
  if (!recording) return;
  const samples = new Float32Array(arrayBuffer);
  recording.blocks.push(samples);
  recording.chunkBlocks.push(samples);
});

// Renderer signals capture has stopped — write the full WAV and trigger processing.
ipcMain.on('recording-audio-stop', () => {
  if (!recording) return;
  if (recording.chunkTimer) clearInterval(recording.chunkTimer);
  const { meetingId, sampleRate, blocks } = recording;
  recording = null;

  if (!meetingId || blocks.length === 0) {
    console.error('[ELECTRON] No audio captured for meeting', meetingId);
    return;
  }
  try {
    ensureAudioDir();
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filepath = path.join(AUDIO_DIR, `meeting_${meetingId}_${ts}.wav`);
    fs.writeFileSync(filepath, encodeWav(concatFloat32(blocks), sampleRate));
    console.log('Audio saved to', filepath);
    if (socket && socket.connected) socket.emit('stop_recording', { meeting_id: meetingId, audio_file: filepath });
  } catch (e) {
    console.error('Error writing audio file:', e.message);
  }
});

ipcMain.on('sync-tasks', (event, data) => {
  if (socket && socket.connected) socket.emit('sync_action_items', data);
});

ipcMain.on('show-notification', (event, data) => showNotification(data.title, data.body));

// ── App lifecycle ────────────────────────────────────────────────────────────
app.on('ready', () => {
  startBackend();
  createWindow();
  // socket.io-client retries automatically until the backend is up — no fixed wait.
  connectToBackend();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

app.on('before-quit', () => {
  if (socket) socket.disconnect();
  if (backendProcess) backendProcess.kill();
});
