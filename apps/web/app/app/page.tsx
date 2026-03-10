"use client"

import { useRouter } from "next/navigation"
import { useConversations } from "@/app/hooks/useConversations"
import { ChatView, type IngestMeta } from "@/app/components/ChatView"

export default function AppHomePage() {
  const router = useRouter()
  const { createConversation } = useConversations()

  function handleIngestSuccess(filename: string, meta: IngestMeta) {
    const id = createConversation(filename, meta)
    router.push(`/app/chats/${id}`)
  }

  return (
    <ChatView
      conversation={null}
      onIngestSuccess={handleIngestSuccess}
      onMessagesChange={() => {}}
    />
  )
}
