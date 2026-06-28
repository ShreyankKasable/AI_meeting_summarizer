/**
 * Google Calendar service — OAuth + action-item-to-event sync via googleapis.
 * OAuth flow: getAuthUrl() -> user consents -> /api/google/callback -> tokens
 * persisted to data/google_token.json. Requires data/google_credentials.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import config from '#app/common/config.js';
import logger from '#app/common/logger.js';

const TOKEN_FILE = path.join(config.paths.DATA_DIR, 'google_token.json');
const CREDENTIALS_FILE = path.join(config.paths.DATA_DIR, 'google_credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const REDIRECT_URI = 'http://localhost:5000/api/google/callback';

export class CalendarService {
  constructor () {
    this.available = false;
    this.oauth2Client = null;
    this.calendar = null;
    this._ready = this._init();
  }

  async _init () {
    try {
      const { google } = await import('googleapis');
      this._google = google;
      this.available = true;
    } catch (e) {
      logger.warn('googleapis not available:', e.message);
      return;
    }
    this._loadCredentials();
  }

  isAvailable () {
    return this.available && fs.existsSync(CREDENTIALS_FILE);
  }

  isAuthenticated () {
    return this.oauth2Client !== null;
  }

  _buildClient () {
    const creds = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    const { client_id, client_secret } = creds.web || creds.installed;
    return new this._google.auth.OAuth2(client_id, client_secret, REDIRECT_URI);
  }

  _loadCredentials () {
    if (!fs.existsSync(TOKEN_FILE) || !fs.existsSync(CREDENTIALS_FILE)) return;
    try {
      const token = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
      this.oauth2Client = this._buildClient();
      this.oauth2Client.setCredentials(token);
      this.calendar = this._google.calendar({ version: 'v3', auth: this.oauth2Client });
      logger.info('Google Calendar credentials loaded successfully');
    } catch (e) {
      logger.error('Error loading Google credentials:', e.message);
    }
  }

  getAuthUrl () {
    if (!this.available) throw new Error('Google Calendar API not available. Run: npm install googleapis');
    if (!fs.existsSync(CREDENTIALS_FILE)) throw new Error('Google OAuth credentials file not found. Add google_credentials.json to the data folder.');
    return this._buildClient().generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' });
  }

  async completeAuth (code) {
    const client = this._buildClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens), 'utf8');
    this.oauth2Client = client;
    this.calendar = this._google.calendar({ version: 'v3', auth: client });
    logger.info('Google Calendar authentication successful');
  }

  async syncActionItem (item) {
    if (!this.isAuthenticated()) throw new Error('Not authenticated with Google Calendar');
    const due = item.due_date ? new Date(item.due_date) : new Date();
    const end = new Date(due.getTime() + 3600000);
    const event = {
      summary: item.description,
      description: `Action item from meeting\nPriority: ${item.priority}`,
      start: { dateTime: due.toISOString(), timeZone: 'UTC' },
      end: { dateTime: end.toISOString(), timeZone: 'UTC' },
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: config.get('google.default_reminder_minutes') }],
      },
    };
    const result = item.external_id
      ? await this.calendar.events.update({ calendarId: 'primary', eventId: item.external_id, requestBody: event })
      : await this.calendar.events.insert({ calendarId: 'primary', requestBody: event });
    return result.data.id;
  }
}

export const calendarService = new CalendarService();
