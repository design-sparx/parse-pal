import { NextRequest, NextResponse } from "next/server"
import { createServerConversationRepository } from "@/lib/repositories/conversations"
import { createServerDocumentRepository } from "@/lib/repositories/documents"
import { createServerIngestJobRepository } from "@/lib/repositories/ingest-jobs"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    title,
    filename,
    mimeType,
    fileSize,
    cloudinaryPublicId,
    cloudinaryUrl,
  } = body ?? {}

  if (!filename || !mimeType || !fileSize || !cloudinaryPublicId || !cloudinaryUrl) {
    return NextResponse.json({ error: "Upload metadata is incomplete" }, { status: 400 })
  }

  const conversationId = crypto.randomUUID()
  const documentId = crypto.randomUUID()
  const ingestJobId = crypto.randomUUID()

  const conversations = createServerConversationRepository()
  const documents = createServerDocumentRepository()
  const ingestJobs = createServerIngestJobRepository()

  const conversation = await conversations.create({
    id: conversationId,
    title: title ?? filename,
    status: "queued",
  })

  const document = await documents.create({
    id: documentId,
    conversationId,
    cloudinaryPublicId,
    cloudinaryUrl,
    filename,
    mimeType,
    fileSize: Number(fileSize),
  })

  const ingestJob = await ingestJobs.create({
    id: ingestJobId,
    conversationId,
    documentId,
  })

  return NextResponse.json({
    conversation,
    document,
    ingestJob,
  })
}
