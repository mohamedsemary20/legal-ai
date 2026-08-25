# AI Legal Assistant ⚖️

An Arabic-language legal assistant specialized in Egyptian law: instant answers to legal questions, PDF/Word document analysis, and contract drafting (rental, employment, NDAs) with downloadable PDF output.

## Tech Stack

- **Backend**: FastAPI + Groq LLM (`openai/gpt-oss-120b`) + PyMuPDF + fpdf2
- **Frontend**: React 19 + TanStack Start + Tailwind CSS 4 (fully RTL-aware with English support)

## Features

- 💬 **Legal chat** — structured Markdown answers citing Egyptian laws and articles
- 📄 **Document analysis** — upload a PDF or DOCX (up to 10 MB) and ask questions about it
- 📝 **Contract drafting** — rental / employment / confidentiality agreements with customizable clauses and special notes, downloadable as a ready-to-review PDF
- 🔐 **Authentication** — email/password sign-up & sign-in (Google sign-in supported when configured)

## Setup

### 1. Backend

```bash
pip install -r requirements.txt
cp .env.example .env   # then fill in your keys inside .env
```

Required environment variables:

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Free key from https://console.groq.com |
| `JWT_SECRET_KEY` | Random secret used to sign session tokens |
| `GOOGLE_CLIENT_ID` | (Optional) Google OAuth client ID for Google sign-in |
| `DATABASE_URL` | (Optional) Postgres URL; falls back to local SQLite |

> Get a free Groq API key at https://console.groq.com

### 2. Frontend

```bash
cd frontend
npm install
```

Optional frontend environment variables (in `frontend/.env`):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL (defaults to `http://localhost:8000`) |
| `VITE_GOOGLE_CLIENT_ID` | (Optional) enables the Google sign-in button |

## Running

```bash
# Terminal 1 — backend on http://localhost:8000
uvicorn main:app --reload

# Terminal 2 — frontend on http://localhost:5173
cd frontend
npm run dev
```

## Deployment

- **Backend**: Railway (see repo deploy configs)
- **Frontend**: Vercel
- Set the environment variables listed above in each platform's dashboard.

> ⚖️ This provides general legal information, not official legal advice. For specific cases, consult a licensed lawyer.
