# ParsePal

ParsePal is a monorepo for a PDF-focused RAG application that ingests documents, generates summaries, and supports grounded chat through both a Next.js web app and a CLI interface.

## Overview

This project is built as a practical retrieval-augmented generation system rather than a generic chat wrapper. A PDF is parsed, chunked, embedded locally, stored in ChromaDB, and then queried at chat time to produce responses grounded in the uploaded document.

The repository is structured as a `pnpm` workspace with a shared `@parse-pal/rag` package that powers both user surfaces:

- `apps/web` for the browser-based experience
- `apps/cli` for local ingestion and terminal chat
- `packages/rag` for shared ingestion, embedding, and retrieval logic

## Architecture At A Glance

```text
PDF -> ingestion pipeline -> chunks -> embeddings -> ChromaDB
                                           |
User question -> retrieval -> context assembly -> LLM response stream
```

The ingestion pipeline loads a PDF, splits it into chunks, generates embeddings with a local ONNX model, and writes vectors into ChromaDB. During chat, relevant chunks are retrieved and passed to the model so responses stay anchored to the indexed document.

## Core Capabilities

- PDF ingestion backed by a shared RAG pipeline
- Automatic document summary generation after upload
- Streaming chat responses in the web interface
- Shared retrieval logic across web and CLI clients
- Conversation persistence in the browser via `localStorage`
- Document metadata and summary surfaced alongside chat
- Release notes exposed in-product from the root `CHANGELOG.md`

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | `pnpm` workspace + Turborepo |
| Web app | Next.js 16, React 19, Tailwind CSS v4 |
| UI | shadcn/ui (canary, New York style) |
| AI runtime | Vercel AI SDK |
| Model provider | Groq with `llama-3.3-70b-versatile` |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` via ONNX |
| Vector store | ChromaDB |
| CLI | Node.js + `readline` + `@langchain/groq` |

## Getting Started

### Prerequisites

ChromaDB must be running locally before ingestion or chat.

```bash
docker run -p 8000:8000 chromadb/chroma
```

Create environment files for the surfaces you want to run:

- `apps/web/.env.local`
- `apps/cli/.env`

Minimum required variable:

```env
GROQ_API_KEY=your_key_here
```

Local development uses Chroma on `http://localhost:8000` by default. If you want to override that local endpoint:

```env
CHROMA_URL=http://localhost:8000
```

For Chroma Cloud, set all three variables below. When they are present, the app and CLI use Chroma Cloud instead of the local `CHROMA_URL` fallback:

```env
CHROMA_API_KEY=your_chroma_cloud_key
CHROMA_TENANT=your_chroma_tenant
CHROMA_DATABASE=your_chroma_database
```

For hosted async ingest, add Neon and Cloudinary:

```env
DATABASE_URL=your_neon_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

The root `.env.example` is included as a reference.

### Install And Run

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

If you only want the web app:

```bash
pnpm --filter @parse-pal/web dev
```

## Usage

### Web App

1. Start the app and open `http://localhost:3000`
2. Upload a PDF from the app workspace
3. Wait for ingestion and summary generation
4. Continue into the chat view and ask document-specific questions

### CLI

```bash
pnpm ingest -- path/to/file.pdf
pnpm chat
```

A sample document is available at `docs/my-document.pdf`.

## Workspace Structure

```text
parse-pal/
|- apps/
|  |- web/          # Next.js application
|  |  |- app/       # App Router routes and route UI
|  |  \- components/# Shared UI components
|  \- cli/          # CLI entry points
|- packages/
|  \- rag/          # Shared ingestion, embeddings, retrieval, vector store
|- docs/            # Notes, plans, and reference material
\- README.md
```

## Routes And Commands

### Web Routes

| Route | Purpose |
|---|---|
| `/` | Redirect entry point |
| `/about` | Public overview page |
| `/app` | Main workspace and upload entry |
| `/app/chats/:id` | Conversation view for an indexed document |
| `/changelogs` | Public release notes page |

### Root Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Run the workspace in development mode |
| `pnpm build` | Build all workspaces |
| `pnpm ingest` | Run the CLI ingestion flow |
| `pnpm chat` | Run the CLI chat flow |
| `pnpm release` | Start an interactive release |

## Implementation Notes

- The current ingestion flow targets one PDF collection at a time and recreates the `pdf_docs` ChromaDB collection on each ingest.
- Local development defaults to `CHROMA_URL=http://localhost:8000`.
- If `CHROMA_API_KEY`, `CHROMA_TENANT`, and `CHROMA_DATABASE` are all set, ParsePal connects to Chroma Cloud instead of the local Chroma instance.
- Hosted async ingest requires Neon for job state and Cloudinary for PDF storage.
- Embeddings are generated locally, so no embeddings API key is required.
- The ONNX model is downloaded on first run.
- `@parse-pal/rag` is consumed directly from TypeScript source and does not have a separate build step.
- Web conversation state is stored in `localStorage` under `parse-pal-conversations`.

## Release Workflow

Release automation is managed from the workspace root with `release-it`.

```bash
pnpm release
pnpm release:patch
pnpm release:minor
pnpm release:major
```

The release flow updates the root package version, generates changelog entries from Conventional Commit history, creates the release commit, and tags the repository as `v<version>`.
