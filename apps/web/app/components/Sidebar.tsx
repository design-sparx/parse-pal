"use client"

import { PanelLeftCloseIcon, Trash2Icon, FileTextIcon, UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/app/hooks/useConversations"

type Props = {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onToggle: () => void
  onNewChat: () => void
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onToggle,
  onNewChat,
}: Props) {
  return (
    <aside className="flex flex-col w-64 border-r border-border bg-sidebar shrink-0">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-semibold text-sm text-sidebar-foreground">ParsePal</span>
        <Button variant="ghost" size="icon" onClick={onToggle} title="Collapse sidebar">
          <PanelLeftCloseIcon className="size-4" />
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="py-2 px-2 flex flex-col gap-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(conv.id)}
              onKeyDown={(e) => e.key === "Enter" && onSelect(conv.id)}
              className={cn(
                "group w-full text-left rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent cursor-pointer",
                activeId === conv.id &&
                  "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-start justify-between gap-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs font-medium leading-tight">
                    {conv.title}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(conv.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2Icon className="size-3.5" />
                </button>
              </div>
              <Badge
                variant="secondary"
                className="mt-1 text-[10px] max-w-full truncate"
              >
                {conv.docName}
              </Badge>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 shrink-0">
        <Separator className="mb-3" />
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors border border-dashed border-border"
        >
          <UploadIcon className="size-3.5 shrink-0" />
          <span>Upload a PDF</span>
        </button>
      </div>
    </aside>
  )
}
