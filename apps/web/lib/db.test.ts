import test from "node:test"
import assert from "node:assert/strict"

import {
  createInMemoryDatabase,
  createConversationRepository,
  createDocumentRepository,
  createIngestJobRepository,
} from "./db.ts"

test("a conversation starts queued and can be read back", async () => {
  const db = createInMemoryDatabase()
  const conversations = createConversationRepository(db)

  const conversation = await conversations.create({
    title: "Quarterly report",
  })

  assert.equal(conversation.title, "Quarterly report")
  assert.equal(conversation.status, "queued")

  const stored = await conversations.getById(conversation.id)
  assert.deepEqual(stored, conversation)
})

test("a document can be attached to a conversation", async () => {
  const db = createInMemoryDatabase()
  const conversations = createConversationRepository(db)
  const documents = createDocumentRepository(db)

  const conversation = await conversations.create({
    title: "Product brief",
  })

  const document = await documents.create({
    conversationId: conversation.id,
    cloudinaryPublicId: "parse-pal/demo-file",
    cloudinaryUrl: "https://res.cloudinary.com/demo/raw/upload/sample.pdf",
    filename: "sample.pdf",
    mimeType: "application/pdf",
    fileSize: 1024,
  })

  assert.equal(document.conversationId, conversation.id)
  assert.equal(document.filename, "sample.pdf")
})

test("an ingest job transitions through processing to ready", async () => {
  const db = createInMemoryDatabase()
  const conversations = createConversationRepository(db)
  const documents = createDocumentRepository(db)
  const ingestJobs = createIngestJobRepository(db)

  const conversation = await conversations.create({
    title: "Investor update",
  })

  const document = await documents.create({
    conversationId: conversation.id,
    cloudinaryPublicId: "parse-pal/investor-update",
    cloudinaryUrl: "https://res.cloudinary.com/demo/raw/upload/investor-update.pdf",
    filename: "investor-update.pdf",
    mimeType: "application/pdf",
    fileSize: 2048,
  })

  const queuedJob = await ingestJobs.create({
    conversationId: conversation.id,
    documentId: document.id,
  })

  assert.equal(queuedJob.status, "queued")

  const processingJob = await ingestJobs.markProcessing(queuedJob.id)
  assert.equal(processingJob.status, "processing")
  assert.equal(typeof processingJob.startedAt, "string")

  const readyJob = await ingestJobs.markReady(queuedJob.id)
  assert.equal(readyJob.status, "ready")
  assert.equal(typeof readyJob.completedAt, "string")
})

test("an ingest job can fail with an error message", async () => {
  const db = createInMemoryDatabase()
  const conversations = createConversationRepository(db)
  const documents = createDocumentRepository(db)
  const ingestJobs = createIngestJobRepository(db)

  const conversation = await conversations.create({
    title: "Incident report",
  })

  const document = await documents.create({
    conversationId: conversation.id,
    cloudinaryPublicId: "parse-pal/incident-report",
    cloudinaryUrl: "https://res.cloudinary.com/demo/raw/upload/incident-report.pdf",
    filename: "incident-report.pdf",
    mimeType: "application/pdf",
    fileSize: 512,
  })

  const queuedJob = await ingestJobs.create({
    conversationId: conversation.id,
    documentId: document.id,
  })

  const failedJob = await ingestJobs.markFailed(queuedJob.id, "cloudinary download failed")

  assert.equal(failedJob.status, "failed")
  assert.equal(failedJob.errorMessage, "cloudinary download failed")
  assert.equal(typeof failedJob.completedAt, "string")
})
