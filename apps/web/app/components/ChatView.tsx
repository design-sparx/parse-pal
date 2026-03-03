"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import type { Message } from "ai"
import { UploadIcon, SendIcon, FileTextIcon, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Conversation } from "@/app/hooks/useConversations"

type IngestState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "done"; filename: string; pages: number; chunks: number }
  | { status: "error"; message: string }

type Props = {
  conversation: Conversation | null
  onIngestSuccess: (filename: string) => void
  onMessagesChange: (messages: Message[]) => void
}

export function ChatView({ conversation, onIngestSuccess, onMessagesChange }: Props) {
  const [ingest, setIngest] = useState<IngestState>({ status: "idle" })
  const fileRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } =
    useChat({
      api: "/api/chat",
      initialMessages: conversation?.messages ?? [],
    })

  // Persist messages after each completed AI response or user message
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      onMessagesChange(messages)
    }
  }, [messages, isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIngest({ status: "uploading" })

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/ingest", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setIngest({
        status: "done",
        filename: data.filename,
        pages: data.pages,
        chunks: data.chunks,
      })
      setMessages([])
      onIngestSuccess(file.name)
    } catch (err) {
      setIngest({ status: "error", message: (err as Error).message })
    }

    if (fileRef.current) fileRef.current.value = ""
  }

  const hasExistingMessages = (conversation?.messages.length ?? 0) > 0
  const isReady = ingest.status === "done" || hasExistingMessages

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept=".pdf"
      className="hidden"
      onChange={handleFileUpload}
    />
  )

  // Hero: shown when no PDF is loaded and no prior messages
  if (!isReady) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        {fileInput}
        {ingest.status === "uploading" ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2Icon className="size-10 text-muted-foreground animate-spin" />
            <div>
              <p className="font-semibold text-sm">Processing your document…</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    )
  }

  // Active chat
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {fileInput}
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="font-semibold text-sm truncate">
            {conversation ? conversation.title : "New Chat"}
          </h2>
          {ingest.status === "done" && (
            <span className="text-xs text-muted-foreground shrink-0">
              {ingest.filename} &middot; {ingest.pages}p &middot; {ingest.chunks} chunks
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          className="gap-2 shrink-0"
        >
          <UploadIcon className="size-4" />
          Upload PDF
        </Button>
      </div>

      {/* Messages */}
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

      {/* Input */}
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
  )
}
