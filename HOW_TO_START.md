# How to Start the Application

This app is 100% JavaScript and uses PostgreSQL for persistent data.
The local Docker database includes pgvector for meeting transcript RAG.

## 1. Install dependencies

```bash
cd AI_meeting_summarizer
npm install
```

## 2. Start PostgreSQL

With Docker:

```bash
docker compose up -d postgres
```

Or use a locally installed PostgreSQL instance and set `DATABASE_URL` in `.env`.

## 3. Configure environment

Copy `.env.example` to `.env` and adjust values as needed.

```env
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/ai_meeting_summarizer
DATABASE_SSL=false
EMBEDDING_MODEL=text-embedding-3-small
RAG_ENABLED=true
```

## 4. Start the app

```bash
npm start
```

The backend serves the frontend at `http://127.0.0.1:5000`.

## Debug Backend Only

```bash
node backend/index.js
```

## Troubleshooting

- `ECONNREFUSED 127.0.0.1:5432`: PostgreSQL is not running or `DATABASE_URL` is wrong.
- `password authentication failed`: update `DATABASE_URL` to match your Postgres username/password.
- `relation does not exist`: restart the backend so schema initialization runs.
- No microphone prompt: grant microphone access in your browser and OS privacy settings.
- Transcription unavailable: configure one STT provider in `.env`, such as Deepgram or AssemblyAI.
