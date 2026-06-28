# 🚀 Quick Start Guide

## 1. Start the App
```bash
npm start
```

## 2. Configure Integrations (One Time Setup)

Edit the `.env` file with your API keys:

### Google Calendar
```env
GOOGLE_CALENDAR_ENABLED=true
# Place google_credentials.json in data/ folder
```

### Notion
```env
NOTION_ENABLED=true
NOTION_API_KEY=secret_your_notion_token_here
```

### Jira
```env
JIRA_ENABLED=true
JIRA_API_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=your_jira_token
JIRA_PROJECT_KEY=PROJ
```

### OpenAI (Best Summaries)
```env
OPENAI_API_KEY=sk-your-openai-key-here
```

## 3. Done!

All settings in `.env` are permanent. Configure once, use forever.

For detailed setup: See `INTEGRATION_SETUP.md`

