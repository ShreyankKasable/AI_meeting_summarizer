# Quick Start Guide

## 1. Install dependencies

```bash
npm install
npm install --prefix frontend
```

## 2. Start PostgreSQL

```bash
docker compose up -d postgres
```

## 3. Configure integrations

Copy `.env.example` to `.env`, then add your provider keys.

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

Open `http://127.0.0.1:5000`.
