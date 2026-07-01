# 🔗 Integration Setup Guide

## Quick Reference

All integrations are configured in the `.env` file. Configure once and use forever!

---

## 📝 Notion Integration

### What You Can Do:
- ✅ Export meetings as Notion pages
- ✅ Create action item databases
- ✅ Rich formatting with emojis
- ✅ Auto-update task status
- ✅ Link meetings together

### Setup Steps:

1. **Create Notion Integration**
   ```
   https://www.notion.so/my-integrations
   ```

2. **Click "+ New integration"**
   - Name: "AI Meeting Summarizer"
   - Associated workspace: Select your workspace
   - Click "Submit"

3. **Copy Integration Token**
   - Copy the "Internal Integration Token"
   - It starts with `secret_`

4. **Share Your Notion Page/Database**
   - Open the Notion page where you want meetings
   - Click "..." → "Add connections"
   - Select "AI Meeting Summarizer"

5. **Get Database ID (Optional)**
   - Open your Notion database
   - Copy the URL
   - Extract the ID between the last `/` and the `?`
   - Example: `https://notion.so/workspace/DATABASE_ID?v=...`

6. **Configure .env**
   ```env
   NOTION_ENABLED=true
   NOTION_API_KEY=secret_your_token_here
   NOTION_DATABASE_ID=your_database_id_here
   NOTION_AUTO_SYNC=true
   NOTION_PAGE_ICON=🎙️
   ```

7. **Use It**
   - Click "📝 Export to Notion" from any meeting
   - View your meeting in Notion!

---

## 🤖 AI Models Configuration

### Option 1: OpenAI (Best Quality, Recommended)

**Cost**: ~$0.02 per meeting

1. **Sign Up**
   ```
   https://platform.openai.com/signup
   ```

2. **Add Payment Method**
   - Go to: https://platform.openai.com/account/billing
   - Add credit card
   - Add at least $5 credit

3. **Create API Key**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Name: "Meeting Summarizer"
   - Copy the key (starts with `sk-`)

4. **Configure .env**
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

### Option 2: Anthropic Claude (Alternative)

**Cost**: ~$0.02 per meeting | $5 free credits

1. **Sign Up**: https://console.anthropic.com/
2. **Create API Key**: Settings → API Keys
3. **Configure .env**
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

### Option 3: Local Whisper (FREE!)

**No API key needed!** Already configured.

```env
TRANSCRIPTION_MODEL=whisper
USE_LOCAL_MODEL=false
```

---

## 🎤 Transcription Services

### Option 1: Whisper (Local, FREE)

Already configured! No setup needed.

```env
TRANSCRIPTION_MODEL=whisper
```

### Option 2: Deepgram (Cloud, Premium)

**Free $200 credits**

1. **Sign Up**: https://console.deepgram.com/signup
2. **Get API Key**: Dashboard → API Keys
3. **Configure .env**
   ```env
   TRANSCRIPTION_MODEL=deepgram
   DEEPGRAM_API_KEY=your_key_here
   ```

### Option 3: AssemblyAI (Best Quality)

**Free 5 hours/month**

1. **Sign Up**: https://www.assemblyai.com/
2. **Get API Key**: Dashboard → API Keys
3. **Configure .env**
   ```env
   TRANSCRIPTION_MODEL=assemblyai
   ASSEMBLYAI_API_KEY=your_key_here
   ```

---

## 🔧 Advanced Settings

### Audio Configuration
```env
AUDIO_SAMPLE_RATE=16000
AUDIO_CHANNELS=1
AUDIO_FORMAT=wav
MAX_AUDIO_DURATION_MINUTES=120
```

### Transcription Settings
```env
LIVE_TRANSCRIPTION_INTERVAL=10
TRANSCRIPTION_LANGUAGE=en
ENABLE_SPEAKER_DIARIZATION=false
```

### AI Processing
```env
MAX_SUMMARY_LENGTH=500
MIN_ACTION_ITEM_CONFIDENCE=0.7
ENABLE_AUTO_TRANSLATION=false
```

### Security
```env
ENABLE_ENCRYPTION=false
SESSION_TIMEOUT_MINUTES=60
MAX_FILE_SIZE_MB=100
```

### Performance
```env
ENABLE_CACHING=true
CACHE_DURATION_HOURS=24
MAX_CONCURRENT_PROCESSING=3
ENABLE_GPU_ACCELERATION=false
```

---

## 🚀 Quick Start Examples

### Minimal Setup (FREE)
```env
TRANSCRIPTION_MODEL=whisper
USE_LOCAL_MODEL=false
# No API keys needed!
```

### Best Quality Setup
```env
TRANSCRIPTION_MODEL=whisper
OPENAI_API_KEY=sk-your-key-here
# Cost: ~$0.02 per meeting
```

### Full Integration Setup
```env
# AI
OPENAI_API_KEY=sk-your-key-here

# Notion
NOTION_ENABLED=true
NOTION_API_KEY=secret_your-token
```

---

## 📞 Troubleshooting

### Notion Export Fails
- Verify Notion integration is shared with your page/database
- Check API key starts with `secret_`
- Ensure page permissions are correct

### API Key Errors
- Check for extra spaces in `.env` file
- Ensure no quotes around values
- Restart app after changing `.env`

---

## 💡 Tips

1. **Start Simple**: Begin with just Whisper (free), add integrations later
2. **Test One at a Time**: Enable one integration, test it, then enable next
3. **Keep Backups**: Save your `.env` file securely
4. **Check Logs**: Terminal shows helpful error messages
5. **API Costs**: Monitor your usage on provider dashboards

---

## 📝 Configuration Checklist

- [ ] Basic transcription working (Whisper)
- [ ] AI summarization configured (OpenAI/Claude/Local)
- [ ] Notion integration set up (optional)
- [ ] Tested first meeting recording
- [ ] Verified all integrations working

---

## 🎉 You're All Set!

Once configured, just:
1. Start the app: `npm start`
2. Record a meeting
3. Watch the magic happen! ✨

All your integrations will work automatically from now on.

---

**Need Help?** Check the main README.md or open an issue on GitHub.

