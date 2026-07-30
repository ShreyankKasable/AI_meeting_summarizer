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

    ALTER TABLE meetings
      ADD COLUMN IF NOT EXISTS host_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

    ALTER TABLE chat_messages
      ADD COLUMN IF NOT EXISTS actor_key VARCHAR(80) NOT NULL DEFAULT 'legacy';

    CREATE INDEX IF NOT EXISTS idx_meetings_host_start
      ON meetings(host_id, start_time DESC);

    CREATE INDEX IF NOT EXISTS idx_action_items_meeting
      ON action_items(meeting_id, created_at);

    CREATE INDEX IF NOT EXISTS idx_participants_meeting
      ON participants(meeting_id);

    CREATE INDEX IF NOT EXISTS idx_chat_messages_thread
      ON chat_messages(meeting_id, actor_key, id);

    CREATE INDEX IF NOT EXISTS idx_meeting_shares_active
      ON meeting_shares(meeting_id, revoked_at, expires_at);
  `);

  logger.info('PostgreSQL database initialized successfully');
  return database;
}

export async function disconnect () {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
