"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useConversations } from "@/app/hooks/useConversations"
import { EmptyAppView } from "@/app/components/EmptyAppView"
import { Sidebar } from "@/app/components/Sidebar"
import { Button } from "@/components/ui/button"
import { PanelLeftOpenIcon } from "lucide-react"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { conversations, deleteConversation, isLoaded } = useConversations()

  const activeId = pathname.match(/^\/chats\/(.+)$/)?.[1] ?? null
  const showEmptyAppView = isLoaded && conversations.length === 0 && pathname === "/new"

  function handleDelete(id: string) {
    deleteConversation(id)
    if (activeId === id) router.push("/new")
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
          onSelect={(id) => router.push(`/chats/${id}`)}
          onDelete={handleDelete}
          onToggle={() => setSidebarOpen(false)}
          onNewChat={() => router.push("/new")}
        />
      )}
      <div className="flex flex-1 min-w-0 min-h-0 overflow-hidden">
        {!sidebarOpen && (
          <div className="shrink-0 flex flex-col items-center pt-[10px] px-1 border-r border-border">
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
