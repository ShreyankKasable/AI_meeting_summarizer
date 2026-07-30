/**
 * Meeting share-link service.
 */
import { randomBytes } from 'node:crypto';
import { query } from '#app/connections/database.js';

const EXPIRY_MS = {
  never: null,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const nowIso = () => new Date().toISOString();

export class SharesService {
  async getActiveShare (meetingId) {
    const result = await query(
      `SELECT * FROM meeting_shares
       WHERE meeting_id = $1 AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > $2)
       ORDER BY id DESC LIMIT 1`,
      [meetingId, nowIso()]
    );
    return result.rows[0] ? formatShare(result.rows[0]) : null;
  }

  async createShare (meetingId, expiresIn = 'never') {
    const token = randomBytes(24).toString('base64url');
    const ms = EXPIRY_MS[expiresIn] ?? null;
    const expiresAt = ms ? new Date(Date.now() + ms).toISOString() : null;

    const result = await query(
      `INSERT INTO meeting_shares (meeting_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [meetingId, token, expiresAt, nowIso()]
    );
    return formatShare(result.rows[0]);
  }

  async revokeShare (meetingId) {
    const active = await this.getActiveShare(meetingId);
    if (!active) return null;
    await query('UPDATE meeting_shares SET revoked_at = $1 WHERE id = $2', [nowIso(), active.id]);
    return true;
  }

  async regenerateShare (meetingId, expiresIn = 'never') {
    await this.revokeShare(meetingId);
    return this.createShare(meetingId, expiresIn);
  }

  async getShareById (id) {
    const result = await query('SELECT * FROM meeting_shares WHERE id = $1', [id]);
    return result.rows[0] ? formatShare(result.rows[0]) : null;
  }

  async resolveToken (token) {
    const result = await query(
      `SELECT * FROM meeting_shares
       WHERE token = $1 AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > $2)`,
      [token, nowIso()]
    );
    return result.rows[0] ? formatShare(result.rows[0]) : null;
  }
}

function formatShare (row) {
  return {
    id: row.id,
    meeting_id: row.meeting_id,
    token: row.token,
    expires_at: toIso(row.expires_at),
    revoked_at: toIso(row.revoked_at),
    created_at: toIso(row.created_at),
  };
}

function toIso (value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

export const sharesService = new SharesService();
