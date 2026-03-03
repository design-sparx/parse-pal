# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ParsePal is a PDF RAG (Retrieval-Augmented Generation) application. Users upload a PDF, which gets chunked and embedded into ChromaDB. They can then chat with it using Groq's `llama-3.3-70b-versatile` model. The project has two interfaces: a CLI and a Next.js web app.

## Monorepo Structure

This is a **pnpm + Turborepo** monorepo. Packages in `pnpm-workspace.yaml` cover both `apps/*` and `packages/*`.

- **`packages/rag`** — Shared RAG library (`@parse-pal/rag`). Exports three entry points:
  - `@parse-pal/rag/embeddings` — HuggingFace `all-MiniLM-L6-v2` embeddings (runs locally via `@huggingface/transformers`)
  - `@parse-pal/rag/vectorstore` — ChromaDB connection helpers (expects Chroma at `http://localhost:8000`)
  - `@parse-pal/rag/ingest` — PDF loading, chunking (1000 chars / 200 overlap), and ingestion into Chroma
- **`apps/cli`** — Terminal interface using `@langchain/groq` + `readline`
- **`apps/web`** — Next.js 16 app using Vercel AI SDK (`ai` + `@ai-sdk/groq`) with streaming responses

## Commands

All commands are run from the repo root using pnpm:

```bash
# Install dependencies
pnpm install

# Run the web app in dev mode
pnpm dev

# Build all packages
pnpm build

# Ingest a PDF (CLI)
pnpm ingest -- path/to/file.pdf
# or directly inside apps/cli:
pnpm --filter @parse-pal/cli ingest path/to/file.pdf

# Start interactive CLI chat
pnpm chat
```

The web app also exposes ingest via `POST /api/ingest` (multipart form) and chat via `POST /api/chat` (Vercel AI SDK streaming).

## Environment Variables

A `.env` file is needed in `apps/cli/` (loaded via `dotenv`). The web app reads from `.env.local` via Next.js.

```
GROQ_API_KEY=your_key_here
```

See `.env.example` at the root for reference.

## External Dependency: ChromaDB

A running ChromaDB instance is required at `http://localhost:8000` before ingesting or chatting. The collection name is `pdf_docs` (defined in `packages/rag/src/vectorstore.ts`). Each ingest call **deletes and recreates** the collection, so only one PDF is active at a time.

## Key Architectural Notes

- The `@parse-pal/rag` package uses TypeScript path exports (no build step — source `.ts` files are imported directly via `exports` in `package.json`). This works because the consuming apps use `tsx` (CLI) or Next.js (web), which handle TypeScript resolution.
- The CLI uses `@langchain/groq` with manual message history; the web app uses Vercel AI SDK's `streamText` with automatic message history from the client.
- Embeddings run **locally** via ONNX (no API key needed for embeddings). First run will download the model.
