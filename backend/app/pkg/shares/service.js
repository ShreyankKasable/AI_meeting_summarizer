/**
 * Meeting share-link service — issues, revokes, and redeems the tokens
 * participants use to view a meeting without an account.
 *
 * The active share for a meeting is the most recent `meeting_shares` row with
 * `revoked_at IS NULL` and (`expires_at IS NULL OR expires_at > now`).
 * Regenerate = revoke the current row + insert a new one, so revoked tokens
 * stay around as history rather than being overwritten.
 */
import { randomBytes } from 'node:crypto';
import { getDb } from '#app/connections/database.js';

const EXPIRY_MS = {
  never: null,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const nowIso = () => new Date().toISOString();

export class SharesService {
  getActiveShare (meetingId) {
    const row = getDb().prepare(
      `SELECT * FROM meeting_shares
       WHERE meeting_id = ? AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > ?)
       ORDER BY id DESC LIMIT 1`
    ).get(meetingId, nowIso());
    return row ? formatShare(row) : null;
  }

  createShare (meetingId, expiresIn = 'never') {
    const db = getDb();
    const token = randomBytes(24).toString('base64url');
    const ms = EXPIRY_MS[expiresIn] ?? null;
    const expiresAt = ms ? new Date(Date.now() + ms).toISOString() : null;

    const info = db.prepare(
      'INSERT INTO meeting_shares (meeting_id, token, expires_at, created_at) VALUES (?, ?, ?, ?)'
    ).run(meetingId, token, expiresAt, nowIso());
    return this.getShareById(Number(info.lastInsertRowid));
  }

  revokeShare (meetingId) {
    const active = this.getActiveShare(meetingId);
    if (!active) return null;
    getDb().prepare('UPDATE meeting_shares SET revoked_at = ? WHERE id = ?').run(nowIso(), active.id);
    return true;
  }

  regenerateShare (meetingId, expiresIn = 'never') {
    this.revokeShare(meetingId);
    return this.createShare(meetingId, expiresIn);
  }

  getShareById (id) {
    const row = getDb().prepare('SELECT * FROM meeting_shares WHERE id = ?').get(id);
    return row ? formatShare(row) : null;
  }

  // Looks up a token and returns it only if still active (not revoked/expired).
  resolveToken (token) {
    const row = getDb().prepare(
      `SELECT * FROM meeting_shares
       WHERE token = ? AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > ?)`
    ).get(token, nowIso());
    return row ? formatShare(row) : null;
  }
}

function formatShare (row) {
  return {
    id: row.id,
    meeting_id: row.meeting_id,
    token: row.token,
    expires_at: row.expires_at || null,
    revoked_at: row.revoked_at || null,
    created_at: row.created_at || null,
  };
}

export const sharesService = new SharesService();
