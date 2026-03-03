"use client"

import { useState } from "react"
import { useConversations } from "@/app/hooks/useConversations"
import { Sidebar } from "@/app/components/Sidebar"
import { ChatView, type IngestMeta } from "@/app/components/ChatView"
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

  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [pendingIngest, setPendingIngest] = useState<{
    meta: IngestMeta
    convId: string
  } | null>(null)

  function handleIngestSuccess(filename: string, meta: IngestMeta) {
    const id = createConversation(filename, meta)
    setPendingIngest({ meta, convId: id })
  }

  function handleMessagesChange(messages: Message[]) {
    if (activeId) {
      saveMessages(activeId, messages)
    }
  }

  function handleOnboardingComplete() {
    setPendingIngest(null)
  }

  const relevantPendingIngest =
    activeId && pendingIngest?.convId === activeId ? pendingIngest.meta : null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {conversations.length > 0 && sidebarOpen && (
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onDelete={deleteConversation}
          onToggle={() => setSidebarOpen(false)}
        />
      )}
      <main className="flex flex-1 min-w-0">
        <ChatView
          key={activeId ?? "new"}
          conversation={active}
          onIngestSuccess={handleIngestSuccess}
          onMessagesChange={handleMessagesChange}
          pendingIngest={relevantPendingIngest}
          onOnboardingComplete={handleOnboardingComplete}
          showSidebarToggle={conversations.length > 0 && !sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
      </main>
    </div>
  )
}
