"use client"

import Link from "next/link"
import { PanelLeftCloseIcon, Trash2Icon, FileTextIcon, GithubIcon, UploadIcon } from "lucide-react"
import appPackage from "../../../../package.json"
import { Logo } from "@/components/Logo"
import { ThemeToggleButton } from "@/app/components/ThemeToggleButton"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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

function truncateTitle(title: string, maxLength = 20) {
  if (title.length <= maxLength) return title
  return `${title.slice(0, maxLength)}...`
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
        <div className="flex min-w-0 items-center gap-2">
          <Logo className="text-sidebar-foreground" />
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggleButton />
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftCloseIcon className="size-4" />
          </Button>
        </div>
      </div>

      <Separator />

      <div className="px-3 py-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/60 px-3 py-2.5 text-left text-xs font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <UploadIcon className="size-3.5 shrink-0 text-muted-foreground" />
          <span>Upload a PDF</span>
        </button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="px-2 py-2 flex flex-col gap-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(conv.id)}
              onKeyDown={(e) => e.key === "Enter" && onSelect(conv.id)}
              className={cn(
                "group relative w-full cursor-pointer rounded-md px-3 py-2 pr-9 text-left text-sm transition-colors hover:bg-sidebar-accent",
                activeId === conv.id &&
                  "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-xs font-medium leading-tight" title={conv.title}>
                  {truncateTitle(conv.title)}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (!window.confirm(`Delete "${conv.title}"?`)) return
                  onDelete(conv.id)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                aria-label={`Delete ${conv.title}`}
              >
                <Trash2Icon className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 shrink-0">
        <Separator className="mb-3" />
        <div className="flex flex-col gap-1.5">
          <Link
            href="/about"
            className="flex items-center rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="/changelogs"
            className="flex items-center rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            Changelogs
          </Link>
          <a
            href="https://github.com/design-sparx/parse-pal"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            <GithubIcon className="size-3.5 shrink-0" />
            Open Source
          </a>
          <div className="px-3 pt-2">
            <div className="flex items-center justify-between border-t border-sidebar-border/70 pt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80">
              <span>Version</span>
              <span className="font-mono normal-case tracking-normal text-muted-foreground">
                v{appPackage.version}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
