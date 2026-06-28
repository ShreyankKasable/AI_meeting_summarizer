# 🚀 How to Start the Application

This app is now **100% JavaScript** — no Python required. You only need Node.js
(version 22 or newer, for the built-in `node:sqlite` module).

## Method 1: Using npm (Recommended)
```bash
cd AI_meeting_summarizer
npm install   # first time only
npm start
```

## Method 2: Run the backend on its own (for debugging)
```bash
cd AI_meeting_summarizer
node backend/index.js
```

## Method 3: Double-click (Windows)
Double-click `RUN.bat`.

---

## What Happens When You Start:
1. ✅ Electron launches and spawns the Node backend on `http://127.0.0.1:5000`
2. ✅ The desktop window opens and connects automatically (no fixed wait)
3. ✅ You're ready to record meetings!

---

## To Stop the Application:
- Close the Electron window (the backend is stopped automatically), or
- Press `Ctrl+C` in the terminal

---

## Troubleshooting:
- **"node:sqlite" not found / DatabaseSync undefined**: Your Node.js is too old. Install Node 22+ (`node -v` to check).
- **Backend not connecting**: Confirm nothing else is using port 5000.
- **No microphone prompt**: Grant microphone access in your OS privacy settings.
- **Transcription says "unavailable"**: Set `TRANSCRIPTION_MODEL=deepgram` (or `assemblyai`) with an API key in `.env`, or install local Whisper (see README → Offline mode).

---

## All Settings:
Edit the `.env` file to configure integrations (Google Calendar, Notion, Jira, OpenAI/Euron, etc.).

See `INTEGRATION_SETUP.md` for the detailed configuration guide.
