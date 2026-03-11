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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Conversation } from "@/app/hooks/useConversations"

export type CreatedConversation = {
  id: string
  documentId: string
  ingestJobId: string
  filename: string
  fileSize: string
  cloudinaryUrl: string
  cloudinaryPublicId: string
}

type IngestState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "summarizing" }
  | { status: "error"; message: string }

type Props = {
  conversation: Conversation | null
  onConversationCreated: (conversation: CreatedConversation) => void
  onMessagesChange: (messages: Message[]) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ChatView({
  conversation,
  onConversationCreated,
  onMessagesChange,
}: Props) {
  const hasExistingMessages = (conversation?.messages.length ?? 0) > 0
  const [ingest, setIngest] = useState<IngestState>({ status: "idle" })
  const [isActive, setIsActive] = useState(hasExistingMessages)
  const fileRef = useRef<HTMLInputElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      initialMessages: conversation?.messages ?? [],
      body: {
        conversationId: conversation?.id,
        documentId: conversation?.documentId,
      },
    })

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      onMessagesChange(messages)
    }
  }, [messages, isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const fileSize = formatFileSize(file.size)
    setIngest({ status: "uploading" })

    try {
      const signRes = await fetch("/api/uploads/sign", { method: "POST" })
      const signData = await signRes.json()
      if (!signRes.ok) throw new Error(signData.error)

      const uploadForm = new FormData()
      uploadForm.append("file", file)
      uploadForm.append("api_key", signData.apiKey)
      uploadForm.append("timestamp", String(signData.timestamp))
      uploadForm.append("signature", signData.signature)
      uploadForm.append("folder", signData.folder)
      uploadForm.append("resource_type", signData.resourceType)

      const uploadRes = await fetch(signData.uploadUrl, {
        method: "POST",
        body: uploadForm,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error?.message ?? "Cloudinary upload failed")

      const conversationRes = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          filename: file.name,
          mimeType: file.type || "application/pdf",
          fileSize: file.size,
          cloudinaryPublicId: uploadData.public_id,
          cloudinaryUrl: uploadData.secure_url,
        }),
      })
      const conversationData = await conversationRes.json()
      if (!conversationRes.ok) throw new Error(conversationData.error)

      setIngest({ status: "summarizing" })
      await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationData.conversation.id,
          documentId: conversationData.document.id,
          ingestJobId: conversationData.ingestJob.id,
          cloudinaryUrl: conversationData.document.cloudinaryUrl,
          filename: conversationData.document.filename,
        }),
      })

      onConversationCreated({
        id: conversationData.conversation.id,
        documentId: conversationData.document.id,
        ingestJobId: conversationData.ingestJob.id,
        filename: conversationData.document.filename,
        fileSize,
        cloudinaryUrl: conversationData.document.cloudinaryUrl,
        cloudinaryPublicId: conversationData.document.cloudinaryPublicId,
      })
    } catch (err) {
      setIngest({ status: "error", message: (err as Error).message })
    }

    if (fileRef.current) fileRef.current.value = ""
  }

  function handleStartChatting() {
    setIsActive(true)
  }

  const showChat = isActive || hasExistingMessages

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept=".pdf"
      className="hidden"
      onChange={handleFileUpload}
    />
  )

  // Upload / summarize in progress
  if (ingest.status === "uploading" || ingest.status === "summarizing") {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
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

  // Onboarding card: new conversation with summary but no messages yet
  if (!isActive && !hasExistingMessages && conversation?.summary) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-6">
        {fileInput}
        <div className="flex flex-col gap-5 max-w-md w-full">
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-muted/40">
            <div className="rounded-lg bg-background p-2.5 border border-border shrink-0">
              <FileTextIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{conversation.docName}</p>
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
            <CheckCircle2Icon className="size-4 text-green-500 shrink-0 mt-0.5" />
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              AI Summary
            </p>
            <p className="text-sm leading-relaxed">{conversation.summary}</p>
          </div>

          <Button onClick={handleStartChatting} className="gap-2 w-full">
            Start Chatting
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Empty hero: no PDF loaded, no prior messages
  if (!showChat) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
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
    <div className="flex min-h-0 flex-1 flex-col">
      {fileInput}

      <div className="mx-auto flex max-w-3xl flex-1 flex-col gap-4 px-6 py-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center py-24 text-center text-sm text-muted-foreground">
            Ask anything about your document
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${message.role === "user"
                ? "rounded-br-sm bg-primary text-primary-foreground"
                : "rounded-bl-sm bg-muted text-foreground"
                }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2 text-sm text-muted-foreground">
              Thinking…
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-border pt-4 shrink-0">
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              disabled={isLoading || conversation?.status !== "ready"}
              placeholder="Ask a question…"
              aria-label="Ask a question about your document"
              autoComplete="off"
              className="flex-1"
              name="prompt"
            />
            <Button
              type="submit"
              disabled={isLoading || conversation?.status !== "ready" || !input.trim()}
              size="icon"
              aria-label="Send message"
            >
              <SendIcon />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
