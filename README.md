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
- Share links for participant read-only access
- Notion export
- Provider/model selection for LLM and speech-to-text

## Tech Stack

- React + Vite frontend
- Node.js + Express backend
- Socket.IO for live meeting events
- PostgreSQL for persistent data
- `pg` for database access
- OpenAI-compatible, Anthropic, Deepgram, AssemblyAI, Hugging Face, and Notion integrations

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL 16+ or Docker

## Setup

Install root and frontend dependencies:

```bash
npm install
npm install --prefix frontend
```

Start PostgreSQL with Docker:

```bash
docker compose up -d postgres
```

Copy `.env.example` to `.env` and configure provider keys:

```env
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/ai_meeting_summarizer
DATABASE_SSL=false

TRANSCRIPTION_MODEL=deepgram
DEEPGRAM_API_KEY=your_deepgram_key

LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key
```

Start the app:

```bash
npm start
```

The backend serves the frontend at `http://127.0.0.1:5000`.

## Development

Run the frontend and backend side by side:

```bash
npm run dev
```

Run only the backend:

```bash
node backend/index.js
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

For local development, `docker-compose.yml` provides a Postgres container with
the same default `DATABASE_URL` used in `.env.example`.

## Project Structure

```text
backend/
  index.js
  app/
    api/                 Express routes and middleware
    common/              config, logger, errors, constants
    connections/         PostgreSQL and Socket.IO connections
    pkg/                 domain services
frontend/
  src/                   React application
data/
  audio/                 recorded audio files
docker-compose.yml       local PostgreSQL
.env.example             sample environment
```

## Troubleshooting

- `ECONNREFUSED 127.0.0.1:5432`: start Postgres or fix `DATABASE_URL`.
- `password authentication failed`: update the username/password in `DATABASE_URL`.
- No meetings show up: confirm the backend started and connected to Postgres.
- Transcription unavailable: configure an STT provider key in `.env`.
- AI responses unavailable: configure an LLM provider key in `.env`.
