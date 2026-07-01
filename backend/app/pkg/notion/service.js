/**
 * Notion export service — exports a meeting (summary + action items) to a
 * standalone page or a configured database via @notionhq/client.
 */
import logger from '#app/common/logger.js';

export class NotionService {
  constructor (apiKey = null) {
    this.client = null;
    this.databaseId = null;
    if (apiKey) this.configure(apiKey);
  }

  async configure (apiKey, databaseId = null) {
    const { Client } = await import('@notionhq/client');
    this.client = new Client({ auth: apiKey });
    if (databaseId) this.databaseId = databaseId;
    logger.info('Notion client initialized');
  }

  setDatabase (databaseId) {
    this.databaseId = databaseId;
  }

  isAuthenticated () {
    return this.client !== null;
  }

  async testConnection () {
    if (!this.isAuthenticated()) throw new Error('Notion client not authenticated');
    await this.client.search({ filter: { property: 'object', value: 'database' } });
    return true;
  }

  async exportMeeting (meeting) {
    if (!this.isAuthenticated()) throw new Error('Notion client not authenticated');
    return this.databaseId ? this._addToDatabase(meeting) : this._createStandalonePage(meeting);
  }

  async _createStandalonePage (meeting) {
    const items = meeting.action_items || [];
    const text = items.length
      ? items.map((i) => `${i.completed ? '✅' : '⬜'} ${i.description} [${i.priority}]${i.assignee ? ` - ${i.assignee}` : ''}`).join('\n')
      : 'No action items';
    let page;
    try {
      page = await this.client.pages.create({
        parent: { type: 'workspace', workspace: true },
        properties: { title: { title: [{ text: { content: meeting.title } }] } },
        children: [
          heading('Meeting Details'),
          para(`Date: ${meeting.start_time || 'N/A'}\nDuration: ${duration(meeting.start_time, meeting.end_time)}`),
          heading('Summary'),
          para(meeting.summary || 'No summary available'),
          heading('Action Items'),
          todo(text, false),
        ],
      });
    } catch (e) {
      throw new Error(
        `Notion export failed: ${e.message}. Most internal Notion integrations can't create pages at the ` +
        'workspace root — set NOTION_DATABASE_ID in .env to export into a database you\'ve shared with the integration instead.'
      );
    }
    return page.id;
  }

  async _addToDatabase (meeting) {
    const items = meeting.action_items || [];
    const blocks = items.map((i) => todo(`${i.description} [${i.priority}]${i.assignee ? ` - ${i.assignee}` : ''}`, !!i.completed));
    const page = await this.client.pages.create({
      parent: { database_id: this.databaseId },
      properties: {
        Name: { title: [{ text: { content: meeting.title } }] },
        Date: { date: { start: meeting.start_time || new Date().toISOString() } },
      },
      children: [heading('Summary'), para(meeting.summary || 'No summary'), heading('Action Items'), ...blocks],
    });
    return page.id;
  }
}

const heading = (text) => ({ object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: text } }] } });
const para = (text) => ({ object: 'block', type: 'paragraph', paragraph: { rich_text: [{ type: 'text', text: { content: text } }] } });
const todo = (text, checked) => ({ object: 'block', type: 'to_do', to_do: { rich_text: [{ type: 'text', text: { content: text } }], checked } });
const duration = (start, end) => {
  if (!start || !end) return 'Unknown';
  const mins = Math.round((new Date(end) - new Date(start)) / 60000);
  return mins < 60 ? `${mins} minutes` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

export const notionService = new NotionService();
