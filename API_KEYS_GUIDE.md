# 🤖 AI Models & API Keys Guide

## 🎯 Which AI Models Are Used?

The application uses **multiple AI models** that you can choose from:

---

## 📝 **1. TRANSCRIPTION MODELS** (Speech to Text)

### Option A: **OpenAI Whisper** (Recommended for Beginners) ⭐
- **Type**: Local model (runs on your computer)
- **Cost**: FREE ✅
- **Privacy**: Complete privacy - no data sent anywhere
- **Quality**: Good
- **Speed**: Medium
- **API Key**: NOT NEEDED! 🎉
- **Best for**: Testing, privacy-conscious users, free usage

### Option B: **Deepgram API**
- **Type**: Cloud API
- **Cost**: Pay per minute (starts free)
- **Privacy**: Data sent to Deepgram
- **Quality**: Excellent
- **Speed**: Very fast
- **API Key**: Required
- **Best for**: High-quality, fast transcription

### Option C: **AssemblyAI**
- **Type**: Cloud API
- **Cost**: Pay per minute (free tier available)
- **Privacy**: Data sent to AssemblyAI
- **Quality**: Excellent (best)
- **Speed**: Fast
- **API Key**: Required
- **Best for**: Best quality, speaker detection

---

## 💭 **2. SUMMARIZATION & ACTION ITEM MODELS** (LLMs)

### Option A: **OpenAI GPT-4** (Most Popular) ⭐
- **Model**: GPT-4 Turbo
- **Cost**: Pay per token (~$0.01 per meeting)
- **Quality**: Excellent
- **Speed**: Fast
- **API Key**: Required
- **Best for**: Best results, most reliable

### Option B: **Anthropic Claude 3.5 Sonnet**
- **Model**: Claude 3.5 Sonnet
- **Cost**: Pay per token (~$0.01 per meeting)
- **Quality**: Excellent
- **Speed**: Very fast
- **API Key**: Required
- **Best for**: Great alternative to GPT-4

### Option C: **Local Llama Model** (Privacy Mode)
- **Model**: Llama 2 7B Chat (or similar)
- **Cost**: FREE ✅
- **Privacy**: Complete privacy - 100% local
- **Quality**: Good (not as good as GPT-4)
- **Speed**: Slow (depends on your CPU)
- **API Key**: NOT NEEDED! 🎉
- **Best for**: Privacy, offline use, no API costs

---

## 🔑 **HOW TO GET API KEYS**

### **Option 1: OpenAI (GPT-4) - RECOMMENDED FOR BEGINNERS**

**Step-by-step guide:**

1. **Go to OpenAI website**
   ```
   https://platform.openai.com/signup
   ```

2. **Create an account**
   - Sign up with email/Google/Microsoft
   - Verify your email

3. **Add payment method** (Required)
   - Go to: https://platform.openai.com/account/billing
   - Add credit card
   - Add at least $5 credit

4. **Create API key**
   - Go to: https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Give it a name: "Meeting Summarizer"
   - Copy the key (starts with `sk-...`)
   - **IMPORTANT**: Save it now! You can't see it again

5. **Add to your `.env` file**
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

**💰 Cost**: ~$0.01-0.05 per meeting (very cheap!)

---

### **Option 2: Anthropic Claude (Alternative)**

**Step-by-step guide:**

1. **Go to Anthropic Console**
   ```
   https://console.anthropic.com/
   ```

2. **Sign up**
   - Create account
   - Verify email

3. **Add billing** (Required)
   - Add payment method
   - Get $5 free credits for new users!

4. **Get API key**
   - Go to: https://console.anthropic.com/settings/keys
   - Click "Create Key"
   - Copy the key (starts with `sk-ant-...`)

5. **Add to `.env` file**
   ```env
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```

**💰 Cost**: ~$0.01-0.05 per meeting

---

### **Option 3: Deepgram (Optional - Better Transcription)**

1. **Go to Deepgram**
   ```
   https://console.deepgram.com/signup
   ```

2. **Sign up**
   - Get $200 free credits! 🎉

3. **Get API key**
   - Dashboard → API Keys
   - Copy your key

4. **Add to `.env` file**
   ```env
   DEEPGRAM_API_KEY=your-deepgram-key-here
   TRANSCRIPTION_MODEL=deepgram
   ```

---

### **Option 4: AssemblyAI (Optional - Best Transcription)**

1. **Go to AssemblyAI**
   ```
   https://www.assemblyai.com/
   ```

2. **Sign up**
   - Get free tier with 5 hours/month!

3. **Get API key**
   - Dashboard → API Keys

4. **Add to `.env` file**
   ```env
   ASSEMBLYAI_API_KEY=your-assemblyai-key-here
   TRANSCRIPTION_MODEL=assemblyai
   ```

---

## 🚀 **QUICK START - 3 SETUP OPTIONS**

### **Setup A: FREE (No API Keys) - Start Here!** ⭐

**Perfect for testing and privacy**

```env
# .env file
TRANSCRIPTION_MODEL=whisper
USE_LOCAL_MODEL=false
```

**What this uses:**
- ✅ Whisper (local) for transcription - FREE
- ⚠️ No summarization (will use fallback)
- ⚠️ Basic action item extraction (keyword-based)

**To run:**
```bash
npm start
```

---

### **Setup B: BEST QUALITY (Recommended)** ⭐⭐⭐

**Best results, small cost**

1. Get OpenAI API key (see above)
2. Edit `.env`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   TRANSCRIPTION_MODEL=whisper
   USE_LOCAL_MODEL=false
   ```

**What this uses:**
- ✅ Whisper (local) for transcription - FREE
- ✅ GPT-4 for summaries - ~$0.02 per meeting
- ✅ GPT-4 for action items - Excellent quality

**To run:**
```bash
npm start
```

---

### **Setup C: COMPLETE PRIVACY (Offline Mode)**

**100% local, no internet needed**

1. Download Llama model (optional - advanced)
2. Edit `.env`:
   ```env
   TRANSCRIPTION_MODEL=whisper
   USE_LOCAL_MODEL=true
   LOCAL_MODEL_PATH=./models/llama-2-7b-chat.gguf
   ```

**What this uses:**
- ✅ Whisper (local) - FREE
- ✅ Llama (local) - FREE
- ✅ 100% privacy
- ⚠️ Slower processing

---

## 🎯 **MY RECOMMENDATION FOR YOU**

### **For Getting Started (Today):**

**Use Setup B - Whisper + GPT-4**

1. **Get OpenAI API key** (takes 5 minutes)
   - Sign up at https://platform.openai.com/
   - Add $5 credit card payment
   - Create API key

2. **Add to `.env` file:**
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   TRANSCRIPTION_MODEL=whisper
   ```

3. **Run the app:**
   ```bash
   npm start
   ```

**Why this setup?**
- ✅ Whisper is FREE (runs locally)
- ✅ GPT-4 is cheap (~$0.02 per meeting)
- ✅ Best quality summaries
- ✅ Easy to set up
- ✅ No need to download large models

---

## 💰 **COST BREAKDOWN**

### Per Meeting (30 minutes):

| Component | Model | Cost |
|-----------|-------|------|
| Transcription | Whisper (local) | **$0.00** ✅ |
| Transcription | Deepgram | $0.25 |
| Transcription | AssemblyAI | $0.15 |
| Summary | GPT-4 | $0.01-0.02 |
| Summary | Claude | $0.01-0.02 |
| Summary | Local Llama | **$0.00** ✅ |
| Action Items | GPT-4 | $0.01-0.02 |

**Recommended setup cost: ~$0.02-0.04 per meeting**

That's **$2-4 for 100 meetings**! 💰

---

## 🔐 **SECURITY - WHERE TO PUT API KEYS**

**NEVER put API keys directly in code!**

### ✅ Correct way:

1. Create/edit `.env` file in project root:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

2. The `.env` file is in `.gitignore` (won't be uploaded to git)

3. The app reads keys from `.env` automatically

### ❌ NEVER do this:
- Don't put keys in code
- Don't commit `.env` to git
- Don't share keys publicly
- Don't hardcode keys

---

## 🆘 **TROUBLESHOOTING**

### "Invalid API key"
- Check for extra spaces in `.env`
- Make sure key starts with `sk-` (OpenAI) or `sk-ant-` (Anthropic)
- Regenerate key if needed

### "Insufficient credits"
- Add money to your OpenAI/Anthropic account
- Check billing at: https://platform.openai.com/account/billing

### "Rate limit exceeded"
- Wait a few seconds and try again
- Upgrade your OpenAI tier if needed

---

## 📊 **COMPARISON TABLE**

| Feature | Whisper (Free) | GPT-4 | Claude | Local Llama |
|---------|----------------|-------|--------|-------------|
| **Cost** | FREE | $0.01/meeting | $0.01/meeting | FREE |
| **Privacy** | ✅ 100% | ⚠️ Cloud | ⚠️ Cloud | ✅ 100% |
| **Quality** | Good | Excellent | Excellent | Good |
| **Speed** | Medium | Fast | Fast | Slow |
| **Internet** | No | Yes | Yes | No |
| **Setup** | Easy | Easy | Easy | Hard |

---

## 🎯 **SUMMARY - WHAT YOU NEED**

### Minimum (FREE):
- ✅ Nothing! Whisper works without API keys

### Recommended (Best Quality):
- ✅ OpenAI API key ($5 minimum deposit)
- 💰 Cost: ~$0.02 per meeting

### Maximum Privacy:
- ✅ Nothing! Use local models
- 💻 Needs: Good CPU, patience for processing

---

## 🚀 **NEXT STEPS**

1. **Decide your setup** (I recommend: Whisper + GPT-4)
2. **Get OpenAI API key** (5 minutes)
3. **Edit `.env` file** (add your key)
4. **Run `npm start`** (launch app)
5. **Record a test meeting** (30 seconds)
6. **See the magic!** ✨

---

## 📞 **Still Have Questions?**

Check these files:
- `START_HERE.md` - Complete setup guide
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick setup

**Ready to get started?**

```bash
python setup.py    # Interactive setup
npm start          # Launch app
```

🎉 **Let's build something amazing!**

