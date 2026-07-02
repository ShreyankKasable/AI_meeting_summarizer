/**
 * SQLite connection (node:sqlite — built-in, no native build).
 *
 * Opens the same data/meetings.db the Python/SQLAlchemy version used and creates
 * the schema with CREATE TABLE IF NOT EXISTS so existing data is read untouched.
 */
import { DatabaseSync } from 'node:sqlite';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';

let db = null;

export function getDb () {
  if (!db) {
    db = new DatabaseSync(config.get('database_path'));
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
  }
  return db;
}

export function initDb () {
  const database = getDb();
  database.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      title           VARCHAR(255) NOT NULL,
      start_time      DATETIME,
      end_time        DATETIME,
      transcript      TEXT,
      summary         TEXT,
      audio_file_path VARCHAR(500),
      created_at      DATETIME
    );

    CREATE TABLE IF NOT EXISTS action_items (
      id                 INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id         INTEGER NOT NULL,
      description        TEXT NOT NULL,
      assignee           VARCHAR(255),
      due_date           DATETIME,
      priority           VARCHAR(50) DEFAULT 'medium',
      completed          BOOLEAN DEFAULT 0,
      synced_to_notion   BOOLEAN DEFAULT 0,
      external_id        VARCHAR(255),
      created_at         DATETIME,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS participants (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      name       VARCHAR(255) NOT NULL,
      email      VARCHAR(255),
      role       VARCHAR(100),
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      actor_key  VARCHAR(80) NOT NULL,
      role       VARCHAR(20) NOT NULL,
      content    TEXT NOT NULL,
      created_at DATETIME,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at    DATETIME
    );

    CREATE TABLE IF NOT EXISTS meeting_shares (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      token      VARCHAR(64) NOT NULL UNIQUE,
      expires_at DATETIME,
      revoked_at DATETIME,
      created_at DATETIME,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    );
  `);
  dropColumnIfExists(database, 'action_items', 'synced_to_calendar');
  dropColumnIfExists(database, 'action_items', 'synced_to_jira');
  addColumnIfMissing(database, 'meetings', 'host_id', 'host_id INTEGER REFERENCES users(id)');
  // Existing rows predate per-actor threads — bucket them under a shared key
  // so they don't retroactively appear as any specific host's or
  // participant's thread; new messages always carry a real actor_key.
  addColumnIfMissing(database, 'chat_messages', 'actor_key', "actor_key VARCHAR(80) NOT NULL DEFAULT 'legacy'");
  logger.info('Database initialized successfully');
  return database;
}

// Adds a new column to an existing DB file (no-op if already present, and a
// no-op on fresh DBs since the CREATE TABLE above doesn't need it either way).
// Mirrors dropColumnIfExists but for ADD COLUMN.
function addColumnIfMissing (database, table, column, ddl) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all();
  if (columns.some((c) => c.name === column)) return;
  try {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
    logger.info(`Added column ${table}.${column}`);
  } catch (e) {
    logger.warn(`Could not add ${table}.${column}:`, e.message);
  }
}

// Removes a leftover column from an existing DB file (no-op on fresh DBs,
// since the CREATE TABLE above no longer defines it). Guarded with try/catch
// since DROP COLUMN requires SQLite 3.35+.
function dropColumnIfExists (database, table, column) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((c) => c.name === column)) return;
  try {
    database.exec(`ALTER TABLE ${table} DROP COLUMN ${column}`);
    logger.info(`Dropped unused column ${table}.${column}`);
  } catch (e) {
    logger.warn(`Could not drop ${table}.${column}:`, e.message);
  }
}

export function disconnect () {
  if (db) {
    db.close();
    db = null;
  }
}
