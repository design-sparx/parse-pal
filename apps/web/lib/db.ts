import { neon } from "@neondatabase/serverless"
import { getDatabaseUrl } from "./env"

export type ConversationStatus = "queued" | "processing" | "ready" | "failed"
export type IngestJobStatus = "queued" | "processing" | "ready" | "failed"

export type Conversation = {
  id: string
  title: string
  status: ConversationStatus
  createdAt: string
  updatedAt: string
}

export type Document = {
  id: string
  conversationId: string
  cloudinaryPublicId: string
  cloudinaryUrl: string
  filename: string
  mimeType: string
  fileSize: number
  summary: string | null
  pageCount: number | null
  chunkCount: number | null
  createdAt: string
}

export type IngestJob = {
  id: string
  conversationId: string
  documentId: string
  status: IngestJobStatus
  errorMessage: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

type InMemoryDatabase = {
  conversations: Map<string, Conversation>
  documents: Map<string, Document>
  ingestJobs: Map<string, IngestJob>
}

export type DatabaseClient = ReturnType<typeof neon>

type CreateConversationInput = {
  title: string
}

type CreateDocumentInput = {
  conversationId: string
  cloudinaryPublicId: string
  cloudinaryUrl: string
  filename: string
  mimeType: string
  fileSize: number
}

type CreateIngestJobInput = {
  conversationId: string
  documentId: string
}

export function createInMemoryDatabase(): InMemoryDatabase {
  return {
    conversations: new Map(),
    documents: new Map(),
    ingestJobs: new Map(),
  }
}

export function createConversationRepository(db: InMemoryDatabase) {
  return {
    async create({ title }: CreateConversationInput) {
      const timestamp = now()
      const conversation: Conversation = {
        id: createId(),
        title,
        status: "queued",
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      db.conversations.set(conversation.id, conversation)
      return conversation
    },

    async getById(id: string) {
      return db.conversations.get(id) ?? null
    },
  }
}

export function createDocumentRepository(db: InMemoryDatabase) {
  return {
    async create(input: CreateDocumentInput) {
      const document: Document = {
        id: createId(),
        conversationId: input.conversationId,
        cloudinaryPublicId: input.cloudinaryPublicId,
        cloudinaryUrl: input.cloudinaryUrl,
        filename: input.filename,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        summary: null,
        pageCount: null,
        chunkCount: null,
        createdAt: now(),
      }

      db.documents.set(document.id, document)
      return document
    },
  }
}

export function createIngestJobRepository(db: InMemoryDatabase) {
  return {
    async create(input: CreateIngestJobInput) {
      const timestamp = now()
      const ingestJob: IngestJob = {
        id: createId(),
        conversationId: input.conversationId,
        documentId: input.documentId,
        status: "queued",
        errorMessage: null,
        startedAt: null,
        completedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      }

      db.ingestJobs.set(ingestJob.id, ingestJob)
      return ingestJob
    },

    async markProcessing(id: string) {
      const existing = getRequiredIngestJob(db, id)
      const updated: IngestJob = {
        ...existing,
        status: "processing",
        startedAt: existing.startedAt ?? now(),
        updatedAt: now(),
      }

      db.ingestJobs.set(id, updated)
      return updated
    },

    async markReady(id: string) {
      const existing = getRequiredIngestJob(db, id)
      const updated: IngestJob = {
        ...existing,
        status: "ready",
        completedAt: now(),
        updatedAt: now(),
      }

      db.ingestJobs.set(id, updated)
      return updated
    },

    async markFailed(id: string, errorMessage: string) {
      const existing = getRequiredIngestJob(db, id)
      const updated: IngestJob = {
        ...existing,
        status: "failed",
        errorMessage,
        completedAt: now(),
        updatedAt: now(),
      }

      db.ingestJobs.set(id, updated)
      return updated
    },
  }
}

export function getNeonDatabaseConfig(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env) {
  return {
    connectionString: getDatabaseUrl(env),
  }
}

export function getDatabaseClient(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env) {
  return neon(getDatabaseUrl(env))
}

function getRequiredIngestJob(db: InMemoryDatabase, id: string) {
  const ingestJob = db.ingestJobs.get(id)
  if (!ingestJob) {
    throw new Error(`Ingest job not found: ${id}`)
  }

  return ingestJob
}

function createId() {
  return crypto.randomUUID()
}

function now() {
  return new Date().toISOString()
}
