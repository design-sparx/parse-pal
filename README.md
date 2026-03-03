# ParsePal

Chat with your PDF documents using RAG (Retrieval-Augmented Generation). Upload a PDF, get an instant AI summary, then ask it anything.

## Features

- **PDF ingestion** — upload a PDF and it gets chunked and embedded into ChromaDB
- **AI summary** — an automatic 2–3 sentence summary is generated after every upload
- **Streaming chat** — ask questions and get streamed answers grounded in your document
- **Conversation history** — past conversations are persisted to `localStorage` with full message history
- **Conversation details** — each chat has a details page showing the document, AI summary, and a preview of the last exchange
- **Document info panel** — a toggleable side panel in the chat view shows the document metadata and summary at a glance
- **Sidebar** — collapsible conversation list with an upload CTA to start new chats

## Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm + Turborepo |
| Web app | Next.js 16, React 19, Tailwind v4 |
| UI components | shadcn/ui (canary, New York style) |
| AI / streaming | Vercel AI SDK + Groq (`llama-3.3-70b-versatile`) |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` via ONNX (runs locally) |
| Vector store | ChromaDB |
| CLI | `@langchain/groq` + `readline` |

## Project Structure

```
parse-pal/
├── apps/
│   ├── web/                  # Next.js web app
│   │   └── app/
│   │       ├── (chat)/       # Route group — shared sidebar layout
│   │       │   ├── layout.tsx       # Sidebar shell
│   │       │   ├── new/page.tsx     # /new — upload & welcome
│   │       │   └── chats/[id]/      # /chats/:id — conversation
│   │       ├── api/
│   │       │   ├── chat/route.ts    # Streaming chat endpoint
│   │       │   └── ingest/route.ts  # PDF upload & ingestion endpoint
│   │       └── components/
│   │           ├── ChatView.tsx     # Upload, onboarding, details, chat UI
│   │           └── Sidebar.tsx      # Conversation list + upload CTA
│   └── cli/                  # Terminal chat interface
└── packages/
    └── rag/                  # Shared RAG library
        ├── embeddings         # HuggingFace ONNX embeddings
        ├── vectorstore        # ChromaDB helpers
        └── ingest             # PDF loader, chunker, ingestion
```

## Prerequisites

**ChromaDB** must be running locally before ingesting or chatting:

```bash
# Using Docker
docker run -p 8000:8000 chromadb/chroma
```

**Environment variables** — create `apps/cli/.env` and/or `apps/web/.env.local`:

```env
GROQ_API_KEY=your_key_here
```

A root `.env.example` is provided as reference.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start ChromaDB (see Prerequisites above)

# Run the web app
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), click **Upload a PDF** in the sidebar, and start chatting.

## Web App Routes

| Route | Description |
|---|---|
| `/` | Redirects to `/new` |
| `/new` | Welcome screen — upload a PDF to begin |
| `/chats/:id` | Conversation page — details view → chat |

## User Flow

```
/new  →  Upload PDF  →  Uploading…  →  Analyzing…
      →  /chats/:id  →  Onboarding card (summary + "Start chatting")
                     →  Chat  →  Ask questions
```

Selecting an existing conversation from the sidebar navigates to `/chats/:id` and shows the conversation details page (document info, AI summary, last exchange preview) before resuming the chat.

## CLI Usage

```bash
# Ingest a PDF
pnpm ingest -- path/to/file.pdf

# Start interactive chat
pnpm chat
```

A sample PDF is available at `docs/my-document.pdf`.

## Commands

```bash
pnpm dev        # Run web app in development mode
pnpm build      # Build all packages
pnpm ingest     # Ingest a PDF via CLI
pnpm chat       # Start interactive CLI chat
```

## Notes

- **One PDF at a time** — each ingest deletes and recreates the `pdf_docs` ChromaDB collection
- **Embeddings are local** — no API key needed; the ONNX model downloads on first run
- **`@parse-pal/rag` has no build step** — source `.ts` files are imported directly via TypeScript path exports
- **Conversation data** is stored in `localStorage` under the key `parse-pal-conversations`
