# AI Trip Planner

An AI travel agent that plans day-by-day trips using live weather, place search, currency conversion and cost calculations. A LangGraph ReAct agent runs behind a FastAPI backend, with a Next.js chat frontend.

```
frontend/   Next.js (React, TypeScript, Tailwind) chat UI
main.py     FastAPI backend: POST /query, GET /health
agent/      LangGraph agent
tools/      Weather, places, calculator and currency tools
```

## Setup

### Backend

```bash
cp .env.example .env          # then fill in your API keys
pip install -r requirements.txt
uvicorn main:app --reload     # http://localhost:8000
```

Required keys: `GROQ_API_KEY`, `TAVILY_API_KEY`, `OPENWEATHERMAP_API_KEY` and `EXCHANGE_RATE_API_KEY`. `GPLACES_API_KEY` is optional; without it, place search falls back to Tavily.

### Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

The frontend expects the backend at `http://localhost:8000`. To use another URL, copy `frontend/.env.example` to `frontend/.env.local` and change `NEXT_PUBLIC_API_URL`.

## How conversations work

- `POST /query` takes `{ "question", "thread_id", "history" }`. Leave `thread_id` empty to start a new conversation; the response returns one to send with follow-ups.
- The backend keeps conversation state in memory (LangGraph `MemorySaver`), so it is lost on restart. The frontend saves chats in the browser's `localStorage` and sends earlier messages as `history`. The backend uses them only when it doesn't already have that thread, so conversations survive a backend restart.
