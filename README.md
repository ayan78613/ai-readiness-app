# Kestra AI Readiness Benchmark App

Internal AI-readiness self-assessment + management dashboard. Runs fully
locally — React client, Node/Express API, SQLite file on disk. No internet
connection needed after install.

## Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer (built and tested on Node 22)

## Install

```bash
git clone <this-repo-url>
cd kestra-ai-readiness-app
npm install
npm run install:all
```

## Run

```bash
npm run dev
```

This starts both servers together:

- Client: [http://localhost:5173](http://localhost:5173)
- API: http://localhost:4000

Open the client URL in your browser. On first run the server creates
`server/ai_readiness.db` and seeds the 27-KPI framework automatically — no
manual database setup needed.

Stop with `Ctrl+C`. Your data persists in `server/ai_readiness.db` between
runs (that file is git-ignored, so each machine keeps its own).

## Project structure

```
/server   Express API + SQLite (better-sqlite3)
/client   React + Vite + TypeScript, charts via Recharts
```
