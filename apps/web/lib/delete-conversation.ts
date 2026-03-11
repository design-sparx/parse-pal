type DeleteConversationResourcesInput = {
  conversationId: string
  documentId?: string
  cloudinaryPublicId?: string
  deleteCloudinaryAsset: (cloudinaryPublicId: string) => Promise<void>
  deleteChromaEntries: (scope: { conversationId: string; documentId?: string }) => Promise<void>
  deleteConversationRow: (conversationId: string) => Promise<void>
}

export async function deleteConversationResources(input: DeleteConversationResourcesInput) {
  const warnings: string[] = []

  if (input.cloudinaryPublicId) {
    try {
      await input.deleteCloudinaryAsset(input.cloudinaryPublicId)
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "Cloudinary cleanup failed")
    }
  }

  try {
    await input.deleteChromaEntries({
      conversationId: input.conversationId,
      documentId: input.documentId,
    })
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : "Chroma cleanup failed")
  }

  await input.deleteConversationRow(input.conversationId)

  return {
    ok: true,
    warnings,
  }
}
