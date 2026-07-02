# System Architecture

This document describes the backend/system-level architecture of the AI Meeting
Summarizer after the multi-host rewrite. For the frontend/user-facing side, see
`UI_ARCHITECTURE.md`.

## 1. High-Level Overview

A single Node.js/Express process serves both the REST+WebSocket API and the
built React frontend, backed by a local SQLite database and a set of
pluggable AI provider integrations (speech-to-text, LLM chat/summarization,
translation, Notion export).

```
                          ┌─────────────────────────────┐
   Browser (Host)  ─────► │                              │
                          │   Express (backend/index.js) │
   Browser (Participant,  │                              │
   via /share/:token) ──► │  ┌────────────┐  ┌─────────┐ │
                          │  │ REST routes │  │Socket.IO│ │
                          │  └─────┬──────┘  └────┬────┘ │
                          │        │              │      │
                          │  ┌─────▼──────────────▼────┐ │
                          │  │   pkg/ domain services   │ │
                          │  └─────┬────────────────────┘ │
                          │        │                      │
                          │  ┌─────▼──────┐   ┌─────────┐ │
                          │  │ node:sqlite │   │ AI APIs │ │
                          │  │ (data/*.db) │   │ (HTTPS) │ │
                          │  └─────────────┘   └─────────┘ │
                          └─────────────────────────────┘
```

Single entry point: `npm start` runs `npm run build --prefix frontend && node
backend/index.js` — the frontend is built to static files and served by the
same Express process that exposes the API, so there's exactly one process and
one port (`5000` by default) for the whole app.

## 2. Tech Stack

- **Runtime**: Node.js (ESM, `"type": "module"`), using `node:sqlite`
  (built-in, no native compile step) and `node:crypto` for password hashing —
  a deliberate choice to avoid any native-dependency build step.
- **Web framework**: Express 4, `helmet` + `compression` + `cors` middleware.
- **Real-time**: `socket.io` (server) / `socket.io-client` (frontend).
- **Auth**: `jsonwebtoken` (JWT) + `node:crypto` `scrypt` for password hashing.
- **Config**: `convict`, reading from a root `.env` file (via `dotenv`).
- **AI integrations**: `openai` SDK (also used for Euron and Hugging Face,
  since both expose OpenAI-compatible chat endpoints), `@anthropic-ai/sdk`,
  raw `axios` calls to Deepgram/AssemblyAI/Hugging Face's ASR endpoint, and
  `@notionhq/client` for Notion export.

## 3. Directory Structure (`backend/`)

```
backend/
  index.js                       # process entry point
  app/
    server.js                    # Express app factory: middleware, static
                                  # serving, route mounting, SPA fallback
    connections/
      database.js                # node:sqlite connection + schema/migrations
      websocket.js                # Socket.IO setup, handshake auth, rooms
    api/
      middlewares/
        auth.js                  # requireAuth — verifies JWT, sets req.user
        cors.js, errorhandler.js, asyncHandler.js
      routes/main/
        root.route.js             # GET /health
        data/audio.route.js       # GET /data/audio/:filename (recordings)
        api/
          auth.route.js           # signup/login/me/logout
          meetings.route.js       # host-authenticated meeting CRUD + shares
          action-items.route.js   # host-authenticated action-item toggling
          settings.route.js       # host-authenticated provider config
          system.route.js
          public/
            share.route.js        # unauthenticated, token-gated participant routes
    pkg/                          # domain services (business logic)
      auth/            service.js, validation.js
      meetings/         service.js, validation.js
      shares/           service.js
      settings/         service.js
      chat/             service.js
      transcription/    service.js
      summarizer/       service.js
      extraction/       service.js
      translation/      service.js
      notion/           service.js, validation.js
      processing/       service.js   # orchestrates the record→transcript→summary pipeline
      system/           service.js
    common/
      config.js                   # convict schema — every env var declared here
      constants.js                 # SUPPORTED_LANGUAGES, SOCKET_EVENTS, PROCESSING_STATUS
      logger.js
      error/            index.js, codes.js   # AppError + subclasses
```

Routes are **auto-loaded**: `routes/main/api/index.js` mounts every
subdirectory and every `*.route.js` file it finds under
`api/routes/main/api/` — new route files don't need manual registration.

## 4. Data Layer

SQLite at `data/meetings.db` (`node:sqlite`'s `DatabaseSync`, WAL mode,
foreign keys on). Schema is created with `CREATE TABLE IF NOT EXISTS` on
boot, plus a small set of guarded, idempotent migrations
(`addColumnIfMissing` / `dropColumnIfExists` helpers in `database.js`) so the
same code path works for both a fresh database and an existing one from a
prior version.

```
users                  meetings                     action_items
─────                  ────────                     ────────────
id (PK)                id (PK)                       id (PK)
email (unique)          host_id ─────────► users.id   meeting_id ──► meetings.id
password_hash          title                          description
created_at             start_time / end_time          assignee, due_date, priority
                       transcript (JSON text)          completed
                       summary                         synced_to_notion, external_id
                       audio_file_path                 created_at
                       created_at

participants            chat_messages                 meeting_shares
────────────            ─────────────                 ──────────────
id (PK)                 id (PK)                        id (PK)
meeting_id ──► meetings meeting_id ──► meetings         meeting_id ──► meetings
name, email, role       role (user/assistant)           token (unique)
                        content                         expires_at, revoked_at
                        created_at                      created_at
```

- **Ownership**: every meeting belongs to exactly one host (`meetings.host_id`).
  All host-side routes enforce this — a request for another host's meeting
  gets a 404 (not 403), so existence isn't leaked.
- **Sharing**: `meeting_shares` is a separate table (not columns on
  `meetings`) specifically so "revoke & regenerate" has history — revoke sets
  `revoked_at`; regenerate revokes the current row and inserts a new one. The
  active share for a meeting is the most recent row with `revoked_at IS NULL`
  and an unexpired `expires_at`.
- **Transcript storage**: stored as JSON text (`{text, segments, language}`),
  parsed back into an object on read.

## 5. Auth Model

- **Passwords**: hashed with `node:crypto`'s `scrypt` (salt + hash stored as
  `salt:hash` hex in `password_hash`) — no third-party hashing dependency,
  consistent with the project's "no native build step" stance.
- **Sessions**: stateless JWT, signed with `config.get('secret_key')`
  (30-day expiry). The frontend stores it in Redux (persisted to
  `localStorage`) and sends it as `Authorization: Bearer <token>`.
- **`requireAuth` middleware** (`api/middlewares/auth.js`): verifies the
  token, attaches `req.user = { id, email }`. Applied to every host-facing
  router (`meetings.route.js`, `action-items.route.js`, `settings.route.js`).
- **Participant access is a separate, parallel auth mode**: the
  `/api/public/share/:token/*` routes require no JWT at all — access is
  gated purely by possessing a valid, unrevoked, unexpired share token. This
  is intentionally a completely separate code path (`public/share.route.js`)
  from the host-authenticated routes, so the two auth modes can never cross.
- **Socket.IO auth**: the client sends `{ auth: { token } }` in the
  connection handshake; a `io.use(...)` middleware in `websocket.js` verifies
  it and rejects the connection otherwise. Each authenticated socket joins a
  `host:<hostId>` room, and all live-transcript/processing-status broadcasts
  are sent to that room specifically (`io.to('host:' + hostId).emit(...)`)
  rather than globally — this prevents one host from seeing another host's
  live meeting data over the socket.

## 6. Request Flow: Recording a Meeting

1. **Start**: Host's browser emits `start_recording` over the (already
   authenticated) socket → `websocket.js`'s `handleStartRecording` creates a
   `meetings` row (via `meetingsService.createMeeting`, with `hostId` taken
   from the verified socket, never trusted from client payload) → emits
   `recording_started` back with the new `meeting_id`.
2. **Live transcription**: the browser encodes 10-second PCM chunks to WAV
   client-side and `POST`s them to `/api/meetings/:id/audio-chunk`.
   `processingService.processLiveChunk` transcribes each chunk and broadcasts
   `live_transcript_update` to the host's room.
3. **Stop**: the browser `POST`s the full recording to
   `/api/meetings/:id/audio`. `processingService.processRecording` runs the
   pipeline sequentially — transcribe → summarize → extract action items —
   emitting `processing_status` events at each stage, persists the result via
   `meetingsService.endMeeting` + `createActionItems`, and emits
   `meeting_processed` with the final meeting object.

This pipeline is provider-agnostic: `transcriptionService`,
`summarizerService`, and `extractionService` each dispatch on
`config.get('transcription_model')` / provider-priority chains to whichever
of Whisper (local)/Deepgram/AssemblyAI/Hugging Face (transcription) or
OpenAI/Anthropic/Euron/Hugging Face (summarization/extraction) is actually
configured, falling back gracefully when none are.

## 7. Chatbot: Grounded Tool-Calling

`chat/service.js`'s `ChatbotService.ask(meetingId, question, provider)` does
not simply forward the question to an LLM. It defines one tool,
`get_meeting_transcript`, and **forces** the model to call it on the first
turn (`tool_choice` pinned to that function for both the OpenAI-style and
Anthropic call paths) before it's allowed to answer. The tool "call" just
returns the meeting's stored transcript text — there's no external
side-effect — but forcing the round-trip guarantees the model's answer is
grounded in the actual transcript rather than guessed from the question
alone. The same service backs both the host chat routes
(`/api/meetings/:id/chat`) and the participant chat routes
(`/api/public/share/:token/chat`) — it only ever needs a `meetingId`, so it's
naturally reusable across both auth modes.

## 8. Settings & Provider Configuration

`GET/PUT /api/settings` (host-only) reports which providers have keys
configured (booleans only — key values are never returned) and lets the host
edit them. Writes go through `settingsService.update()`, which:

1. Calls `config.set(...)` on the in-memory convict config, so the change
   takes effect immediately for the running process.
2. Patches the corresponding `KEY=value` line in the root `.env` file
   (line-based find/replace, or append if missing), so the change survives a
   restart — consistent with how every provider key already works via
   convict + dotenv.

Provider keys are **global**, not per-host — one operator-configured set of
keys serves every host account on the instance.

## 9. Error Handling

`AppError` (and subclasses `BadRequest`, `UnauthorizedRequest`, `NotFound`,
etc. — `common/error/index.js`) carry a `statusCode` and `code`. The global
`errorHandler` middleware logs 5xx errors server-side but **never** returns
`err.stack` in the API response, regardless of environment — stack traces are
a server-log concern, not a client-facing one. `expressAsyncHandler` wraps
async route handlers so rejected promises reach this middleware instead of
crashing the process.

## 10. Security Notes

- **Path traversal**: two places take user-controlled path-like input —
  `router.param('id', ...)` in `meetings.route.js` validates the id is
  `/^\d+$/` before it ever reaches multer's filename builder, and
  `/data/audio/:filename` runs the requested name through `path.basename()`
  before joining it to `AUDIO_DIR`, so `..`/`\`-based escapes can't reach
  outside the audio directory.
- **Upload limits**: audio uploads are capped (`multer` `limits.fileSize`)
  and mimetype-filtered (`audio/*` only).
- **Share tokens**: `crypto.randomBytes(24)` base64url-encoded (192 bits of
  entropy) — practically unguessable; there's no rate-limiting on the
  `/api/public/*` routes, which is an accepted tradeoff for this app's scale.
- **CORS** is fully open (`origin: '*'`) since auth is bearer-token-based,
  not cookie-based, so there's no CSRF surface to protect with origin locking.

## 11. Build & Deployment

```json
"scripts": {
  "start": "npm run build --prefix frontend && node backend/index.js",
  "dev":   "concurrently \"npm run dev --prefix frontend\" \"node backend/index.js\"",
  "build": "npm run build --prefix frontend"
}
```

- **Production** (`npm start`): builds the React app to `frontend/dist/`,
  then starts Express, which serves `frontend/dist` as static files and
  falls back to `frontend/dist/index.html` for any non-`/api` GET request
  (`app.get(/^(?!\/api\/).*/, ...)` in `server.js`) — this is what lets a
  participant's `/share/:token` link load the SPA shell, which then reads
  `window.location.pathname` client-side to decide what to render.
- **Development** (`npm run dev`): runs the Vite dev server (HMR) and the
  Express backend side-by-side via `concurrently`; Vite proxies `/api` and
  `/socket.io` requests to the backend.
