"use client"

import { ArrowRightIcon, FileTextIcon, Loader2Icon } from "lucide-react"
import { useChatRoute } from "@/app/components/ChatRouteFrame"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ts))
}

export function ChatConversationView() {
  const {
    conversation,
    isLoaded,
    showDetails,
    setShowDetails,
    setIsActive,
  } = useChatRoute()

  if (!isLoaded) {
    return <div className="flex flex-1 items-center justify-center px-6 text-sm text-muted-foreground">Loading chat…</div>
  }

  if (!conversation) {
    return <div className="flex flex-1 items-center justify-center px-6 text-sm text-muted-foreground">Chat not found.</div>
  }

  if (conversation.status === "queued" || conversation.status === "processing") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
          <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Processing your document…</p>
            <p className="text-xs text-muted-foreground">
              ParsePal is chunking, embedding, and preparing your PDF for chat.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (conversation.status === "failed") {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="flex w-full max-w-md flex-col gap-3 text-center">
          <p className="text-sm font-medium">Document processing failed.</p>
          <p className="text-xs text-destructive">
            {conversation.errorMessage ?? "The ingest job did not complete successfully."}
          </p>
        </div>
      </div>
    )
  }

  if (showDetails) {
    const lastUserMsg = [...conversation.messages].reverse().find((message) => message.role === "user")
    const lastAssistantMsg = [...conversation.messages].reverse().find((message) => message.role === "assistant")
    const messageCount = conversation.messages.length

    return (
      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="flex w-full max-w-md flex-col gap-5">
          <div className="flex items-start gap-4 rounded-xl border border-border bg-muted/40 p-4">
            <div className="rounded-lg border border-border bg-background p-2.5 shrink-0">
              <FileTextIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{conversation.docName}</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                {[
                  conversation.fileSize,
                  conversation.pages && `${conversation.pages} pages`,
                  conversation.chunks && `${conversation.chunks} chunks`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>

          {conversation.summary && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                AI Summary
              </p>
              <p className="text-sm leading-relaxed">{conversation.summary}</p>
            </div>
          )}

          <Separator />

          <div className="flex flex-col gap-3">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Conversation
            </p>
            <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
              <span>{messageCount} message{messageCount !== 1 ? "s" : ""}</span>
              <span>&middot;</span>
              <span>Started {formatDate(conversation.createdAt)}</span>
            </div>

            {lastUserMsg && (
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
                <div className="flex flex-col gap-1">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Last question
                  </p>
                  <p className="line-clamp-2 text-xs">{lastUserMsg.content}</p>
                </div>
                {lastAssistantMsg && (
                  <>
                    <Separator />
                    <div className="flex flex-col gap-1">
                      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Last answer
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {lastAssistantMsg.content}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={() => {
              setShowDetails(false)
              setIsActive(true)
            }}
            className="w-full gap-2"
          >
            Continue Chatting
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    )
  }

  return null
}
