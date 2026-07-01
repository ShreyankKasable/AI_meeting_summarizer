# 🎤 AI Meeting Summarizer

> A powerful desktop application that records, transcribes, summarizes, and generates actionable items from meetings using advanced AI technology.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-22+-green.svg)
![JavaScript](https://img.shields.io/badge/100%25-JavaScript-yellow.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## ✨ Features

### Core Capabilities
- 🎙️ **Local Audio Capture** - Record meetings directly from your microphone
- ⚡ **Real-Time Transcription** - See transcription appear every 10 seconds while recording
- 🤖 **AI-Powered Summarization** - Get detailed, comprehensive meeting summaries
- 📋 **Action Item Extraction** - Automatically identify tasks, assignments, and deadlines
- 🎯 **Smart Task Lists** - Auto-generated task lists with priorities and assignees
- 🔔 **Desktop Notifications** - Real-time notifications for all major events

### Integrations
- 📝 **Notion Export** - Send meeting notes to Notion pages
- 🌐 **Language Translation** - Translate meetings to 12+ languages

### Additional Features
- ✏️ **Meeting Title Editing** - Edit and customize meeting titles
- 🎵 **Audio Playback** - Listen to recorded audio from meeting details
- 🔍 **Advanced Search & Filters** - Find meetings by date, title, or action item status
- 👥 **Participant Tracking** - Track meeting attendees
- 💾 **Local Storage** - All data stored locally in SQLite database

---

## 🎬 Demo

<!-- Add screenshots here -->
```
screenshots/
├── main-view.png
├── recording-view.png
├── live-transcription.png
└── meeting-details.png
```

---

## 🛠️ Tech Stack

### Backend (100% JavaScript)
- **Node.js 22+** - Core backend runtime
- **Express** - Web framework
- **Socket.IO** - Real-time communication
- **node:sqlite** - Built-in SQLite (no native build step)
- **SQLite** - Local database (same `data/meetings.db` file as before)

### AI Services
- **Deepgram / AssemblyAI** - Speech-to-text transcription (cloud)
- **Whisper (optional)** - Local transcription via `whisper-node`
- **OpenAI / Euron.one / Anthropic** - Summarization and action item extraction
- **Google Translate** - Multi-language translation

### Frontend
- **HTML/CSS/JavaScript** - UI implementation
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates

---

## 📦 Installation

### Prerequisites
- **Node.js 22+** (required for the built-in `node:sqlite` module)
- **Git**

> No Python needed — the entire backend is JavaScript.

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/ai-meeting-summarizer.git
cd ai-meeting-summarizer
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3 (optional): Enable Offline / Local Models
Local Whisper transcription and local LLM summarization are opt-in (they pull
native binaries):
```bash
npm install whisper-node node-llama-cpp
```
Then set `TRANSCRIPTION_MODEL=whisper` and/or `USE_LOCAL_MODEL=true` in `.env`.

### Step 4: Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Transcription API (Required)
TRANSCRIPTION_MODEL=deepgram
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# AI Summarization (Required)
USE_EURON_API=true
EURON_API_KEY=your_euron_api_key_here
EURON_API_BASE=https://api.euron.one/v1
EURON_MODEL=gpt-4.1-mini

# Optional Features
DEBUG=False
DATABASE_PATH=data/meetings.db
```

---

## 🚀 Usage

### Start the Application
```bash
npm start
```

This starts the Node backend, which also serves the frontend, at
`http://127.0.0.1:5000` — open that URL in a browser to use the app.

### Recording a Meeting

1. **Click "New Meeting"** in the sidebar
2. **Enter meeting title** and participants (optional)
3. **Click "Start Recording"** 
4. **Speak naturally** - live transcription appears every 10 seconds
5. **Click "Stop Recording"** when done
6. **Wait for AI processing** (~30-60 seconds)
7. **View summary and action items**

### Managing Meetings

- **View All Meetings** - Click "Meetings" in sidebar
- **Search** - Use search bar to filter by title/content
- **Filter** - Apply date range, action item status filters
- **Open Details** - Click any meeting to view full details
- **Edit Title** - Click title, edit, and save
- **Play Audio** - Use audio player in meeting details

### Syncing Tasks

#### Notion
1. Get Notion API key from [notion.so/my-integrations](https://notion.so/my-integrations)
2. Go to **Settings** → **Integrations**
3. Enter API key in **Notion** field
4. Click **"📝 Export to Notion"** from any meeting

---

## 🔑 API Keys Setup

### Deepgram API (Required)
1. Sign up at [deepgram.com](https://deepgram.com)
2. Get API key from console
3. Add to `.env` as `DEEPGRAM_API_KEY`

### Euron.one API (Required)
1. Sign up at [euron.one](https://euron.one)
2. Get API key
3. Add to `.env` as `EURON_API_KEY`

### Notion (Optional)
1. Go to [notion.so/my-integrations](https://notion.so/my-integrations)
2. Create new integration
3. Copy API key
4. Add to Settings in app

---

## 📁 Project Structure

The backend follows a layered, DDD-style structure (modeled on the Boltic "neo"
service): thin routes → domain services (`pkg`) → connections, with shared
`common` utilities. It is an ESM package using `#app/*` subpath imports.

```
ai-meeting-summarizer/
├── backend/                          # ESM service package (#app/* imports)
│   ├── index.js                      # Entry point — boots HTTP + Socket.IO
│   ├── package.json                  # type:module + imports map
│   └── app/
│       ├── server.js                 # Express app factory (getAppServer)
│       ├── common/
│       │   ├── config.js             # convict schema — all env vars
│       │   ├── constants.js          # enums, socket events, languages
│       │   ├── logger.js
│       │   ├── error/                # AppError + HTTP error classes
│       │   └── utils/file.util.js    # route auto-loader helpers
│       ├── connections/
│       │   ├── database.js           # node:sqlite connection
│       │   └── websocket.js          # Socket.IO + recording pipeline
│       ├── api/
│       │   ├── middlewares/          # asyncHandler, errorhandler, cors
│       │   └── routes/main/          # auto-loaded route tree
│       │       ├── root.route.js     # GET /health
│       │       ├── api/*.route.js    # /api/meetings, /api/notion, ...
│       │       └── data/audio.route.js
│       └── pkg/                      # domain services (service.js + validation.js)
│           ├── meetings/  transcription/  summarizer/  extraction/
│           ├── notion/  translation/  system/  chat/
├── frontend/
│   ├── index.html                    # Main UI
│   ├── app.js                        # Frontend logic
│   └── styles.css                    # Styling
├── data/
│   ├── audio/                        # Recorded audio files (WAV)
│   └── meetings.db                   # SQLite database
├── .env                              # Environment variables
├── package.json                      # Node dependencies
└── README.md                         # This file
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Ensure Node 22+ (required for node:sqlite)
node -v

# Reinstall dependencies
npm install

# Run the backend directly to see logs
node backend/server.js
```

### No Meetings Showing Up
- The frontend retries automatically until the backend connects
- Check if `data/meetings.db` exists
- Recordings auto-load after first recording

### Live Transcription Not Working
- Check Deepgram API key in `.env`
- Verify internet connection
- Look for `[LIVE]` messages in terminal

### Audio Playback Not Working
- Audio files stored in `data/audio/`
- Check browser console for errors
- Verify audio file exists

---

## ⚙️ Configuration

### Change Live Transcription Interval
Edit `LIVE_CHUNK_MS` in `frontend/bridge.js` (default `10000` ms).

### Customize Summary Detail Level
Edit `backend/app/pkg/summarizer/service.js` - modify the `_buildPrompt()` method.

### Change Database Location
In `.env`:
```env
DATABASE_PATH=your/custom/path/meetings.db
```

---

## 🧪 Development

### Run in Debug Mode
```bash
npm start
```

### View Logs
- Backend logs: Terminal running `npm start`
- Frontend logs: Browser DevTools (F12)

---

## 📝 Features Roadmap

- [ ] Speaker diarization (identify who said what)
- [ ] Meeting templates
- [ ] Custom action item templates
- [ ] Export to PDF
- [ ] Meeting analytics dashboard
- [ ] Team collaboration features
- [ ] Cloud sync option

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Deepgram** - For excellent speech-to-text API
- **Euron.one** - For GPT-4.1 mini access
- **Express & Socket.IO** - For the backend framework

---

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: your-email@example.com

---

## 🌟 Show Your Support

If this project helped you, please give it a ⭐!

---

**Made with ❤️ by [Your Name]**
