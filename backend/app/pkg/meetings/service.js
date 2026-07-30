/**
 * Meetings domain service: data access for meetings, action items and
 * participants.
 */
import { query, withTransaction } from '#app/connections/database.js';

const nowIso = () => new Date().toISOString();

export class MeetingsService {
  async createMeeting ({ title, startTime, participants = [], hostId = null } = {}) {
    const meetingId = await withTransaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO meetings (title, start_time, host_id, created_at)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [title || 'Untitled Meeting', startTime || nowIso(), hostId, nowIso()]
      );

      const id = inserted.rows[0].id;
      for (const p of participants || []) {
        const name = typeof p === 'string' ? p : p.name;
        if (!name) continue;
        await client.query(
          'INSERT INTO participants (meeting_id, name, email, role) VALUES ($1, $2, $3, $4)',
          [id, name, (p && p.email) || null, (p && p.role) || null]
        );
      }
      return id;
    });

    return this.getMeetingById(meetingId);
  }

  async endMeeting (id, { endTime, transcript, summary, audioFilePath } = {}) {
    await query(
      `UPDATE meetings
       SET end_time = $1, transcript = $2, summary = $3, audio_file_path = $4
       WHERE id = $5`,
      [
        endTime || nowIso(),
        transcript == null ? null : (typeof transcript === 'string' ? transcript : JSON.stringify(transcript)),
        summary || null,
        audioFilePath || null,
        id,
      ]
    );
    return this.getMeetingById(id);
  }

  async updateMeetingTitle (id, title) {
    await query('UPDATE meetings SET title = $1 WHERE id = $2', [title, id]);
    return this.getMeetingById(id);
  }

  async renameSpeaker (id, speaker, name) {
    const result = await query('SELECT transcript FROM meetings WHERE id = $1', [id]);
    const row = result.rows[0];
    if (!row) return null;
    const transcript = safeJson(row.transcript) || {};
    transcript.speakerNames = { ...(transcript.speakerNames || {}), [speaker]: name };
    await query('UPDATE meetings SET transcript = $1 WHERE id = $2', [JSON.stringify(transcript), id]);
    return this.getMeetingById(id);
  }

  async getMeetingById (id) {
    const meetingResult = await query('SELECT * FROM meetings WHERE id = $1', [id]);
    const meeting = meetingResult.rows[0];
    if (!meeting) return null;

    const [itemsResult, participantsResult] = await Promise.all([
      query('SELECT * FROM action_items WHERE meeting_id = $1 ORDER BY created_at', [id]),
      query('SELECT * FROM participants WHERE meeting_id = $1 ORDER BY id', [id]),
    ]);

    return formatMeeting(meeting, itemsResult.rows, participantsResult.rows);
  }

  async getAllMeetings ({ hostId } = {}) {
    const meetingsResult = hostId
      ? await query('SELECT * FROM meetings WHERE host_id = $1 ORDER BY start_time DESC', [hostId])
      : await query('SELECT * FROM meetings ORDER BY start_time DESC');

    return Promise.all(meetingsResult.rows.map(async (meeting) => {
      const [itemsResult, participantsResult] = await Promise.all([
        query('SELECT * FROM action_items WHERE meeting_id = $1 ORDER BY created_at', [meeting.id]),
        query('SELECT * FROM participants WHERE meeting_id = $1 ORDER BY id', [meeting.id]),
      ]);
      return formatMeeting(meeting, itemsResult.rows, participantsResult.rows);
    }));
  }

  async createActionItems (meetingId, items = []) {
    const created = [];
    for (const item of items) {
      if (!item?.description) continue;
      const result = await query(
        `INSERT INTO action_items (meeting_id, description, assignee, due_date, priority, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          meetingId,
          item.description,
          item.assignee || null,
          item.due_date || null,
          item.priority || 'medium',
          nowIso(),
        ]
      );
      created.push(formatActionItem(result.rows[0]));
    }
    return created;
  }

  async getActionItemById (id) {
    const result = await query('SELECT * FROM action_items WHERE id = $1', [id]);
    return result.rows[0] ? formatActionItem(result.rows[0]) : null;
  }

  async getActionItemsByMeeting (meetingId) {
    const result = await query('SELECT * FROM action_items WHERE meeting_id = $1 ORDER BY created_at', [meetingId]);
    return result.rows.map(formatActionItem);
  }

  async markActionItemComplete (id, completed = true) {
    const result = await query(
      'UPDATE action_items SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    );
    return result.rows[0] ? formatActionItem(result.rows[0]) : null;
  }

  async updateActionItemSyncStatus (id, { notion, externalId } = {}) {
    const fields = [];
    const values = [];
    let nextParam = 1;

    if (notion !== undefined) {
      fields.push(`synced_to_notion = $${nextParam++}`);
      values.push(!!notion);
    }
    if (externalId !== undefined) {
      fields.push(`external_id = $${nextParam++}`);
      values.push(externalId);
    }
    if (fields.length) {
      values.push(id);
      await query(`UPDATE action_items SET ${fields.join(', ')} WHERE id = $${nextParam}`, values);
    }
    return this.getActionItemById(id);
  }
}

function formatMeeting (m, actionItems = [], participants = []) {
  return {
    id: m.id,
    host_id: m.host_id || null,
    title: m.title,
    start_time: toIso(m.start_time),
    end_time: toIso(m.end_time),
    transcript: safeJson(m.transcript),
    summary: m.summary,
    audio_file_path: m.audio_file_path,
    action_items: actionItems.map(formatActionItem),
    participants: participants.map(formatParticipant),
    created_at: toIso(m.created_at),
  };
}

function formatActionItem (a) {
  return {
    id: a.id,
    meeting_id: a.meeting_id,
    description: a.description,
    assignee: a.assignee,
    due_date: toIso(a.due_date),
    priority: a.priority,
    completed: !!a.completed,
    synced_to_notion: !!a.synced_to_notion,
    external_id: a.external_id,
    created_at: toIso(a.created_at),
  };
}

function formatParticipant (p) {
  return { id: p.id, meeting_id: p.meeting_id, name: p.name, email: p.email, role: p.role };
}

function safeJson (s) {
  if (!s) return null;
  if (typeof s !== 'string') return s;
  try { return JSON.parse(s); } catch { return s; }
}

function toIso (value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

export const meetingsService = new MeetingsService();
