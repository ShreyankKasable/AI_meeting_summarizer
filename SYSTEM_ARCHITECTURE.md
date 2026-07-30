# System Architecture

This document describes the backend/system-level architecture of AI Meeting
Summarizer. For frontend structure, see `UI_ARCHITECTURE.md`.

## Overview

A single Node.js/Express process serves the REST API, Socket.IO events, and the
built React frontend. Persistent data lives in PostgreSQL. Recorded audio files
are stored on disk under `data/audio/`.

```text
Browser host / shared participant
        |
        v
Express API + Socket.IO
        |
        v
Domain services in backend/app/pkg
        |
        +-- PostgreSQL via pg
        +-- AI provider APIs
        +-- Notion API
```

## Runtime

- `backend/index.js` initializes PostgreSQL, starts Express, and attaches
  Socket.IO.
- `npm start` builds the frontend and starts the backend.
- `npm run dev` runs Vite and the backend together for development.

## Backend Layout

```text
backend/
  index.js
  app/
    server.js
    connections/
      database.js        PostgreSQL pool and schema bootstrap
      websocket.js       Socket.IO setup and recording events
    api/
      middlewares/
      routes/main/
    pkg/
      auth/
      meetings/
      chat/
      shares/
      processing/
      transcription/
      summarizer/
      extraction/
      settings/
      notion/
      system/
    common/
      config.js
      constants.js
      logger.js
      error/
```

## Data Layer

`backend/app/connections/database.js` owns the Postgres pool, transaction helper,
and idempotent schema creation.

Tables:

- `users`
- `meetings`
- `participants`
- `action_items`
- `chat_messages`
- `meeting_shares`

Key relationships:

- `meetings.host_id` references `users.id`.
- `participants.meeting_id`, `action_items.meeting_id`,
  `chat_messages.meeting_id`, and `meeting_shares.meeting_id` reference
  `meetings.id` with cascade delete.
- Share tokens are stored in `meeting_shares`; revoke/regenerate preserves
  token history instead of overwriting meeting columns.

## Auth

- Passwords use Node's built-in `crypto.scrypt`.
- Sessions use signed JWTs.
- Host routes use `requireAuth`.
- Public participant routes are token-gated through `/api/public/share/:token`.
- Socket.IO validates the same host JWT during the connection handshake.

## Recording Flow

1. Host starts a meeting from the browser.
2. Socket.IO handles `start_recording` and creates the meeting row.
3. The browser uploads live audio chunks to `/api/meetings/:id/audio-chunk`.
4. The backend transcribes chunks and broadcasts live transcript updates.
5. The browser uploads the final recording to `/api/meetings/:id/audio`.
6. `processingService` transcribes, summarizes, extracts action items, persists
   the result, and emits completion events.

## Chat Flow

`chat/service.js` stores one private chat thread per actor key:

- `host:<hostId>`
- `participant:<participantId>`

Before answering, the model is forced to retrieve the meeting transcript through
the internal `get_meeting_transcript` tool so answers stay grounded in saved
meeting content.

## Configuration

Important environment variables:

```env
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/ai_meeting_summarizer
DATABASE_SSL=false
SECRET_KEY=change-me

TRANSCRIPTION_MODEL=deepgram
LLM_PROVIDER=openai
```

Provider keys are server-side/global. The settings UI lets users choose the
provider and model; the app uses the server-owned keys from `.env`.
