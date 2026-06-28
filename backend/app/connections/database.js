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
      synced_to_calendar BOOLEAN DEFAULT 0,
      synced_to_notion   BOOLEAN DEFAULT 0,
      synced_to_jira     BOOLEAN DEFAULT 0,
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
  `);
  logger.info('Database initialized successfully');
  return database;
}

export function disconnect () {
  if (db) {
    db.close();
    db = null;
  }
}
