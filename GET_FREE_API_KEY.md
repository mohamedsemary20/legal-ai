# Get Free AI API Key (Groq)

Your OpenAI key has exceeded quota. Use Groq instead - it's **free** and fast!

## Steps:

1. **Get Groq API Key** (takes 1 minute):
   - Go to https://console.groq.com
   - Sign up/login (GitHub or email)
   - Click "Create API Key"
   - Copy the key

2. **Add to .env file**:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```

3. **Restart backend** (if it's running):
   - Press Ctrl+C in the backend terminal
   - Run: `python -m uvicorn main:app --reload`

4. **Test it!**
   - Open http://localhost:5175
   - Ask: "ما هي حقوق المستأجر؟"
   - Get instant AI response!

## Why Groq?

- ✅ **Free** - No credit card needed
- ✅ **Fast** - Uses Llama 3.1 70B (very capable model)
- ✅ **Generous limits** - Enough for testing and development

## Alternative (if you prefer OpenAI):

Add credits at https://platform.openai.com/account/billing and uncomment your OPENAI_API_KEY in .env

---

The backend automatically tries Groq first (free), then falls back to OpenAI if Groq fails.
