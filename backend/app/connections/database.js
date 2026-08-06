/**
 * PostgreSQL connection and schema bootstrap.
 */
import pg from 'pg';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';

const { Pool } = pg;

let pool = null;

export function getPool () {
  if (!pool) {
    pool = new Pool({
      connectionString: config.get('database.url'),
      ssl: config.get('database.ssl') ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected PostgreSQL pool error:', err);
    });
  }

  return pool;
}

export function query (text, params = []) {
  return getPool().query(text, params);
}

export async function withTransaction (callback) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function initDb () {
  const database = getPool();
  const vectorDimensions = Number(config.get('embedding.dimensions'));

  if (!Number.isInteger(vectorDimensions) || vectorDimensions < 1 || vectorDimensions > 16000) {
    throw new Error(`Invalid EMBEDDING_DIMENSIONS value: ${vectorDimensions}`);
  }

  try {
    await database.query('CREATE EXTENSION IF NOT EXISTS vector;');
  } catch (error) {
    throw new Error(
      `pgvector extension is required. Use the pgvector Docker image or enable the vector extension in Postgres. ${error.message}`
    );
  }

  await database.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at    TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id              SERIAL PRIMARY KEY,
      host_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
      title           VARCHAR(255) NOT NULL,
      start_time      TIMESTAMPTZ,
      end_time        TIMESTAMPTZ,
      transcript      TEXT,
      summary         TEXT,
      audio_file_path VARCHAR(500),
      embedding_status VARCHAR(30) NOT NULL DEFAULT 'not_started',
      embedding_error TEXT,
      embedding_job_id VARCHAR(255),
      embedding_queued_at TIMESTAMPTZ,
      embedding_started_at TIMESTAMPTZ,
      embedding_completed_at TIMESTAMPTZ,
      created_at      TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS action_items (
      id               SERIAL PRIMARY KEY,
      meeting_id       INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      description      TEXT NOT NULL,
      assignee         VARCHAR(255),
      due_date         TIMESTAMPTZ,
      priority         VARCHAR(50) DEFAULT 'medium',
      completed        BOOLEAN DEFAULT false,
      synced_to_notion BOOLEAN DEFAULT false,
      external_id      VARCHAR(255),
      created_at       TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS participants (
      id         SERIAL PRIMARY KEY,
      meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      name       VARCHAR(255) NOT NULL,
      email      VARCHAR(255),
      role       VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id         SERIAL PRIMARY KEY,
      meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      actor_key  VARCHAR(80) NOT NULL DEFAULT 'legacy',
      role       VARCHAR(20) NOT NULL,
      content    TEXT NOT NULL,
      created_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS meeting_shares (
      id         SERIAL PRIMARY KEY,
      meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      token      VARCHAR(64) NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS meeting_access_grants (
      id           SERIAL PRIMARY KEY,
      meeting_id   INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      share_id     INTEGER REFERENCES meeting_shares(id) ON DELETE SET NULL,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_email   VARCHAR(255),
      status       VARCHAR(20) NOT NULL DEFAULT 'pending',
      requested_at TIMESTAMPTZ NOT NULL,
      approved_at  TIMESTAMPTZ,
      rejected_at  TIMESTAMPTZ,
      removed_at   TIMESTAMPTZ,
      updated_at   TIMESTAMPTZ NOT NULL,
      UNIQUE (meeting_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS share_accesses (
      id             SERIAL PRIMARY KEY,
      share_id       INTEGER NOT NULL REFERENCES meeting_shares(id) ON DELETE CASCADE,
      meeting_id     INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      participant_id VARCHAR(100) NOT NULL,
      viewer_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      viewer_email   VARCHAR(255),
      first_seen_at  TIMESTAMPTZ NOT NULL,
      last_seen_at   TIMESTAMPTZ NOT NULL,
      view_count     INTEGER NOT NULL DEFAULT 0,
      chat_count     INTEGER NOT NULL DEFAULT 0,
      translate_count INTEGER NOT NULL DEFAULT 0,
      last_activity  VARCHAR(40),
      user_agent     TEXT,
      UNIQUE (share_id, participant_id)
    );

    CREATE TABLE IF NOT EXISTS transcript_chunks (
      id            SERIAL PRIMARY KEY,
      meeting_id    INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      chunk_index   INTEGER NOT NULL,
      speaker       VARCHAR(255),
      start_seconds DOUBLE PRECISION,
      end_seconds   DOUBLE PRECISION,
      text          TEXT NOT NULL,
      embedding     vector(${vectorDimensions}),
      created_at    TIMESTAMPTZ DEFAULT now(),
      UNIQUE (meeting_id, chunk_index)
    );

    ALTER TABLE meetings
      ADD COLUMN IF NOT EXISTS host_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS embedding_status VARCHAR(30) NOT NULL DEFAULT 'not_started',
      ADD COLUMN IF NOT EXISTS embedding_error TEXT,
      ADD COLUMN IF NOT EXISTS embedding_job_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS embedding_queued_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS embedding_started_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS embedding_completed_at TIMESTAMPTZ;

    ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS actor_key VARCHAR(80) NOT NULL DEFAULT 'legacy';

    ALTER TABLE share_accesses
      ADD COLUMN IF NOT EXISTS viewer_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS viewer_email VARCHAR(255);

    CREATE INDEX IF NOT EXISTS idx_meetings_host_start
      ON meetings(host_id, start_time DESC);

    CREATE INDEX IF NOT EXISTS idx_meetings_embedding_status
      ON meetings(embedding_status, embedding_queued_at DESC);

    CREATE INDEX IF NOT EXISTS idx_action_items_meeting
      ON action_items(meeting_id, created_at);

    CREATE INDEX IF NOT EXISTS idx_participants_meeting
      ON participants(meeting_id);

    CREATE INDEX IF NOT EXISTS idx_chat_messages_thread
      ON chat_messages(meeting_id, actor_key, id);

    CREATE INDEX IF NOT EXISTS idx_meeting_shares_active
      ON meeting_shares(meeting_id, revoked_at, expires_at);

    CREATE INDEX IF NOT EXISTS idx_meeting_access_grants_meeting
      ON meeting_access_grants(meeting_id, status, updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_meeting_access_grants_user
      ON meeting_access_grants(user_id, status, updated_at DESC);

    CREATE INDEX IF NOT EXISTS idx_share_accesses_meeting
      ON share_accesses(meeting_id, last_seen_at DESC);

    CREATE INDEX IF NOT EXISTS idx_share_accesses_viewer
      ON share_accesses(meeting_id, viewer_user_id, last_seen_at DESC);

    CREATE INDEX IF NOT EXISTS idx_transcript_chunks_meeting
      ON transcript_chunks(meeting_id, chunk_index);
  `);

  try {
    await database.query(`
      CREATE INDEX IF NOT EXISTS idx_transcript_chunks_embedding
        ON transcript_chunks USING hnsw (embedding vector_cosine_ops);
    `);
  } catch (error) {
    logger.warn('Could not create pgvector HNSW index:', error.message);
  }

  logger.info('PostgreSQL database initialized successfully');
  return database;
}

export async function disconnect () {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
