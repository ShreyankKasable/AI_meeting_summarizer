/**
 * Jira sync service — creates/updates Task issues from action items via
 * jira-client.
 */
import logger from '#app/common/logger.js';

export class JiraService {
  constructor () {
    this.client = null;
    this.projectKey = null;
  }

  async configure (serverUrl, email, apiToken, projectKey) {
    const { default: JiraClient } = await import('jira-client');
    const host = serverUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    this.client = new JiraClient({
      protocol: 'https',
      host,
      username: email,
      password: apiToken,
      apiVersion: '2',
      strictSSL: true,
    });
    this.projectKey = projectKey;
    await this.client.getCurrentUser();
    logger.info(`Jira client initialized for project ${projectKey}`);
  }

  isAuthenticated () {
    return this.client !== null;
  }

  async syncActionItem (item) {
    if (!this.isAuthenticated()) throw new Error('Jira client not authenticated');
    const issueData = {
      fields: {
        project: { key: this.projectKey },
        summary: item.description,
        description: `Action item from meeting\nPriority: ${item.priority}`,
        issuetype: { name: 'Task' },
        priority: { name: this._mapPriority(item.priority) },
      },
    };
    if (item.assignee) {
      try {
        const users = await this.client.searchUsers({ query: item.assignee });
        if (users?.length) issueData.fields.assignee = { accountId: users[0].accountId };
      } catch { /* skip assignee */ }
    }
    if (item.due_date) issueData.fields.duedate = String(item.due_date).slice(0, 10);

    let issueKey;
    if (item.external_id) {
      await this.client.updateIssue(item.external_id, issueData);
      issueKey = item.external_id;
    } else {
      issueKey = (await this.client.addNewIssue(issueData)).key;
    }

    if (item.completed) {
      try {
        const { transitions } = await this.client.listTransitions(issueKey);
        const done = transitions.find((t) => t.name.toLowerCase().includes('done'));
        if (done) await this.client.transitionIssue(issueKey, { transition: { id: done.id } });
      } catch { /* ignore transition errors */ }
    }
    return issueKey;
  }

  _mapPriority (priority) {
    return ({ high: 'High', medium: 'Medium', low: 'Low' })[(priority || '').toLowerCase()] || 'Medium';
  }
}

export const jiraService = new JiraService();
