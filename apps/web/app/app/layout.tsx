"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { ConversationsProvider, useConversations } from "@/app/hooks/useConversations"
import { EmptyAppView } from "@/app/components/EmptyAppView"
import { Sidebar } from "@/app/components/Sidebar"
import { ThemeToggleButton } from "@/app/components/ThemeToggleButton"
import { Button } from "@/components/ui/button"
import { PanelLeftOpenIcon } from "lucide-react"

function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { conversations, deleteConversation, isLoaded } = useConversations()

  const activeId = pathname.match(/^\/app\/chats\/(.+)$/)?.[1] ?? null
  const showEmptyAppView = isLoaded && conversations.length === 0 && pathname === "/app"

  function handleDelete(id: string) {
    deleteConversation(id)
    if (activeId === id) router.push("/app")
  }

  if (showEmptyAppView) {
    return <EmptyAppView>{children}</EmptyAppView>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => router.push(`/app/chats/${id}`)}
          onDelete={handleDelete}
          onToggle={() => setSidebarOpen(false)}
          onNewChat={() => router.push("/app")}
        />
      )}
      <div className="flex flex-1 min-w-0 min-h-0 overflow-hidden">
        {!sidebarOpen && (
          <div className="shrink-0 flex flex-col items-center pt-[10px] px-1 border-r border-border">
            <ThemeToggleButton />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              title="Open sidebar"
            >
              <PanelLeftOpenIcon className="size-4" />
            </Button>
          </div>
        )}
        <div className="flex flex-1 min-w-0 min-h-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConversationsProvider>
      <AppShell>{children}</AppShell>
    </ConversationsProvider>
  )
}
