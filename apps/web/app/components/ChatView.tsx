"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import type { Message } from "ai"
import {
  UploadIcon,
  SendIcon,
  FileTextIcon,
  Loader2Icon,
  CheckCircle2Icon,
  ArrowRightIcon,
  PanelRightIcon,
  PanelRightCloseIcon,
  PanelLeftOpenIcon,
  XIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Conversation } from "@/app/hooks/useConversations"

export type IngestMeta = {
  filename: string
  fileSize: string
  pages: number
  chunks: number
  summary: string
}

type IngestState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "summarizing" }
  | { status: "error"; message: string }

type Props = {
  conversation: Conversation | null
  onIngestSuccess: (filename: string, meta: IngestMeta) => void
  onMessagesChange: (messages: Message[]) => void
  pendingIngest: IngestMeta | null
  onOnboardingComplete: () => void
  showSidebarToggle?: boolean
  onToggleSidebar?: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function fetchSummary(): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content:
            "Give a concise 2-3 sentence summary of this document. What is it about and what are the key topics?",
        },
      ],
    }),
  })

  if (!res.ok || !res.body) return ""

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let summary = ""
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""
    for (const line of lines) {
      if (line.startsWith("0:")) {
        try {
          summary += JSON.parse(line.slice(2))
        } catch {}
      }
    }
  }

  return summary.trim()
}

export function ChatView({
  conversation,
  onIngestSuccess,
  onMessagesChange,
  pendingIngest,
  onOnboardingComplete,
  showSidebarToggle,
  onToggleSidebar,
}: Props) {
  const hasExistingMessages = (conversation?.messages.length ?? 0) > 0
  const [ingest, setIngest] = useState<IngestState>({ status: "idle" })
  const [isActive, setIsActive] = useState(hasExistingMessages)
  const [showInfo, setShowInfo] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } =
    useChat({
      api: "/api/chat",
      initialMessages: conversation?.messages ?? [],
    })

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      onMessagesChange(messages)
    }
  }, [messages, isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const fileSize = formatFileSize(file.size)
    setIngest({ status: "uploading" })

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setIngest({ status: "summarizing" })
      const summary = await fetchSummary()

      setMessages([])
      onIngestSuccess(file.name, {
        filename: data.filename,
        fileSize,
        pages: data.pages,
        chunks: data.chunks,
        summary,
      })
    } catch (err) {
      setIngest({ status: "error", message: (err as Error).message })
    }

    if (fileRef.current) fileRef.current.value = ""
  }

  function handleStartChatting() {
    setIsActive(true)
    setShowInfo(true)
    onOnboardingComplete()
  }

  const showChat = isActive || hasExistingMessages
  const docSummary = conversation?.summary

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept=".pdf"
      className="hidden"
      onChange={handleFileUpload}
    />
  )

  const sidebarToggleBtn = showSidebarToggle && (
    <Button
      variant="ghost"
      size="icon"
      onClick={onToggleSidebar}
      title="Open sidebar"
      className="absolute top-2 left-2"
    >
      <PanelLeftOpenIcon className="size-4" />
    </Button>
  )

  // Upload / summarize in progress
  if (ingest.status === "uploading" || ingest.status === "summarizing") {
    return (
      <div className="relative flex flex-col flex-1 items-center justify-center">
        {sidebarToggleBtn}
        {fileInput}
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2Icon className="size-10 text-muted-foreground animate-spin" />
          <div>
            <p className="font-semibold text-sm">
              {ingest.status === "uploading"
                ? "Uploading your document…"
                : "Analyzing your document…"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
          </div>
        </div>
      </div>
    )
  }

  // Onboarding card: shown after fresh upload, before first message
  if (pendingIngest && !showChat) {
    return (
      <div className="relative flex flex-col flex-1 items-center justify-center px-6">
        {sidebarToggleBtn}
        {fileInput}
        <div className="flex flex-col gap-5 max-w-md w-full">
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-muted/40">
            <div className="rounded-lg bg-background p-2.5 border border-border shrink-0">
              <FileTextIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{pendingIngest.filename}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pendingIngest.fileSize} &middot; {pendingIngest.pages} pages &middot;{" "}
                {pendingIngest.chunks} chunks
              </p>
            </div>
            <CheckCircle2Icon className="size-4 text-green-500 shrink-0 mt-0.5" />
          </div>

          {pendingIngest.summary && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                AI Summary
              </p>
              <p className="text-sm leading-relaxed">{pendingIngest.summary}</p>
            </div>
          )}

          <Button onClick={handleStartChatting} className="gap-2 w-full">
            Start chatting
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Empty hero: no PDF loaded, no prior messages
  if (!showChat) {
    return (
      <div className="relative flex flex-col flex-1 items-center justify-center">
        {sidebarToggleBtn}
        {fileInput}
        <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
          <div className="rounded-2xl bg-muted p-5">
            <FileTextIcon className="size-10 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">Chat with your PDF</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload a document and ask it anything — summaries, facts, comparisons, and more.
            </p>
          </div>
          {ingest.status === "error" && (
            <p className="text-xs text-destructive">{ingest.message}</p>
          )}
          <Button onClick={() => fileRef.current?.click()} className="gap-2 w-full">
            <UploadIcon className="size-4" />
            Upload PDF
          </Button>
          <p className="text-xs text-muted-foreground">.pdf files only</p>
        </div>
      </div>
    )
  }

  // Active chat
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {fileInput}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              title="Open sidebar"
            >
              <PanelLeftOpenIcon className="size-4" />
            </Button>
          )}
          <h2 className="font-semibold text-sm truncate">
            {conversation ? conversation.title : "New Chat"}
          </h2>
          {conversation?.docName && (
            <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
              {conversation.docName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {docSummary && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInfo((v) => !v)}
              title={showInfo ? "Hide document info" : "Show document info"}
            >
              {showInfo ? (
                <PanelRightCloseIcon className="size-4" />
              ) : (
                <PanelRightIcon className="size-4" />
              )}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="gap-2"
          >
            <UploadIcon className="size-4" />
            Upload PDF
          </Button>
        </div>
      </div>

      {/* Body: chat column + optional info panel */}
      <div className="flex flex-1 min-h-0">

        {/* Chat column */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-4 max-w-3xl mx-auto px-6 py-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center text-muted-foreground text-sm py-24 text-center">
                  Ask anything about your document
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-sm text-sm text-muted-foreground">
                    Thinking…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="px-6 py-4 border-t border-border shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto">
              <Input
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Ask a question…"
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <SendIcon />
              </Button>
            </form>
          </div>
        </div>

        {/* Info panel */}
        {showInfo && docSummary && (
          <aside className="w-72 border-l border-border flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Document
              </span>
              <button
                onClick={() => setShowInfo(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Close"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 p-4">
                {/* File metadata */}
                <div className="flex items-start gap-3">
                  <div className="rounded-md bg-muted p-1.5 shrink-0">
                    <FileTextIcon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {conversation?.docName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {conversation?.fileSize && `${conversation.fileSize} · `}
                      {conversation?.pages && `${conversation.pages} pages · `}
                      {conversation?.chunks && `${conversation.chunks} chunks`}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* AI Summary */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    AI Summary
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {docSummary}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </aside>
        )}
      </div>
    </div>
  )
}
