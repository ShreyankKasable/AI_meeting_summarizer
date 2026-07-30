# Architecture

AI Meeting Summarizer is a browser app backed by a Node.js service.

For detailed backend architecture, see `SYSTEM_ARCHITECTURE.md`.
For frontend architecture, see `UI_ARCHITECTURE.md`.

## High-Level Shape

```text
React frontend
  |
  | REST + Socket.IO
  v
Express backend
  |
  +-- PostgreSQL + pgvector
  +-- Speech-to-text providers
  +-- LLM providers
  +-- Notion
```

## Main Runtime Pieces

- `frontend/`: React + Vite application.
- `backend/index.js`: process entry point.
- `backend/app/server.js`: Express app setup, static serving, route mounting.
- `backend/app/connections/database.js`: PostgreSQL pool, pgvector extension,
  and schema bootstrap.
- `backend/app/connections/websocket.js`: Socket.IO auth and recording events.
- `backend/app/pkg/*`: domain services for auth, meetings, chat, sharing,
  transcription, summarization, extraction, settings, and integrations.

## Data Store

The app uses PostgreSQL through the `pg` package. Local development can use the
pgvector-enabled Postgres service in `docker-compose.yml`.

Default local URL:

```env
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/ai_meeting_summarizer
```

## Request Flow

1. The host authenticates and opens the dashboard.
2. Starting a meeting creates a `meetings` row over Socket.IO.
3. Audio chunks and final recordings are uploaded through REST endpoints.
4. The backend transcribes audio, summarizes the transcript, extracts action
   items, chunks the transcript, embeds chunks, and persists everything in
   Postgres.
5. Chat retrieves relevant chunks through pgvector instead of sending the full
   transcript to the LLM.
6. The frontend receives live Socket.IO updates and refreshes saved meeting
   data through REST calls.
