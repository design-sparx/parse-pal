"use client"

import { useRouter } from "next/navigation"
import { useConversations } from "@/app/hooks/useConversations"
import { ChatView, type CreatedConversation } from "@/app/components/ChatView"

export default function AppHomePage() {
  const router = useRouter()
  const { createConversation } = useConversations()

  function handleConversationCreated(conversation: CreatedConversation) {
    const id = createConversation(conversation.filename, {
      id: conversation.id,
      status: "processing",
      documentId: conversation.documentId,
      ingestJobId: conversation.ingestJobId,
      cloudinaryUrl: conversation.cloudinaryUrl,
      cloudinaryPublicId: conversation.cloudinaryPublicId,
      fileSize: conversation.fileSize,
    })
    router.push(`/app/chats/${id}`)
  }

  return (
    <ChatView
      conversation={null}
      onConversationCreated={handleConversationCreated}
      onMessagesChange={() => {}}
    />
  )
}
