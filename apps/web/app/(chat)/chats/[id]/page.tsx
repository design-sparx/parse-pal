"use client"

import { useRouter, useParams } from "next/navigation"
import { useConversations } from "@/app/hooks/useConversations"
import { ChatView, type IngestMeta } from "@/app/components/ChatView"
import type { Message } from "ai"

export default function ChatPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const { conversations, createConversation, saveMessages } = useConversations()
  const conversation = conversations.find((c) => c.id === id) ?? null

  function handleIngestSuccess(filename: string, meta: IngestMeta) {
    const newId = createConversation(filename, meta)
    router.push(`/chats/${newId}`)
  }

  function handleMessagesChange(messages: Message[]) {
    saveMessages(id, messages)
  }

  return (
    <ChatView
      key={id}
      conversation={conversation}
      onIngestSuccess={handleIngestSuccess}
      onMessagesChange={handleMessagesChange}
    />
  )
}
