/**
 * Meetings domain service — data access for meetings, action items and
 * participants over node:sqlite. Replaces the SQLAlchemy models; the format()
 * helpers reproduce the exact JSON shape the Python `.to_dict()` returned.
 *
 * node:sqlite does not bind JS booleans, so boolean columns are stored as 0/1
 * and converted back on read.
 */
import { getDb } from '#app/connections/database.js';

const nowIso = () => new Date().toISOString();

export class MeetingsService {
  // ── meetings ───────────────────────────────────────────────────────────────
  createMeeting ({ title, startTime, participants = [], hostId = null } = {}) {
    const db = getDb();
    const info = db.prepare(
      'INSERT INTO meetings (title, start_time, host_id, created_at) VALUES (?, ?, ?, ?)'
    ).run(title || 'Untitled Meeting', startTime || nowIso(), hostId, nowIso());

    const meetingId = Number(info.lastInsertRowid);

    if (participants?.length) {
      const ins = db.prepare(
        'INSERT INTO participants (meeting_id, name, email, role) VALUES (?, ?, ?, ?)'
      );
      for (const p of participants) {
        const name = typeof p === 'string' ? p : p.name;
        if (!name) continue;
        ins.run(meetingId, name, (p && p.email) || null, (p && p.role) || null);
      }
    }
    return this.getMeetingById(meetingId);
  }

  endMeeting (id, { endTime, transcript, summary, audioFilePath } = {}) {
    getDb().prepare(
      'UPDATE meetings SET end_time = ?, transcript = ?, summary = ?, audio_file_path = ? WHERE id = ?'
    ).run(
      endTime || nowIso(),
      transcript == null ? null : (typeof transcript === 'string' ? transcript : JSON.stringify(transcript)),
      summary || null,
      audioFilePath || null,
      id
    );
    return this.getMeetingById(id);
  }

  updateMeetingTitle (id, title) {
    getDb().prepare('UPDATE meetings SET title = ? WHERE id = ?').run(title, id);
    return this.getMeetingById(id);
  }

  getMeetingById (id) {
    const db = getDb();
    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(id);
    if (!meeting) return null;
    const items = db.prepare('SELECT * FROM action_items WHERE meeting_id = ? ORDER BY created_at').all(id);
    const parts = db.prepare('SELECT * FROM participants WHERE meeting_id = ?').all(id);
    return formatMeeting(meeting, items, parts);
  }

  getAllMeetings ({ hostId } = {}) {
    const db = getDb();
    const rows = hostId
      ? db.prepare('SELECT * FROM meetings WHERE host_id = ? ORDER BY start_time DESC').all(hostId)
      : db.prepare('SELECT * FROM meetings ORDER BY start_time DESC').all();
    return rows.map((m) => {
      const items = db.prepare('SELECT * FROM action_items WHERE meeting_id = ? ORDER BY created_at').all(m.id);
      const parts = db.prepare('SELECT * FROM participants WHERE meeting_id = ?').all(m.id);
      return formatMeeting(m, items, parts);
    });
  }

  // ── action items ─────────────────────────────────────────────────────────────
  createActionItems (meetingId, items = []) {
    const db = getDb();
    const stmt = db.prepare(
      `INSERT INTO action_items (meeting_id, description, assignee, due_date, priority, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const created = [];
    for (const item of items) {
      if (!item?.description) continue;
      const info = stmt.run(
        meetingId,
        item.description,
        item.assignee || null,
        item.due_date || null,
        item.priority || 'medium',
        nowIso()
      );
      created.push(this.getActionItemById(Number(info.lastInsertRowid)));
    }
    return created;
  }

  getActionItemById (id) {
    const row = getDb().prepare('SELECT * FROM action_items WHERE id = ?').get(id);
    return row ? formatActionItem(row) : null;
  }

  getActionItemsByMeeting (meetingId) {
    return getDb()
      .prepare('SELECT * FROM action_items WHERE meeting_id = ? ORDER BY created_at')
      .all(meetingId)
      .map(formatActionItem);
  }

  markActionItemComplete (id, completed = true) {
    getDb().prepare('UPDATE action_items SET completed = ? WHERE id = ?').run(completed ? 1 : 0, id);
    return this.getActionItemById(id);
  }

  updateActionItemSyncStatus (id, { notion, externalId } = {}) {
    const fields = [];
    const vals = [];
    if (notion !== undefined) { fields.push('synced_to_notion = ?'); vals.push(notion ? 1 : 0); }
    if (externalId !== undefined) { fields.push('external_id = ?'); vals.push(externalId); }
    if (fields.length) {
      getDb().prepare(`UPDATE action_items SET ${fields.join(', ')} WHERE id = ?`).run(...vals, id);
    }
    return this.getActionItemById(id);
  }
}

// ── formatters (mirror Python .to_dict()) ─────────────────────────────────────
function formatMeeting (m, actionItems = [], participants = []) {
  return {
    id: m.id,
    host_id: m.host_id || null,
    title: m.title,
    start_time: m.start_time || null,
    end_time: m.end_time || null,
    transcript: safeJson(m.transcript),
    summary: m.summary,
    audio_file_path: m.audio_file_path,
    action_items: actionItems.map(formatActionItem),
    participants: participants.map(formatParticipant),
    created_at: m.created_at || null,
  };
}

function formatActionItem (a) {
  return {
    id: a.id,
    meeting_id: a.meeting_id,
    description: a.description,
    assignee: a.assignee,
    due_date: a.due_date || null,
    priority: a.priority,
    completed: !!a.completed,
    synced_to_notion: !!a.synced_to_notion,
    external_id: a.external_id,
    created_at: a.created_at || null,
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

export const meetingsService = new MeetingsService();
