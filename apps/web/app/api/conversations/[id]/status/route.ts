import { NextRequest, NextResponse } from "next/server"
import { createServerConversationRepository } from "@/lib/repositories/conversations"
import { createServerDocumentRepository } from "@/lib/repositories/documents"
import { createServerIngestJobRepository } from "@/lib/repositories/ingest-jobs"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const conversationId = id
  const documentId = new URL(_req.url).searchParams.get("documentId")
  const ingestJobId = new URL(_req.url).searchParams.get("ingestJobId")

  const conversations = createServerConversationRepository()
  const documents = createServerDocumentRepository()
  const ingestJobs = createServerIngestJobRepository()

  const conversation = await conversations.getById(conversationId)
  const document = documentId ? await documents.getById(documentId) : null
  const ingestJob = ingestJobId ? await ingestJobs.getById(ingestJobId) : null

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }

  return NextResponse.json({
    conversation,
    document,
    ingestJob,
  })
}
