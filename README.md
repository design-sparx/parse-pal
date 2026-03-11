# ParsePal

ParsePal is a monorepo for a PDF-focused RAG application that ingests documents, generates summaries, and supports grounded chat through both a Next.js web app and a CLI interface.

## Overview

This project is built as a practical retrieval-augmented generation system rather than a generic chat wrapper. In local development, a PDF can still be ingested against a local Chroma instance. In the hosted web flow, PDFs are uploaded to Cloudinary, tracked in Neon, processed asynchronously, written to Chroma, and then queried at chat time to produce responses grounded in the uploaded document.

The repository is structured as a `pnpm` workspace with a shared `@parse-pal/rag` package that powers both user surfaces:

- `apps/web` for the browser-based experience
- `apps/cli` for local ingestion and terminal chat
- `packages/rag` for shared ingestion, embedding, and retrieval logic

## Architecture At A Glance

```text
Browser -> Cloudinary upload -> Neon conversation/job records -> async ingest worker
                                                            |
PDF download <- worker <- Cloudinary asset <- metadata -----+
                                                            |
PDF -> ingestion pipeline -> chunks -> embeddings -> ChromaDB
                                                            |
User question -> filtered retrieval -> context assembly -> LLM response stream
```

The ingestion pipeline loads a PDF, splits it into chunks, generates embeddings, and writes vectors into ChromaDB. During chat, relevant chunks are retrieved with document-scoped metadata filters and passed to the model so responses stay anchored to the active document instead of a single global collection.

## Core Capabilities

- PDF ingestion backed by a shared RAG pipeline
- Async hosted ingest using Cloudinary uploads and Neon job tracking
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
| Hosted file storage | Cloudinary |
| Hosted app state | Neon Postgres |
| AI runtime | Vercel AI SDK |
| Model provider | Groq with `llama-3.3-70b-versatile` |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` via ONNX |
| Vector store | ChromaDB |
| CLI | Node.js + `readline` + `@langchain/groq` |

## Getting Started

### Prerequisites

For local-only development, ChromaDB must be running locally before ingestion or chat.

```bash
docker run -p 8000:8000 chromadb/chroma
```

For the hosted-style web flow, you also need:

- a Neon database with the SQL schema applied
- a Cloudinary account configured for PDF uploads
- Cloudinary PDF delivery enabled in the Cloudinary security settings

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

### Database Setup

Apply the SQL schema in:

`docs/plans/sql/2026-03-11-cloudinary-neon-ingest.sql`

This creates the `conversations`, `documents`, and `ingest_jobs` tables used by the hosted ingest flow.

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

### Local Test Setup

To test the hosted-style upload flow locally:

1. Start Chroma locally or configure Chroma Cloud
2. Set `GROQ_API_KEY`, `DATABASE_URL`, and Cloudinary credentials in `apps/web/.env.local`
3. Apply the Neon SQL schema
4. Start the web app with `pnpm --filter @parse-pal/web dev`
5. Open `http://localhost:3000/app` and upload a PDF

## Usage

### Web App

1. Start the app and open `http://localhost:3000`
2. Upload a PDF from the app workspace
3. The browser uploads the file to Cloudinary
4. The app creates conversation, document, and ingest job records in Neon
5. The ingest worker processes the document asynchronously
6. Once the job is ready, continue into the chat view and ask document-specific questions

### CLI

```bash
pnpm ingest -- path/to/file.pdf
pnpm chat
```

The CLI remains a local/admin-oriented workflow and still uses the shared RAG package.

A sample document is available at `docs/my-document.pdf`.

## Deployment

### Hosted Web App

The hosted web app assumes:

- Netlify for the Next.js app
- Cloudinary for PDF storage
- Neon for conversation, document, and job state
- Chroma Cloud or another reachable Chroma deployment for vectors

Required hosted env vars:

```env
GROQ_API_KEY=
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CHROMA_API_KEY=
CHROMA_TENANT=
CHROMA_DATABASE=
```

### Cloudinary Note

If PDF delivery is disabled in Cloudinary, upload signing may succeed but ingest will fail when the worker tries to download the uploaded asset. Enable PDF delivery in Cloudinary before testing hosted ingest.

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

- Local development defaults to `CHROMA_URL=http://localhost:8000`.
- If `CHROMA_API_KEY`, `CHROMA_TENANT`, and `CHROMA_DATABASE` are all set, ParsePal connects to Chroma Cloud instead of the local Chroma instance.
- Hosted async ingest uses Cloudinary for PDF storage, Neon for conversation and job state, and an async worker path for document processing.
- Chroma ingestion is document-scoped through metadata such as `conversationId` and `documentId`.
- Embeddings are generated locally, so no embeddings API key is required.
- The ONNX model is downloaded on first run.
- `@parse-pal/rag` is consumed directly from TypeScript source and does not have a separate build step.
- Browser conversation state is still cached in `localStorage` under `parse-pal-conversations`, but the hosted ingest flow now depends on server-backed records in Neon.

## Release Workflow

Release automation is managed from the workspace root with `release-it`.

```bash
pnpm release
pnpm release:patch
pnpm release:minor
pnpm release:major
```

The release flow updates the root package version, generates changelog entries from Conventional Commit history, creates the release commit, and tags the repository as `v<version>`.
