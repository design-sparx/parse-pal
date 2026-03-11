import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import { deleteDocumentScope } from "@parse-pal/rag/vectorstore"
import { deleteConversationResources } from "@/lib/delete-conversation"
import { createServerConversationRepository } from "@/lib/repositories/conversations"
import { createServerDocumentRepository } from "@/lib/repositories/documents"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const conversations = createServerConversationRepository()
  const documents = createServerDocumentRepository()

  const conversation = await conversations.getById(id)
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }

  const document = await documents.getByConversationId(id)

  const result = await deleteConversationResources({
    conversationId: id,
    documentId: document?.id,
    cloudinaryPublicId: document?.cloudinaryPublicId,
    deleteCloudinaryAsset: async (cloudinaryPublicId) => {
      await cloudinary.uploader.destroy(cloudinaryPublicId, {
        resource_type: "raw",
        invalidate: true,
      })
    },
    deleteChromaEntries: async (scope) => {
      await deleteDocumentScope(scope)
    },
    deleteConversationRow: async (conversationId) => {
      await conversations.deleteById(conversationId)
    },
  })

  return NextResponse.json(result)
}
