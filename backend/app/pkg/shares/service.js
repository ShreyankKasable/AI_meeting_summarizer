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

const ACCESS_STATUS = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  removed: 'removed',
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

  async resolveToken (token, { includeInactive = false } = {}) {
    const activeFilter = includeInactive
      ? ''
      : 'AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > $2)';
    const params = includeInactive ? [token] : [token, nowIso()];
    const result = await query(
      `SELECT * FROM meeting_shares
       WHERE token = $1 ${activeFilter}`,
      params
    );
    return result.rows[0] ? formatShare(result.rows[0]) : null;
  }

  isShareActive (share) {
    return isShareActive(share);
  }

  async requestAccess (share, user) {
    const viewerUserId = normaliseViewerId(user?.id);
    if (!share || !viewerUserId) return null;

    const now = nowIso();
    const result = await query(
      `INSERT INTO meeting_access_grants
         (meeting_id, share_id, user_id, user_email, status, requested_at, updated_at)
       VALUES
         ($1, $2, $3, $4, $5::VARCHAR(20), $6::TIMESTAMPTZ, $6::TIMESTAMPTZ)
       ON CONFLICT (meeting_id, user_id)
       DO UPDATE SET
         share_id = EXCLUDED.share_id,
         user_email = COALESCE(EXCLUDED.user_email, meeting_access_grants.user_email),
         status = CASE
           WHEN meeting_access_grants.status = $7::VARCHAR(20) THEN meeting_access_grants.status
           ELSE $5::VARCHAR(20)
         END,
         requested_at = CASE
           WHEN meeting_access_grants.status = $7::VARCHAR(20) THEN meeting_access_grants.requested_at
           ELSE EXCLUDED.requested_at
         END,
         approved_at = CASE
           WHEN meeting_access_grants.status = $7::VARCHAR(20) THEN meeting_access_grants.approved_at
           ELSE NULL
         END,
         rejected_at = NULL,
         removed_at = NULL,
         updated_at = EXCLUDED.updated_at
       RETURNING *`,
      [
        share.meeting_id,
        share.id,
        viewerUserId,
        truncate(user?.email, 255),
        ACCESS_STATUS.pending,
        now,
        ACCESS_STATUS.approved,
      ]
    );

    return formatAccessGrant(result.rows[0]);
  }

  async getUserAccessStatus (share, meeting, user) {
    const viewerUserId = normaliseViewerId(user?.id);
    if (!share || !meeting || !viewerUserId) {
      return { status: ACCESS_STATUS.pending, can_access: false, request: null };
    }

    if (Number(meeting.host_id) === viewerUserId) {
      return {
        status: ACCESS_STATUS.approved,
        can_access: true,
        role: 'host',
        meeting_id: meeting.id,
        request: null,
      };
    }

    const grant = await this.getAccessGrant(meeting.id, viewerUserId);
    const status = grant?.status || ACCESS_STATUS.pending;
    return {
      status,
      can_access: status === ACCESS_STATUS.approved,
      meeting_id: meeting.id,
      request: grant,
    };
  }

  async getAccessGrant (meetingId, userId) {
    const viewerUserId = normaliseViewerId(userId);
    if (!meetingId || !viewerUserId) return null;

    const result = await query(
      `SELECT mag.*, u.email AS current_email
       FROM meeting_access_grants mag
       LEFT JOIN users u ON u.id = mag.user_id
       WHERE mag.meeting_id = $1 AND mag.user_id = $2
       LIMIT 1`,
      [meetingId, viewerUserId]
    );
    return result.rows[0] ? formatAccessGrant(result.rows[0]) : null;
  }

  async getApprovedMeetingsForUser (userId) {
    const viewerUserId = normaliseViewerId(userId);
    if (!viewerUserId) return [];

    const result = await query(
      `SELECT
         mag.*,
         m.title,
         m.start_time,
         m.end_time,
         m.created_at AS meeting_created_at,
         grant_share.token AS grant_token,
         grant_share.expires_at AS grant_share_expires_at,
         grant_share.revoked_at AS grant_share_revoked_at,
         fallback_share.token AS fallback_token,
         fallback_share.expires_at AS fallback_share_expires_at,
         fallback_share.revoked_at AS fallback_share_revoked_at
       FROM meeting_access_grants mag
       JOIN meetings m ON m.id = mag.meeting_id
       LEFT JOIN meeting_shares grant_share ON grant_share.id = mag.share_id
       LEFT JOIN LATERAL (
         SELECT token, expires_at, revoked_at
         FROM meeting_shares
         WHERE meeting_id = mag.meeting_id
         ORDER BY
           CASE
             WHEN revoked_at IS NULL AND (expires_at IS NULL OR expires_at > now()) THEN 0
             ELSE 1
           END,
           id DESC
         LIMIT 1
       ) fallback_share ON true
       WHERE mag.user_id = $1 AND mag.status = $2::VARCHAR(20)
       ORDER BY COALESCE(m.start_time, mag.approved_at, mag.updated_at) DESC, mag.id DESC`,
      [viewerUserId, ACCESS_STATUS.approved]
    );

    return result.rows.map(formatApprovedMeeting).filter((meeting) => meeting.token);
  }

  async approveAccess (meetingId, userId) {
    return this.updateAccessStatus(meetingId, userId, ACCESS_STATUS.approved);
  }

  async rejectAccess (meetingId, userId) {
    return this.updateAccessStatus(meetingId, userId, ACCESS_STATUS.rejected);
  }

  async removeAccess (meetingId, userId) {
    return this.updateAccessStatus(meetingId, userId, ACCESS_STATUS.removed);
  }

  async updateAccessStatus (meetingId, userId, status) {
    const viewerUserId = normaliseViewerId(userId);
    if (!meetingId || !viewerUserId || !Object.values(ACCESS_STATUS).includes(status)) return null;

    const now = nowIso();
    const result = await query(
      `UPDATE meeting_access_grants
       SET
         status = $1::VARCHAR(20),
         approved_at = CASE WHEN $1::VARCHAR(20) = $4::VARCHAR(20) THEN $2::TIMESTAMPTZ ELSE NULL END,
         rejected_at = CASE WHEN $1::VARCHAR(20) = $5::VARCHAR(20) THEN $2::TIMESTAMPTZ ELSE NULL END,
         removed_at = CASE WHEN $1::VARCHAR(20) = $6::VARCHAR(20) THEN $2::TIMESTAMPTZ ELSE NULL END,
         updated_at = $2::TIMESTAMPTZ
       WHERE meeting_id = $3 AND user_id = $7
       RETURNING *`,
      [
        status,
        now,
        meetingId,
        ACCESS_STATUS.approved,
        ACCESS_STATUS.rejected,
        ACCESS_STATUS.removed,
        viewerUserId,
      ]
    );

    return result.rows[0] ? formatAccessGrant(result.rows[0]) : null;
  }

  async recordAccess (share, {
    participantId,
    viewer = null,
    activity = 'view',
    userAgent = null,
  } = {}) {
    if (!share || !participantId || !isValidParticipantId(participantId)) return null;

    const countColumnByActivity = {
      view: 'view_count',
      chat: 'chat_count',
      translate: 'translate_count',
    };
    const countColumn = countColumnByActivity[activity] || null;
    const countUpdate = countColumn ? `${countColumn} = share_accesses.${countColumn} + 1,` : '';
    const now = nowIso();
    const viewerUserId = normaliseViewerId(viewer?.id);
    const viewerEmail = truncate(viewer?.email, 255);

    const result = await query(
      `INSERT INTO share_accesses
         (share_id, meeting_id, participant_id, viewer_user_id, viewer_email,
          first_seen_at, last_seen_at, view_count, chat_count, translate_count,
          last_activity, user_agent)
       VALUES
         ($1, $2, $3, $4, $5,
          $6, $6, $7, $8, $9,
          $10, $11)
       ON CONFLICT (share_id, participant_id)
       DO UPDATE SET
         last_seen_at = EXCLUDED.last_seen_at,
         viewer_user_id = COALESCE(EXCLUDED.viewer_user_id, share_accesses.viewer_user_id),
         viewer_email = COALESCE(EXCLUDED.viewer_email, share_accesses.viewer_email),
         ${countUpdate}
         last_activity = EXCLUDED.last_activity,
         user_agent = COALESCE(EXCLUDED.user_agent, share_accesses.user_agent)
       RETURNING *`,
      [
        share.id,
        share.meeting_id,
        participantId,
        viewerUserId,
        viewerEmail,
        now,
        activity === 'view' ? 1 : 0,
        activity === 'chat' ? 1 : 0,
        activity === 'translate' ? 1 : 0,
        activity,
        truncate(userAgent, 500),
      ]
    );

    return formatAccess(result.rows[0]);
  }

  async getAccessByMeeting (meetingId) {
    const [accessResult, grantsResult] = await Promise.all([
      query(
        `SELECT
           sa.*,
           ms.token,
           ms.expires_at AS share_expires_at,
           ms.revoked_at AS share_revoked_at,
           ms.created_at AS share_created_at
         FROM share_accesses sa
         JOIN meeting_shares ms ON ms.id = sa.share_id
         WHERE sa.meeting_id = $1
         ORDER BY sa.last_seen_at DESC, sa.id DESC`,
        [meetingId]
      ),
      query(
        `SELECT mag.*, u.email AS current_email
         FROM meeting_access_grants mag
         LEFT JOIN users u ON u.id = mag.user_id
         WHERE mag.meeting_id = $1 AND mag.status IN ($2::VARCHAR(20), $3::VARCHAR(20))
         ORDER BY mag.updated_at DESC, mag.id DESC`,
        [meetingId, ACCESS_STATUS.pending, ACCESS_STATUS.approved]
      ),
    ]);

    const accessByUserId = new Map();
    for (const row of aggregateAccessRows(accessResult.rows.map(formatAccess))) {
      if (row.viewer_user_id) accessByUserId.set(Number(row.viewer_user_id), row);
    }

    return grantsResult.rows
      .map((row) => accessRowFromGrant(formatAccessGrant(row), accessByUserId.get(Number(row.user_id))))
      .sort(compareAccessListRows);
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

function formatAccess (row) {
  const viewerName = accountNameFromEmail(row.viewer_email) || viewerLabel(row.participant_id);
  return {
    id: row.id,
    share_id: row.share_id,
    meeting_id: row.meeting_id,
    participant_id: row.participant_id,
    viewer_user_id: row.viewer_user_id || null,
    viewer_email: row.viewer_email || null,
    viewer_name: viewerName,
    viewer_label: viewerName,
    account_holder_name: viewerName,
    account_holder_email: row.viewer_email || null,
    first_seen_at: toIso(row.first_seen_at),
    last_seen_at: toIso(row.last_seen_at),
    view_count: row.view_count || 0,
    chat_count: row.chat_count || 0,
    translate_count: row.translate_count || 0,
    last_activity: row.last_activity || null,
    user_agent: row.user_agent || null,
    share_expires_at: toIso(row.share_expires_at),
    share_revoked_at: toIso(row.share_revoked_at),
    share_created_at: toIso(row.share_created_at),
  };
}

function formatAccessGrant (row) {
  const email = row.user_email || row.current_email || null;
  const viewerName = accountNameFromEmail(email) || viewerLabel(row.user_id);
  return {
    id: row.id,
    meeting_id: row.meeting_id,
    share_id: row.share_id || null,
    user_id: row.user_id,
    user_email: email,
    status: row.status || ACCESS_STATUS.pending,
    requested_at: toIso(row.requested_at),
    approved_at: toIso(row.approved_at),
    rejected_at: toIso(row.rejected_at),
    removed_at: toIso(row.removed_at),
    updated_at: toIso(row.updated_at),
    viewer_user_id: row.user_id,
    viewer_email: email,
    viewer_name: viewerName,
    viewer_label: viewerName,
    account_holder_name: viewerName,
    account_holder_email: email,
  };
}

function formatApprovedMeeting (row) {
  const token = row.grant_token || row.fallback_token || null;
  const shareExpiresAt = row.grant_token ? row.grant_share_expires_at : row.fallback_share_expires_at;
  const shareRevokedAt = row.grant_token ? row.grant_share_revoked_at : row.fallback_share_revoked_at;

  return {
    id: row.meeting_id,
    title: row.title,
    token,
    start_time: toIso(row.start_time),
    end_time: toIso(row.end_time),
    created_at: toIso(row.meeting_created_at),
    requested_at: toIso(row.requested_at),
    approved_at: toIso(row.approved_at),
    share_expires_at: toIso(shareExpiresAt),
    share_revoked_at: toIso(shareRevokedAt),
  };
}

function accessRowFromGrant (grant, stats = null) {
  return {
    ...(stats || {}),
    id: `grant:${grant.id}`,
    access_request_id: grant.id,
    share_id: grant.share_id,
    meeting_id: grant.meeting_id,
    participant_id: stats?.participant_id || null,
    viewer_user_id: grant.user_id,
    viewer_email: grant.user_email,
    viewer_name: grant.viewer_name,
    viewer_label: grant.viewer_label,
    account_holder_name: grant.account_holder_name,
    account_holder_email: grant.account_holder_email,
    access_status: grant.status,
    has_access: grant.status === ACCESS_STATUS.approved,
    requested_at: grant.requested_at,
    approved_at: grant.approved_at,
    rejected_at: grant.rejected_at,
    removed_at: grant.removed_at,
    updated_at: grant.updated_at,
    first_seen_at: stats?.first_seen_at || null,
    last_seen_at: stats?.last_seen_at || null,
    view_count: stats?.view_count || 0,
    chat_count: stats?.chat_count || 0,
    translate_count: stats?.translate_count || 0,
    last_activity: stats?.last_activity || null,
    user_agent: stats?.user_agent || null,
    share_expires_at: stats?.share_expires_at || null,
    share_revoked_at: stats?.share_revoked_at || null,
    share_created_at: stats?.share_created_at || null,
    access_session_count: stats?.access_session_count || 0,
  };
}

function aggregateAccessRows (rows) {
  const grouped = new Map();

  for (const row of rows) {
    const key = row.viewer_user_id ? `user:${row.viewer_user_id}` : `participant:${row.participant_id}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        ...row,
        id: key,
        access_session_count: 1,
      });
      continue;
    }

    existing.view_count += row.view_count || 0;
    existing.chat_count += row.chat_count || 0;
    existing.translate_count += row.translate_count || 0;
    existing.access_session_count += 1;
    existing.first_seen_at = earlierIso(existing.first_seen_at, row.first_seen_at);

    if (isAfter(row.last_seen_at, existing.last_seen_at)) {
      existing.share_id = row.share_id;
      existing.participant_id = row.participant_id;
      existing.last_seen_at = row.last_seen_at;
      existing.last_activity = row.last_activity;
      existing.user_agent = row.user_agent || existing.user_agent;
      existing.share_expires_at = row.share_expires_at;
      existing.share_revoked_at = row.share_revoked_at;
      existing.share_created_at = row.share_created_at;
    }

    existing.viewer_user_id = existing.viewer_user_id || row.viewer_user_id;
    existing.viewer_email = existing.viewer_email || row.viewer_email;
    existing.account_holder_email = existing.account_holder_email || row.account_holder_email;
    existing.viewer_name = existing.viewer_name || row.viewer_name;
    existing.viewer_label = existing.viewer_name || existing.viewer_label;
    existing.account_holder_name = existing.account_holder_name || row.account_holder_name;
  }

  return [...grouped.values()].sort((a, b) => dateMs(b.last_seen_at) - dateMs(a.last_seen_at));
}

function isValidParticipantId (value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 100;
}

function normaliseViewerId (value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function accountNameFromEmail (email) {
  if (!email || typeof email !== 'string') return null;
  const localPart = email.split('@')[0]?.trim();
  if (!localPart) return email;
  const words = localPart
    .replace(/[._+-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return email;
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function earlierIso (left, right) {
  if (!left) return right || null;
  if (!right) return left;
  return dateMs(right) < dateMs(left) ? right : left;
}

function isAfter (left, right) {
  return dateMs(left) > dateMs(right);
}

function dateMs (value) {
  const date = value ? new Date(value) : null;
  const ms = date ? date.getTime() : NaN;
  return Number.isNaN(ms) ? 0 : ms;
}

function compareAccessListRows (a, b) {
  const statusWeight = {
    [ACCESS_STATUS.pending]: 2,
    [ACCESS_STATUS.approved]: 1,
  };
  const weightDelta = (statusWeight[b.access_status] || 0) - (statusWeight[a.access_status] || 0);
  if (weightDelta) return weightDelta;
  return dateMs(b.updated_at || b.last_seen_at || b.requested_at) - dateMs(a.updated_at || a.last_seen_at || a.requested_at);
}

function isShareActive (share) {
  if (!share || share.revoked_at) return false;
  if (!share.expires_at) return true;
  return dateMs(share.expires_at) > Date.now();
}

function viewerLabel (participantId) {
  const suffix = String(participantId || '').replace(/-/g, '').slice(-6).toUpperCase();
  return suffix ? `Viewer ${suffix}` : 'Viewer';
}

function truncate (value, maxLength) {
  if (!value || typeof value !== 'string') return null;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

export const sharesService = new SharesService();
