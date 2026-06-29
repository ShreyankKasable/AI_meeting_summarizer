/**
 * Platform bridge — makes the same app.js run in two environments:
 *
 *   • Electron renderer (file://)  → real ipcRenderer + axios via require()
 *   • Browser (http://localhost)   → a shim that maps the same IPC channels to
 *                                     direct Socket.IO + HTTP audio upload
 *
 * After this script runs, `window.ipcRenderer` and `window.axios` are available
 * with identical shapes, so app.js doesn't care which environment it's in.
 *
 * `window.__ELECTRON__` is set by an inline bootstrap in index.html.
 */
(function () {
  // ── Electron: use the native modules, behavior unchanged ────────────────────
  if (window.__ELECTRON__) {
    const electron = require('electron');
    window.ipcRenderer = electron.ipcRenderer;
    window.axios = require('axios');
    return;
  }

  // ── Browser: build an ipcRenderer-compatible shim ───────────────────────────
  // `axios` and `io` are loaded as globals by <script> tags in index.html.
  window.axios = window.axios || axios;
  const socket = io(); // same-origin Socket.IO connection

  const handlers = {};
  const emit = (channel, data) => {
    (handlers[channel] || []).forEach((cb) => {
      try { cb({}, data); } catch (e) { console.error(`handler error on ${channel}:`, e); }
    });
  };

  // Recording/audio state (mirrors what electron/main.js does for the desktop app)
  let meetingId = null;
  let sampleRate = 44100;
  let blocks = [];        // all PCM blocks for the full recording
  let chunkBlocks = [];   // PCM accumulated since the last live flush
  let chunkTimer = null;
  const LIVE_CHUNK_MS = 10000;

  function concatFloat32 (arr) {
    const total = arr.reduce((n, b) => n + b.length, 0);
    const out = new Float32Array(total);
    let o = 0;
    for (const b of arr) { out.set(b, o); o += b.length; }
    return out;
  }

  // Encode mono Float32 PCM into a 16-bit PCM WAV Blob.
  function encodeWav (samples, sr) {
    const n = samples.length;
    const buffer = new ArrayBuffer(44 + n * 2);
    const view = new DataView(buffer);
    const writeStr = (off, str) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
    writeStr(0, 'RIFF'); view.setUint32(4, 36 + n * 2, true); writeStr(8, 'WAVE');
    writeStr(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sr, true); view.setUint32(28, sr * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    writeStr(36, 'data'); view.setUint32(40, n * 2, true);
    let off = 44;
    for (let i = 0; i < n; i++) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(off, s | 0, true);
      off += 2;
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }

  async function uploadAudio (pathSuffix, samples) {
    const fd = new FormData();
    fd.append('audio', encodeWav(samples, sampleRate), 'audio.wav');
    await window.axios.post(`/api/meetings/${meetingId}/${pathSuffix}`, fd);
  }

  function showBrowserNotification ({ title, body } = {}) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((p) => { if (p === 'granted') new Notification(title, { body }); });
    }
  }

  // Socket.IO events → the IPC channel names app.js already listens for
  socket.on('connect', () => emit('backend-status', { connected: true }));
  socket.on('disconnect', () => emit('backend-status', { connected: false }));
  socket.on('recording_started', (d) => { meetingId = d.meeting_id; emit('recording-started', d); });
  socket.on('live_transcript_update', (d) => emit('live-transcript-update', d));
  socket.on('processing_status', (d) => emit('processing-status', d));
  socket.on('meeting_processed', (d) => emit('meeting-processed', d));
  socket.on('sync_complete', (d) => emit('sync-complete', d));
  socket.on('error', (d) => emit('error', d));

  window.ipcRenderer = {
    on (channel, cb) { (handlers[channel] = handlers[channel] || []).push(cb); },
    send (channel, payload) {
      switch (channel) {
        case 'start-recording':
          socket.emit('start_recording', payload);
          break;
        case 'recording-audio-start':
          sampleRate = (payload && payload.sampleRate) || 44100;
          blocks = [];
          chunkBlocks = [];
          if (chunkTimer) clearInterval(chunkTimer);
          chunkTimer = setInterval(() => {
            if (meetingId && chunkBlocks.length) {
              const s = concatFloat32(chunkBlocks);
              chunkBlocks = [];
              uploadAudio('audio-chunk', s).catch(() => { /* live chunk is best-effort */ });
            }
          }, LIVE_CHUNK_MS);
          break;
        case 'audio-chunk':
          // payload is the ArrayBuffer of a Float32 PCM block
          { const s = new Float32Array(payload); blocks.push(s); chunkBlocks.push(s); }
          break;
        case 'recording-audio-stop':
          if (chunkTimer) { clearInterval(chunkTimer); chunkTimer = null; }
          {
            const s = concatFloat32(blocks);
            blocks = [];
            chunkBlocks = [];
            if (meetingId && s.length) {
              uploadAudio('audio', s).catch((err) => emit('error', { message: `Upload failed: ${err.message}` }));
            }
          }
          break;
        case 'sync-tasks':
          socket.emit('sync_action_items', payload);
          break;
        case 'show-notification':
          showBrowserNotification(payload);
          break;
        default:
          break;
      }
    },
  };
})();
