"use client"

import { useConversations } from "@/app/hooks/useConversations"
import { Sidebar } from "@/app/components/Sidebar"
import { ChatView } from "@/app/components/ChatView"
import type { Message } from "ai"

export default function Home() {
  const {
    conversations,
    activeId,
    active,
    createConversation,
    saveMessages,
    deleteConversation,
    setActiveId,
  } = useConversations()

  function handleIngestSuccess(filename: string) {
    createConversation(filename)
  }

  function handleMessagesChange(messages: Message[]) {
    if (activeId) {
      saveMessages(activeId, messages)
    }
  }

  function handleNew() {
    // Just clear the active selection so ChatView shows empty state
    setActiveId(null)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onDelete={deleteConversation}
        onNew={handleNew}
      />
      <main className="flex flex-1 min-w-0">
        <ChatView
          key={activeId ?? "new"}
          conversation={active}
          onIngestSuccess={handleIngestSuccess}
          onMessagesChange={handleMessagesChange}
        />
      </main>
    </div>
  )
}
