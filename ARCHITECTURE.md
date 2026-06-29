# Architecture — AI Meeting Summarizer

A cross-platform **Electron desktop app** that records meetings, transcribes the
audio, generates an AI summary, extracts action items, and syncs them to Google
Calendar / Notion / Jira. The codebase is **100% JavaScript** (no Python).

---

## 1. High-level overview

The app is made of three cooperating parts that run on the user's machine:

```
┌────────────────────────────────────────────────────────────────────────---─┐
│                          Electron application                              │
│                                                                            │
│  ┌────────────────────────-──┐         ┌────────-─────────────────────┐    │
│  │   Renderer (frontend/)    │  IPC    │   Main process (electron/)   │    │
│  │                           │◄───────►│                              │    │
│  │  index.html / app.js      │         │  main.js                     │    │
│  │  - UI, meetings, settings │         │  - window + menu             │    │
│  │  - Web Audio mic capture  │         │  - audio buffering → WAV     │    │
│  │  - axios REST calls ──────┼────┐    │  - spawns + supervises       │    │
│  └───────────────────────-───┘    │    │    the backend               │    │
│                                   │    │  - socket.io-client ◄──┐     │    │
└───────────────────────────────────┼────┴────────────────────────┼─────┘    │
                                    │ HTTP                        │ WS       │
                                    ▼                             ▼          │
                        ┌───────────────────────────────────────────-───┐    │
                        │   Backend (backend/) — spawned `node` process │    │
                        │   Express REST  +  Socket.IO  on :5000        │    │
                        │   node:sqlite ── data/meetings.db             │    │
                        │   AI + integration services                   │    │
                        └─────────────────────────────────────────-─────┘    │
                                    │            │            │              │
                                    ▼            ▼            ▼              │
                            Deepgram/        OpenAI/      Google/Notion/Jira │
                            AssemblyAI/      Euron/       (integrations)     │
                            Whisper*         Anthropic*                      │
└───────────────────────────────────────────────────────────────────────────-┘
                                          * optional / configurable
```

**Why a separate backend process?** The backend uses Node's built-in
`node:sqlite`, which requires Node ≥ 22. Electron bundles an older Node in its
main process, so the backend is spawned as a **separate system-`node` process**
(replacing what used to be a Python process). This also keeps all dependencies
building against system Node and avoids native-module/Electron ABI issues.

---

## 2. Technology stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron 28 |
| Renderer UI | HTML / CSS / vanilla JS, `axios`, `socket.io-client` (via IPC) |
| Audio capture | Web Audio API (`getUserMedia` + `ScriptProcessorNode`) |
| Backend runtime | Node.js ≥ 22 (ESM) |
| HTTP / realtime | Express + Socket.IO |
| Database | SQLite via built-in `node:sqlite` (`DatabaseSync`) |
| Config | `convict` |
| Transcription | Deepgram / AssemblyAI (HTTPS), Whisper (optional, local) |
| Summarization / extraction | OpenAI / Euron.one / Anthropic, local LLM (optional) |
| Integrations | `googleapis`, `@notionhq/client`, `jira-client`, Google Translate |

---

## 3. Process & communication model

There are **three runtimes** and **two communication channels**:

1. **Renderer ↔ Main** — Electron **IPC** (`ipcRenderer` / `ipcMain`).
2. **Main ↔ Backend** — **Socket.IO** (real-time recording/processing events).
3. **Renderer ↔ Backend** — **HTTP/REST** via `axios` (CRUD, status, sync).

The renderer never talks to the backend over WebSocket directly — the **main
process holds the single Socket.IO client** and relays events to the renderer
over IPC. REST calls, however, go straight from the renderer to the backend.

### IPC channels (Renderer ↔ Main)

| Direction | Channel | Purpose |
|---|---|---|
| R→M | `start-recording` | create the meeting (forwarded to backend) |
| R→M | `recording-audio-start` | begin audio capture (carries sample rate) |
| R→M | `audio-chunk` | stream a Float32 PCM block |
| R→M | `recording-audio-stop` | finish capture → write WAV → trigger processing |
| R→M | `sync-tasks` | sync action items to services |
| R→M | `show-notification` | OS notification |
| M→R | `backend-status` | backend connected/disconnected |
| M→R | `recording-started` | meeting created (carries `meeting_id`) |
| M→R | `live-transcript-update` | partial transcript text |
| M→R | `processing-status` | pipeline progress |
| M→R | `meeting-processed` | final summary + action items |
| M→R | `sync-complete` | integration sync results |
| M→R | `new-meeting` / `start-recording` / `stop-recording` | menu accelerators |

---

## 4. The recording → processing pipeline

This is the core flow. Audio is captured in the **renderer**, turned into a WAV
by the **main process**, and processed by the **backend**.

```
User clicks "Start Recording"
  │
  Renderer: getUserMedia → AudioContext → ScriptProcessorNode
  ├─ ipc 'start-recording' ──► Main ──socket 'start_recording'──► Backend
  │                                                               │ create meeting row
  │                              Main ◄──socket 'recording_started'┘ (+participants)
  │                              Renderer ◄─ipc 'recording-started' (sets currentMeetingId)
  │
  ├─ ipc 'recording-audio-start' (sampleRate) ──► Main starts a 10s chunk timer
  └─ ipc 'audio-chunk' (Float32 PCM) ──► Main buffers blocks
        every 10s: Main writes a chunk WAV ──socket 'audio_chunk_ready'──► Backend
                   Backend transcribes chunk ──'live_transcript_update'──► Main ─► Renderer
                                                                            (live captions)

User clicks "Stop Recording"
  │
  Renderer tears down audio graph ── ipc 'recording-audio-stop' ──► Main
  │
  Main: concat PCM blocks → encodeWav() → data/audio/meeting_<id>_<ts>.wav
        ── socket 'stop_recording' { meeting_id, audio_file } ──► Backend
  │
  Backend pipeline (emits 'processing_status' at each step):
        10%  transcribe(audio_file)          → transcript {text,segments,language}
        40%  summarize(transcript)           → summary
        70%  extract(transcript, summary)    → action items
             persist: meetings.endMeeting() + createActionItems()
       100%  'meeting_processed' { meeting, summary, action_items } ──► Main ─► Renderer
  │
  Renderer reloads meetings list and opens the meeting detail
```

**Audio format note:** capture is raw `Float32` PCM (mono, at the
`AudioContext` sample rate). The main process encodes a valid **16-bit PCM WAV**
(`encodeWav()` in `electron/main.js`) — correct for Whisper, Deepgram, and
AssemblyAI alike. (Recording with `MediaRecorder` would yield WebM/Opus, which
isn't a valid `.wav`, so raw PCM is used instead.)

---

## 5. Backend structure (neo-style layered service)

The backend is an **ESM package** (`backend/package.json` with
`"type": "module"` and a `#app/*` subpath-import map) organized in the layered,
DDD style of the Boltic *neo* service:

```
entry → app factory → routes (thin) → pkg services (domain) → connections (I/O)
                                          ▲
                                     common (config, logger, errors, utils)
```

```
backend/
├── index.js                       # entry: initDb, getAppServer, listen, setupSocket, shutdown
├── package.json                   # type:module + { "#app/*.js": "./app/*.js" }
└── app/
    ├── server.js                  # getAppServer() — builds Express app, mounts route tree
    ├── common/
    │   ├── config.js              # convict schema — ALL env vars; config.get(...)
    │   ├── constants.js           # socket event names, languages, progress milestones
    │   ├── logger.js              # info/warn/error/debug
    │   ├── error/
    │   │   ├── index.js           # AppError + NotFound/BadRequest/Unauthorized/...
    │   │   └── codes.js           # error code map
    │   └── utils/file.util.js     # getDirectories/getRouteFiles (route auto-loader)
    ├── connections/
    │   ├── database.js            # node:sqlite: getDb / initDb / disconnect
    │   └── websocket.js           # setupSocket() + the recording pipeline handlers
    ├── api/
    │   ├── middlewares/
    │   │   ├── asyncHandler.js    # expressAsyncHandler — forwards async errors
    │   │   ├── errorhandler.js    # central error → JSON { error, code }
    │   │   └── cors.js
    │   └── routes/main/           # auto-loaded by directory/file name
    │       ├── index.js           # mounts subdirs at /<dir>, *.route.js at /<name>
    │       ├── root.route.js      # GET /health
    │       ├── api/               # → mounted at /api
    │       │   ├── meetings.route.js       # /api/meetings...
    │       │   ├── action-items.route.js   # /api/action-items...
    │       │   ├── google.route.js         # /api/google...
    │       │   ├── notion.route.js         # /api/notion...
    │       │   ├── jira.route.js           # /api/jira...
    │       │   ├── translation.route.js    # /api/translation...
    │       │   └── system.route.js         # /api/system...
    │       └── data/audio.route.js         # /data/audio/:filename
    └── pkg/                        # domain services (exported as shared singletons)
        ├── meetings/      service.js + validation.js   # DB data access
        ├── transcription/ service.js                   # Whisper/Deepgram/AssemblyAI
        ├── summarizer/    service.js                    # LLM summary
        ├── extraction/    service.js                    # action item extraction
        ├── calendar/      service.js                    # Google Calendar OAuth + sync
        ├── notion/        service.js + validation.js
        ├── jira/          service.js + validation.js
        ├── translation/   service.js                    # Google Translate
        └── system/        service.js                    # capability/status reporting
```

### Layer responsibilities

- **Routes** (`api/routes/main/**`) are **thin**: validate input → call a service
  → `res.json(...)`. Async handlers are wrapped in `expressAsyncHandler` so
  thrown `AppError`s land in the central `errorHandler`. The route tree is
  **auto-loaded** by folder/file name (no manual `app.use` wiring).
- **Services** (`pkg/**`) hold all business logic and external I/O. Each module
  pairs a `service.js` with an optional `validation.js`. Services are exported
  as **shared singletons** so a REST `configure` call and the websocket sync use
  the same client instance (important for Notion/Jira runtime configuration).
- **Connections** (`connections/**`) own external resources: the SQLite handle
  and the Socket.IO server + recording pipeline.
- **Common** (`common/**`) is cross-cutting: config, logging, error types, and
  the route-loader utilities.

---

## 6. Data model

SQLite at `data/meetings.db` (the same file the original Python/SQLAlchemy
version created — read untouched; tables created with `IF NOT EXISTS`).

```
meetings
  id, title, start_time, end_time,
  transcript (JSON text), summary, audio_file_path, created_at
    │ 1
    ├──< action_items
    │      id, meeting_id (FK, ON DELETE CASCADE),
    │      description, assignee, due_date, priority,
    │      completed, synced_to_calendar, synced_to_notion, synced_to_jira,
    │      external_id, created_at
    │ 1
    └──< participants
           id, meeting_id (FK, ON DELETE CASCADE), name, email, role
```

Notes:
- `transcript` is stored as a JSON string (`{ text, segments, language }`) and
  parsed back to an object on read.
- `node:sqlite` does not bind JS booleans, so boolean columns are stored as
  `0/1` and converted to `true/false` in the service layer (`!!value`).
- The service-layer formatters reproduce the exact JSON shape the old Python
  `.to_dict()` produced, so the frontend is unchanged.

---

## 7. HTTP API surface

All under `http://127.0.0.1:5000`. Paths are preserved from the original app.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | liveness |
| GET | `/api/meetings` | list meetings (newest first) |
| GET | `/api/meetings/:id` | one meeting (+ items + participants) |
| GET | `/api/meetings/:id/action-items` | items for a meeting |
| PUT | `/api/meetings/:id/title` | rename meeting |
| POST | `/api/meetings/:id/translate` | translate transcript + summary |
| POST | `/api/meetings/:id/sync-all-calendar` | sync all items → Google Calendar |
| POST | `/api/meetings/:id/export-notion` | export meeting → Notion |
| POST | `/api/meetings/:id/sync-all-jira` | sync all items → Jira |
| PUT | `/api/action-items/:id/complete` | toggle completion |
| POST | `/api/action-items/:id/sync-calendar` | sync one item → Calendar |
| POST | `/api/action-items/:id/sync-jira` | sync one item → Jira |
| GET | `/api/google/available` · `/auth-status` · `/auth-url` · `/callback` | Google OAuth |
| POST/GET | `/api/notion/configure` · `/status` | Notion setup/status |
| POST/GET | `/api/jira/configure` · `/status` | Jira setup/status |
| GET | `/api/translation/languages` | supported languages |
| GET | `/api/system/status` · `/models` | runtime + capability info |
| GET | `/data/audio/:filename` | serve recorded WAV |

Errors return `{ "error": <message>, "code": "AE-xxx" }` with the matching HTTP
status (e.g. `AE-404` for not found).

### Socket.IO events (Main ↔ Backend)

| Direction | Event | Payload |
|---|---|---|
| C→S | `start_recording` | `{ title, participants }` |
| C→S | `audio_chunk_ready` | `{ meeting_id, chunk_file }` (live chunk) |
| C→S | `stop_recording` | `{ meeting_id, audio_file }` |
| C→S | `sync_action_items` | `{ meeting_id, services[] }` |
| S→C | `connection_status` | `{ status }` |
| S→C | `recording_started` | `{ meeting_id, title }` |
| S→C | `live_transcript_update` | `{ meeting_id, text }` |
| S→C | `processing_status` | `{ meeting_id, status, progress }` |
| S→C | `meeting_processed` | `{ meeting, summary, action_items }` |
| S→C | `sync_complete` | `{ meeting_id, results }` |
| S→C | `error` | `{ message }` |

---

## 8. AI & integration providers

Providers are selected from `.env` and degrade gracefully when unconfigured.

- **Transcription** (`TRANSCRIPTION_MODEL`): `deepgram` / `assemblyai` (cloud,
  via HTTPS) or `whisper` (local, optional `whisper-node`). Falls back to a
  placeholder transcript if nothing is available.
- **Summarization / extraction**: Euron.one or OpenAI (OpenAI-compatible),
  Anthropic Claude, or a local LLM (`node-llama-cpp`, optional). Falls back to a
  heuristic summary / keyword extraction.
- **Google Calendar**: OAuth via `googleapis`; tokens persisted to
  `data/google_token.json`; requires `data/google_credentials.json`.
- **Notion**: `@notionhq/client`; configured at runtime via REST.
- **Jira**: `jira-client`; configured at runtime via REST.
- **Translation**: Google's free translate endpoint (no key).

Local models (`whisper-node`, `node-llama-cpp`) are **opt-in** — not base
dependencies — so a default `npm install` never triggers native builds.

---

## 9. Configuration

All configuration is environment-driven through `backend/app/common/config.js`
(a `convict` schema). Values come from a `.env` file in the project root
(git-ignored). Key variables:

```
PORT, HOST, NODE_ENV
TRANSCRIPTION_MODEL, TRANSCRIPTION_LANGUAGE, LIVE_TRANSCRIPTION_INTERVAL
OPENAI_API_KEY, ANTHROPIC_API_KEY, DEEPGRAM_API_KEY, ASSEMBLYAI_API_KEY
USE_EURON_API, EURON_API_KEY, EURON_API_BASE, EURON_MODEL
USE_LOCAL_MODEL, LOCAL_MODEL_PATH
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
NOTION_API_KEY, NOTION_DATABASE_ID
JIRA_API_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY
DATABASE_PATH (defaults to data/meetings.db)
```

`config.get('path.to.key')` is the access pattern; computed paths
(`BASE_DIR`, `DATA_DIR`, `AUDIO_DIR`) are exposed on `config.paths`.

---

## 10. Startup & lifecycle

```
npm start  →  electron .
   │
   electron/main.js  app.on('ready'):
     ├─ startBackend()      spawn `node backend/index.js`
     ├─ createWindow()      load frontend/index.html
     └─ connectToBackend()  socket.io-client with auto-reconnect (no fixed wait)

   backend/index.js:
     ├─ initDb()            open/create data/meetings.db
     ├─ getAppServer('main')  build Express app + auto-load routes
     ├─ app.listen(5000)
     └─ setupSocket(server)   attach Socket.IO + pipeline

   app.on('before-quit'): disconnect socket, kill backend process
   backend SIGTERM/SIGINT: close HTTP + socket, close DB, exit
```

The renderer's REST calls retry until the backend is up, so there's no fixed
startup delay.

---

## 11. Key design decisions

| Decision | Rationale |
|---|---|
| `node:sqlite` (built-in) over `better-sqlite3` | Zero native compilation; opens the existing DB file directly. Requires Node ≥ 22. |
| Backend as a spawned Node process | Electron's bundled Node lacks `node:sqlite`; a system-Node child process avoids ABI/rebuild issues. |
| Audio captured in renderer as raw PCM | Produces a valid 16-bit WAV for every transcription backend; `MediaRecorder` WebM would not. |
| Cloud transcription via HTTPS (no SDK) | Fewer dependencies; mirrors the original direct-HTTP approach. |
| Local Whisper/Llama optional | They pull heavy/native artifacts; lazy-loaded so base installs stay clean. |
| neo-style layered backend | Clear separation (routes → services → connections), auto-loaded routes, centralized errors/config; easy to extend. |
| Services as singletons | REST configuration and websocket sync share one client instance per integration. |

---

## 12. Extending the system

- **Add a REST resource**: drop `app/api/routes/main/api/<name>.route.js`
  (it auto-mounts at `/api/<name>`) and back it with a `pkg/<name>/service.js`.
- **Add a domain capability**: create `app/pkg/<name>/service.js` (+ optional
  `validation.js`), export a singleton, import it where needed.
- **Add a config value**: declare it in `app/common/config.js` (convict) and
  read it with `config.get(...)`.
- **Add a transcription/LLM provider**: extend the relevant `pkg` service's
  provider selection; keep the `{ text, segments, language }` / summary shapes.
- **Add a socket event**: handle it in `app/connections/websocket.js` and relay
  it to the renderer from `electron/main.js` if the UI needs it.

---

*See also: `README.md` (features & setup), `JS_MIGRATION_PLAN.md` (Python→JS
migration history), `INTEGRATION_SETUP.md` (per-integration configuration).*
