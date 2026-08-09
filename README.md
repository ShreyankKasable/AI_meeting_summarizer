# AI Meeting Summarizer

AI Meeting Summarizer records meetings, transcribes the audio, generates a
meeting summary, extracts action items, and lets hosts or shared participants
chat with the meeting transcript.

## Features

- Host signup/login with JWT authentication
- New meeting flow with browser audio recording
- Live transcription updates during recording
- AI-generated summaries and action items
- Markdown rendering for meeting summaries
- Meeting transcript editing and speaker renaming
- Meeting-specific AI chat
- RAG chat over transcript chunks with pgvector
- Share links for signed-in participant read-only access
- Host-visible anonymous share access activity
- Notion export
- Provider/model selection for LLM and speech-to-text

## Tech Stack

- React + Vite frontend
- Node.js + Express backend
- Socket.IO for live meeting events
- PostgreSQL for persistent data
- pgvector for transcript similarity search
- Redis + BullMQ for background embedding jobs
- Cloudflare R2 compatible recording storage
- `pg` for database access
- OpenAI-compatible, Anthropic, Deepgram, AssemblyAI, Hugging Face, and Notion integrations

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL 16+ and Redis, or Docker

## Setup

Install root and frontend dependencies:

```bash
npm install
npm install --prefix frontend
```

Start PostgreSQL and Redis with Docker:

```bash
docker compose up -d postgres redis
```

Copy `.env.example` to `.env` and configure provider keys:

```env
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/ai_meeting_summarizer
DATABASE_SSL=false
REDIS_URL=redis://127.0.0.1:6379
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

TRANSCRIPTION_MODEL=deepgram
DEEPGRAM_API_KEY=your_deepgram_key

LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key

EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
EMBEDDING_WORKER_CONCURRENCY=2

AUDIO_STORAGE_PROVIDER=local
AUDIO_COMPRESS_RECORDINGS=true
AUDIO_STORAGE_FORMAT=mp3
AUDIO_COMPRESSION_BITRATE_KBPS=48
```

Start the app:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API/Socket.IO traffic
to the backend at `http://localhost:5000`.

## Development

Run the frontend and backend side by side:

```bash
npm run dev
```

Run only the backend:

```bash
npm start
```

The backend is API/Socket.IO only. It does not serve the React app; deploy the
frontend separately and set `FRONTEND_ORIGINS` on the backend to the deployed
frontend origin.

Run only the embedding worker:

```bash
npm run worker:embeddings
```

Build the frontend:

```bash
npm run build
```

## Database

The app uses PostgreSQL. The backend creates the required tables on startup:

- `users`
- `meetings`
- `participants`
- `action_items`
- `chat_messages`
- `meeting_shares`
- `meeting_access_grants`
- `share_accesses`
- `transcript_chunks`

For local development, `docker-compose.yml` provides Postgres with pgvector and
Redis with the same default URLs used in `.env.example`.

Meeting chat uses `transcript_chunks` plus pgvector similarity search. The full
transcript remains stored on the meeting for display/export, but LLM chat only
receives the summary and the most relevant transcript excerpts. Embedding
generation runs in the BullMQ worker after the meeting transcript is saved, so
recording processing does not block on vector indexing.

## Recording Storage

By default, recordings are stored locally in `data/audio`. To store completed
recordings in Cloudflare R2, create an R2 bucket and API token, then configure:

```env
AUDIO_STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_BUCKET=your_bucket_name
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_REGION=auto
R2_KEY_PREFIX=recordings
```

`R2_ENDPOINT` is optional when `R2_ACCOUNT_ID` is set. The backend keeps a
temporary local WAV file while transcription and processing run, compresses the
completed recording to MP3, uploads the smaller MP3 to R2, deletes temporary
local files, and streams playback through the existing `/data/audio/...` route.

Compression is enabled by default:

```env
AUDIO_COMPRESS_RECORDINGS=true
AUDIO_STORAGE_FORMAT=mp3
AUDIO_COMPRESSION_BITRATE_KBPS=48
AUDIO_COMPRESSION_TIMEOUT_MS=600000
```

For speech recordings, 48 kbps MP3 is usually much smaller than WAV while still
being clear enough for playback.

## Project Structure

```text
backend/
  index.js
  app/
    api/                 Express routes and middleware
    common/              config, logger, errors, constants
    connections/         PostgreSQL and Socket.IO connections
    queues/              BullMQ queue producers and Redis connection config
    workers/             background workers
    pkg/                 domain services
frontend/
  src/                   React application
data/
  audio/                 local temporary and local-provider recorded audio files
docker-compose.yml       local PostgreSQL and Redis
.env.example             sample environment
```

## Troubleshooting

- `ECONNREFUSED 127.0.0.1:5432`: start Postgres or fix `DATABASE_URL`.
- `ECONNREFUSED 127.0.0.1:6379`: start Redis or fix `REDIS_URL`.
- `password authentication failed`: update the username/password in `DATABASE_URL`.
- No meetings show up: confirm the backend started and connected to Postgres.
- Transcription unavailable: configure an STT provider key in `.env`.
- AI responses unavailable: configure an LLM provider key in `.env`.
