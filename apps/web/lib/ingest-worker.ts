import { writeFile } from "fs/promises"
import { tmpdir } from "os"
import { join } from "path"
import { createGroq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { ingestPDF } from "@parse-pal/rag/ingest"
import { createServerConversationRepository } from "@/lib/repositories/conversations"
import { createServerDocumentRepository } from "@/lib/repositories/documents"
import { createServerIngestJobRepository } from "@/lib/repositories/ingest-jobs"

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

type ProcessIngestJobInput = {
  conversationId: string
  documentId: string
  ingestJobId: string
  cloudinaryUrl: string
  filename: string
}

export async function processIngestJob(input: ProcessIngestJobInput) {
  const conversations = createServerConversationRepository()
  const documents = createServerDocumentRepository()
  const ingestJobs = createServerIngestJobRepository()

  await conversations.updateStatus(input.conversationId, "processing")
  await ingestJobs.markProcessing(input.ingestJobId)

  try {
    const response = await fetch(input.cloudinaryUrl)
    if (!response.ok) {
      throw new Error(`Failed to download PDF from Cloudinary (${response.status})`)
    }

    const bytes = await response.arrayBuffer()
    const tmpPath = join(tmpdir(), `parse-pal-${input.documentId}-${Date.now()}.pdf`)
    await writeFile(tmpPath, Buffer.from(bytes))

    const { pages, chunks, previewText } = await ingestPDF(tmpPath, {
      conversationId: input.conversationId,
      documentId: input.documentId,
      filename: input.filename,
    })

    const summary = await summarizeDocument(previewText)

    await documents.markReady({
      id: input.documentId,
      summary,
      pageCount: pages,
      chunkCount: chunks,
    })
    await ingestJobs.markReady(input.ingestJobId)
    await conversations.updateStatus(input.conversationId, "ready")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ingest error"
    await ingestJobs.markFailed(input.ingestJobId, message)
    await conversations.updateStatus(input.conversationId, "failed")
    throw error
  }
}

async function summarizeDocument(previewText: string) {
  const result = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    prompt: `Write a concise 2-3 sentence summary of the following document excerpt. Focus on what the document is about and its key topics.

Document excerpt:
${previewText}`,
  })

  return result.text.trim()
}
