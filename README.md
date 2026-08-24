# Legal AI Chat - Setup Instructions

A minimal legal-AI chat prototype with FastAPI backend and React frontend.

## Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key

## Setup

### 1. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Create .env file with your API key
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

## Running the Application

### Terminal 1 - Backend
```bash
uvicorn main:app --reload
```
Backend runs on http://localhost:8000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

## Usage

1. Open http://localhost:5173 in your browser
2. Type a legal question in Arabic or English
3. Get AI-powered responses about Egyptian law

## Stack

- **Backend**: FastAPI, OpenAI API
- **Frontend**: React, Vite, Tailwind CSS
- **Design**: RTL-first, calm green/neutral palette for legal context

## Notes

This is a throwaway/learning build to validate model behavior. No auth, database, file upload, or RAG yet.
