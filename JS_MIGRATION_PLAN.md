# JavaScript Migration — AI Meeting Summarizer

## As-Built Implementation Guide

> **Status: COMPLETED.** The Python/Flask backend has been fully rewritten in
> Node.js/JavaScript. This document describes what was actually built. Where the
> implementation diverges from the original draft plan, the divergence and its
> reason are called out explicitly.

---

## Overview

The Python Flask backend was rewritten in Node.js. The result is **100% JavaScript**:
a single `npm install`, no Python, no virtual environment.

What stayed the same:
- The Electron shell (audio capture was added to it — see below)
- All frontend HTML/CSS (`frontend/index.html`, `frontend/styles.css`)
- `frontend/app.js` — only the recording functions changed
- The `.env` file (identical variable names)
- The SQLite database file `data/meetings.db` (same schema, no migration)
- Every REST endpoint and Socket.IO event (same paths, same payloads)

---

## Python → JavaScript Replacement Map

| Python Component | JavaScript Replacement | Notes |
|---|---|---|
| Flask + Flask-SocketIO | Express.js + socket.io | Direct equivalent |
| SQLAlchemy + SQLite | **`node:sqlite` (built-in `DatabaseSync`)** | **No native build.** See "Key decision 1". |
| sounddevice + numpy | **Web Audio API (renderer) → raw PCM → WAV in Electron main** | See "Key decision 3". |
| soundfile (WAV I/O) | Hand-written 16-bit PCM WAV encoder in `electron/main.js` | No extra dependency |
| openai-whisper (local) | `whisper-node` (optional, opt-in) | Lazy-loaded; not a base dependency |
| Deepgram (httpx call) | **axios HTTPS call** to Deepgram REST API | Mirrors the Python `httpx` approach; no SDK |
| AssemblyAI SDK | **axios HTTPS calls** (upload → create → poll) | No SDK |
| openai SDK | `openai` npm (official JS SDK) | Feature-parity |
| anthropic SDK | `@anthropic-ai/sdk` npm | Feature-parity |
| llama-cpp-python | `node-llama-cpp` (optional, opt-in) | Lazy-loaded; not a base dependency |
| google-api-python-client + oauthlib | `googleapis` npm | Same OAuth flow |
| notion-client | `@notionhq/client` npm | Official Notion JS SDK |
| jira | `jira-client` npm | JS equivalent |
| deep-translator | **axios call to Google's free translate endpoint** | Same endpoint deep-translator scrapes; no API key, no ESM dependency |
| python-dotenv | `dotenv` npm | JS equivalent |
| requests / httpx | `axios` | Already used in frontend |

---

## Key decisions (divergences from the original draft)

The original draft plan proposed `better-sqlite3`, running Express in-process
inside Electron, capturing audio with `MediaRecorder`, and splitting routes into
a `backend/routes/` folder. The shipped implementation differs on four points,
for concrete reasons:

### 1. Database: `node:sqlite` instead of `better-sqlite3`
The target machine runs Node 25, which ships a built-in SQLite module
(`node:sqlite`, `DatabaseSync`). Using it means **zero native compilation** —
`npm install` never invokes node-gyp for the database, so there is no toolchain
risk and no `electron-rebuild` step. It opens the existing `data/meetings.db`
created by SQLAlchemy directly. The API is nearly identical to `better-sqlite3`
(`prepare().get()/all()/run()`), with one caveat: **`node:sqlite` does not accept
JS booleans as bound parameters**, so all boolean columns are stored as `0/1`
and converted back to booleans on read (see `backend/models.js`).

> Requires **Node.js ≥ 22**. `node:sqlite` currently prints an
> `ExperimentalWarning` on startup (stderr) — harmless.

### 2. Backend runs as a spawned Node process, not in-process
`node:sqlite` requires Node ≥ 22, but Electron 28 bundles an older Node in its
main process. Therefore the backend runs as a **separate system-Node process**,
spawned by `electron/main.js` exactly where the Python process used to be
spawned. Electron connects to it over Socket.IO (as before) and kills it on quit.
This also keeps all dependencies building against system Node, avoiding Electron
ABI mismatches entirely.

### 3. Audio captured in the renderer via Web Audio API (raw PCM)
`sounddevice` captured audio in the Python process. In the JS version the
**renderer** captures audio with `getUserMedia` + an `AudioContext` +
`ScriptProcessorNode`, streaming raw `Float32` PCM blocks to the Electron main
process over IPC. `MediaRecorder` (the draft's suggestion) produces WebM/Opus,
which would not write to a valid `.wav` and is awkward for local Whisper; raw
PCM lets us emit a correct 16-bit WAV that works with every transcription
backend. Electron main encodes the WAV (full recording + 10s live chunks).

### 4. Layered, DDD-style structure (neo conventions)
The backend was first ported as a faithful single-file `server.js`, then
restructured to mirror the Boltic **neo** service: an ESM package using `#app/*`
subpath imports, with `index.js` → `app/server.js` → `app/api/routes/main/*`
(thin routes) → `app/pkg/{module}/service.js` (domain logic, exported as shared
singletons) → `app/connections/{database,websocket}.js`, plus `app/common/`
(convict `config`, `constants`, `logger`, `error` classes, `utils`). Routes use
`expressAsyncHandler` and throw `AppError` subclasses handled by a central
`errorHandler`. The route tree is auto-loaded by directory/file name, and the
original REST paths are preserved exactly.

### 5. Local Whisper / Llama are optional, opt-in
`whisper-node` runs a `make` build at *require* time and `node-llama-cpp` pulls
large binaries. Neither is a base dependency. They are lazy-loaded inside
try/catch, so a base install never fails and the app falls back gracefully when
they are absent. Install them only for offline mode:
`npm install whisper-node node-llama-cpp`.

---

## Architecture

### Before (Python)
```
Electron (electron/main.js)
  ├─ spawn('python', ['backend/app.py'])  → Flask + Flask-SocketIO on :5000
  │     ├─ SQLAlchemy → SQLite
  │     ├─ sounddevice captures audio in Python
  │     └─ Socket.IO server
  └─ frontend/app.js
        ├─ ipcRenderer → main.js → socket → Flask
        └─ axios → http://127.0.0.1:5000
```

### After (JavaScript)
```
Electron (electron/main.js)
  ├─ spawn('node', ['backend/index.js'])  → Express + Socket.IO on :5000
  │     ├─ app/connections/database.js → node:sqlite (same data/meetings.db)
  │     ├─ app/pkg/*  domain services        app/api/routes/main/*  thin routes
  │     └─ app/connections/websocket.js → recording pipeline
  ├─ Web Audio capture pipeline:
  │     renderer getUserMedia → ScriptProcessor → PCM blocks
  │       → IPC 'audio-chunk' → main buffers
  │       → 10s timer: write chunk WAV → socket 'audio_chunk_ready' (live transcript)
  │       → on stop: write full WAV → socket 'stop_recording' (processing pipeline)
  └─ frontend/app.js
        ├─ navigator.mediaDevices.getUserMedia()  (audio captured here)
        ├─ ipcRenderer → main.js → socket → Express
        └─ axios → http://127.0.0.1:5000  (unchanged)
```

---

## Project Structure (as built)

The backend is organized as a layered, DDD-style ESM service modeled on the
Boltic **neo** service (`#app/*` subpath imports; thin routes → `pkg` domain
services → `connections`; shared `common`).

```
AI_meeting_summarizer/
├── electron/
│   └── main.js                       # spawns Node backend + audio capture/WAV encoding
├── backend/                          # ESM service package (#app/* imports)
│   ├── index.js                      # entry point — boots HTTP + Socket.IO (← app.py main)
│   ├── package.json                  # type:module + imports map
│   └── app/
│       ├── server.js                 # Express app factory (getAppServer)
│       ├── common/
│       │   ├── config.js             # convict schema — all env vars (← config.py)
│       │   ├── constants.js          # enums, socket events, languages
│       │   ├── logger.js
│       │   ├── error/                # AppError + HTTP error classes (index.js, codes.js)
│       │   └── utils/file.util.js    # route auto-loader helpers
│       ├── connections/
│       │   ├── database.js           # node:sqlite connection (← database.py)
│       │   └── websocket.js          # Socket.IO + recording pipeline (← app.py sockets)
│       ├── api/
│       │   ├── middlewares/          # asyncHandler, errorhandler, cors
│       │   └── routes/main/          # auto-loaded route tree
│       │       ├── root.route.js     # GET /health
│       │       ├── api/*.route.js    # meetings, action-items, google, notion, jira, ...
│       │       └── data/audio.route.js
│       └── pkg/                      # domain services (service.js + validation.js)
│           ├── meetings/             # data access (← models.py)
│           ├── transcription/ summarizer/ extraction/   # AI agents
│           ├── calendar/ notion/ jira/ translation/      # integrations
│           └── system/               # capability reporting (← offline_processing.py)
├── frontend/
│   ├── index.html                    # unchanged
│   ├── app.js                        # only startRecording()/stopRecording() changed
│   └── styles.css                    # unchanged
├── data/
│   ├── meetings.db                   # unchanged (same SQLite file)
│   └── audio/                        # recorded WAVs
├── .env                              # unchanged
├── package.json                      # Electron app + JS deps
└── README.md
```

Deleted: `backend/**/*.py`, `backend/__init__.py`, `backend/api_routes.py`,
`requirements.txt`, `start.js`. The original Python `utils.py` helpers were not
all needed; `audio_listener.py` has no JS counterpart (audio capture moved to
Electron), and the `task_sync.py` stub was folded into the real services in the
websocket `sync_action_items` handler.

---

## `package.json` (as built)

```json
{
  "name": "ai-meeting-summarizer",
  "version": "2.0.0",
  "main": "electron/main.js",
  "scripts": {
    "start": "electron .",
    "start:backend": "node backend/index.js",
    "start:electron": "electron .",
    "build": "electron-builder"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0",
    "@notionhq/client": "^2.2.15",
    "axios": "^1.6.7",
    "compression": "^1.8.1",
    "convict": "^6.2.5",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "electron-store": "^8.1.0",
    "express": "^4.19.2",
    "googleapis": "^140.0.1",
    "helmet": "^8.2.0",
    "jira-client": "^8.2.2",
    "lodash": "^4.17.21",
    "openai": "^4.56.0",
    "socket.io": "^4.7.5",
    "socket.io-client": "^4.7.5"
  },
  "devDependencies": {
    "electron": "^28.2.0",
    "electron-builder": "^24.9.1"
  }
}
```

No `better-sqlite3` (using built-in `node:sqlite`), no `wav` package (hand-written
encoder), no `whisper-node`/`node-llama-cpp` (optional, install on demand).

---

## Component notes

The full source lives in the repo; below is what each file does and the points
worth knowing.

### `backend/index.js`  (entry — ← `app.py` `__main__`)
Initializes the DB, builds the Express app via `getAppServer('main')`, starts the
HTTP server, attaches Socket.IO (`setupSocket`), and wires graceful shutdown.

### `backend/app/server.js`  (Express app factory)
`getAppServer(serverType)` builds the app (helmet, compression, cors, JSON body),
dynamically imports `api/routes/${serverType}/index.js`, and registers the
`NotFound` + `errorHandler` tail. Mirrors neo's `app/server.js`.

### `backend/app/common/config.js`  (← `config.py`)
**convict** schema declaring every env var (neo style). Access via
`config.get('path.to.key')`; values are also flattened onto `config` and
`config.isDebug` / `config.paths` are exposed. Computes `BASE_DIR/DATA_DIR/…`
from the file location and creates the directories on load.

### `backend/app/common/{constants,logger}.js` + `error/`
`constants.js` — languages, socket event names, processing milestones.
`logger.js` — console-backed `info/warn/error/debug`. `error/index.js` —
`AppError` + `createErrorClass` producing `BadRequest`, `NotFound`,
`UnauthorizedRequest`, etc. (HTTP status baked in), `codes.js` — error code map.

### `backend/app/connections/database.js`  (← `database.py`)
Opens `data/meetings.db` with `node:sqlite`'s `DatabaseSync`, enables WAL +
foreign keys, and runs `CREATE TABLE IF NOT EXISTS` matching the original
SQLAlchemy schema. Exposes `getDb`, `initDb`, `disconnect`.

### `backend/app/connections/websocket.js`  (← `app.py` socket handlers)
`setupSocket(httpServer)` attaches Socket.IO and the recording pipeline, calling
the `pkg` services. **Events:** `connect` → `connection_status`;
`start_recording` → `recording_started`; `audio_chunk_ready` → transcribe chunk →
`live_transcript_update`; `stop_recording` → `transcribing(10)` →
`summarizing(40)` → `extracting_actions(70)` → save → `complete(100)` →
`meeting_processed`; `sync_action_items` → `sync_complete`.

### `backend/app/pkg/meetings/`  (← `models.py`)
`service.js` — `MeetingsService` data-access (prepared statements). `format*()`
helpers reproduce the exact Python `.to_dict()` JSON. **Booleans stored as 0/1**
(node:sqlite restriction), converted back on read. `validation.js` — title /
translate payload middleware.

### `backend/app/pkg/transcription/`  (← `transcription.py`)
`TranscriptionService` picks backend from `TRANSCRIPTION_MODEL`. Deepgram &
AssemblyAI via **axios** (no SDK); local Whisper via optional `whisper-node`
(dynamic import). Returns `{ text, segments, language }`.

### `backend/app/pkg/summarizer/`  (← `summarizer.py`)
`SummarizerService` — identical 8-section prompt. Order: local LLM (optional) →
OpenAI/Euron → Claude → fallback. SDKs are dynamically imported in `_init()`.

### `backend/app/pkg/extraction/`  (← `action_item_extractor.py`)
`ExtractionService` — same JSON-array prompt + regex parse, `due_date`
normalized, keyword fallback (≤10 items).

### `backend/app/pkg/{calendar,notion,jira}/`  (← `*_sync.py`, `notion_export.py`)
Integration services (`googleapis`, `@notionhq/client`, `jira-client`). Notion &
Jira are exported as **shared singletons** so REST `configure` calls and the
websocket sync use the same client instance. Notion/Jira have `validation.js`.

### `backend/app/pkg/translation/`  (← `translation.py`)
`TranslationService` calls Google's free `translate_a/single` endpoint via axios
(same one `deep-translator` uses). Chunks at 5000 chars.

### `backend/app/pkg/system/`  (← `offline_processing.py`)
`SystemService` reports capabilities/model/integration status for
`/api/system/*`.

### `backend/app/api/routes/main/`  (← Flask `@app.route`s)
Directory-driven auto-loader (neo's `getDirectories`/`getRouteFiles`): subdirs
mount at `/<dir>`, `*.route.js` files at `/<name>`. `root.route.js` → `/health`;
`api/*.route.js` → `/api/...`; `data/audio.route.js` → `/data/audio/:filename`.
Routes are thin: validate → call service → `res.json`, with
`expressAsyncHandler` forwarding errors to `errorHandler`. **Every original REST
path is preserved exactly.**

### `electron/main.js` (rewritten)
- `startBackend()` spawns `node backend/index.js` (replaces the Python spawn).
- `connectToBackend()` connects via socket.io-client with auto-reconnect — no
  fixed startup wait.
- Audio: `recording-audio-start` (carries the AudioContext sample rate) →
  `audio-chunk` (Float32 PCM blocks) → buffered; a 10s timer flushes a chunk WAV
  and emits `audio_chunk_ready`; `recording-audio-stop` concatenates, writes the
  full WAV, and emits `stop_recording`. `encodeWav()` writes a 44-byte header +
  16-bit PCM. The active meeting id from `recording_started` is tracked at module
  scope so the order of IPC vs socket events doesn't matter.
- Forwards `sync_complete` to the renderer (a gap in the old main.js).
- `before-quit` disconnects the socket and kills the backend process.

### `frontend/app.js` (recording functions only)
`startRecording()` is now `async`: requests the mic, sends `start-recording`,
then builds the Web Audio pipeline (`AudioContext` → `MediaStreamSource` →
`ScriptProcessorNode`) and streams PCM via `audio-chunk`. `stopRecording()`
tears down the pipeline and sends `recording-audio-stop`. Everything else
(axios calls, IPC listeners, UI, filters, integrations) is unchanged.

---

## Database schema & environment

Unchanged. Same three tables (`meetings`, `action_items`, `participants`), same
column names, same `data/meetings.db`. `node:sqlite` reads the existing file
created by SQLAlchemy. The `.env` file is 100% identical (same variable names).

---

## Verification (performed)

- ✅ `npm install` completes with no native compilation
- ✅ `node backend/index.js` boots the neo-style service; `/health`,
  `/api/meetings`, `/api/translation/languages`, `/api/system/status`, and
  integration-status endpoints all respond; unknown routes return the
  `AppError` JSON (`{ error, code: AE-404 }`)
- ✅ `/api/meetings` returns the existing 4 meetings with the exact original JSON
  shape (transcript parsed to object, nested action_items/participants, booleans)
- ✅ End-to-end Socket.IO pipeline: `start_recording` → WAV → `stop_recording`
  drives `transcribing → summarizing → extracting_actions → complete`, persists
  the meeting/participants/audio path, and emits `meeting_processed`
- ✅ The directory-driven route auto-loader mounts every `/api/...` path and
  `pkg` services/connections resolve via `#app/*` subpath imports

Still requires manual confirmation (needs the live GUI + microphone):
- Renderer mic capture and WAV playback in the running Electron app
- Real transcription/summaries (set `TRANSCRIPTION_MODEL` + the relevant API key,
  or `USE_EURON_API`/`OPENAI_API_KEY`, in `.env`)

---

## Common issues and fixes

| Issue | Cause | Fix |
|---|---|---|
| `DatabaseSync is not a constructor` / `node:sqlite` missing | Node < 22 | Install Node 22+ (`node -v`) |
| Backend never connects | Port 5000 in use, or `node` not on PATH | Free the port; ensure system `node` is installed |
| Transcription says "unavailable" | No transcription backend configured | Set `TRANSCRIPTION_MODEL=deepgram`/`assemblyai` + key, or `npm install whisper-node` |
| Microphone permission denied | OS blocked mic access | OS Privacy → Microphone → enable for Electron |
| Google OAuth "redirect_uri mismatch" | Wrong client config | Allow `http://localhost:5000/api/google/callback` in Google Cloud Console |
| `whisper-node` runs `make` / hangs on install | It builds whisper.cpp at require time | It's optional — only install it when you want offline transcription |

---

## Summary

| | Before (Python) | After (JavaScript) |
|---|---|---|
| Runtime | Python 3.8+ + Node.js | Node.js 22+ only |
| Install | `pip install` + `npm install` | `npm install` (no native build) |
| Backend | Flask + Flask-SocketIO | Express + Socket.IO, neo-style layered ESM service (spawned Node process) |
| Database | SQLAlchemy ORM + SQLite | `node:sqlite` (same SQLite file) |
| Audio capture | sounddevice (Python) | Web Audio API (renderer) → WAV in Electron main |
| Transcription | whisper / Deepgram / AssemblyAI | whisper-node (optional) / Deepgram & AssemblyAI via HTTPS |
| LLM | openai / anthropic / llama-cpp-python | openai / @anthropic-ai/sdk / node-llama-cpp (optional) |
| Google / Notion / Jira | Python SDKs | googleapis / @notionhq/client / jira-client |
| Translation | deep-translator | Google translate endpoint via axios |
| All endpoints & Socket.IO events | — | Preserved exactly |
| frontend HTML/CSS, `.env`, `meetings.db` | — | Unchanged |
```
