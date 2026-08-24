# Quick Start

## You're ready to go! Here's what to do:

### 1. Add your OpenAI API key
Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=sk-your-key-here
```

### 2. Start the backend (Terminal 1)
```bash
uvicorn main:app --reload
```
The backend will run on http://localhost:8000

### 3. Start the frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
The frontend will run on http://localhost:5173

### 4. Open your browser
Navigate to http://localhost:5173 and start chatting!

## What's included

✅ **Backend**: FastAPI with OpenAI integration
✅ **Frontend**: React with RTL support and clean legal-themed UI
✅ **Chat interface**: Message history, typing indicator, auto-scroll
✅ **Mobile responsive**: Works on all screen sizes
✅ **Calm design**: Deep green accent on warm neutral background

## Testing the model

Try asking questions in Arabic like:
- "ما هي حقوق المستأجر في مصر؟"
- "كيف أسجل شركة جديدة؟"

Or in English:
- "What are tenant rights in Egypt?"
- "How do I register a new company?"

## Project structure

```
projectt/
├── main.py              # FastAPI backend with /api/chat endpoint
├── requirements.txt     # Python dependencies
├── .env                 # API keys (add your OpenAI key here)
├── frontend/
│   ├── src/
│   │   ├── App.jsx     # Main chat UI component
│   │   └── index.css   # Tailwind styles
│   └── package.json    # Frontend dependencies
└── README.md           # Full setup guide
```

## Notes

- This is a prototype to test model behavior
- No auth, database, or file upload yet
- CORS is open to localhost:5173
- System prompt is configured for Egyptian law
