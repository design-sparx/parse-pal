"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useChat } from "ai/react"
import type { Message } from "ai"
import { useParams, useRouter } from "next/navigation"
import {
  EllipsisVerticalIcon,
  FileTextIcon,
  PencilLineIcon,
  PanelRightCloseIcon,
  PanelRightIcon,
  SendIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useConversations } from "@/app/hooks/useConversations"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MarkdownContent } from "@/app/components/MarkdownContent"
import { ThinkingBubble } from "@/app/components/ThinkingBubble"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type ChatRouteContextValue = {
  conversationId: string
  conversation: ReturnType<typeof useConversations>["active"] | null
  isLoaded: boolean
  messages: Message[]
  input: string
  isLoading: boolean
  showInfo: boolean
  showDetails: boolean
  isActive: boolean
  setShowInfo: React.Dispatch<React.SetStateAction<boolean>>
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>
  handleInputChange: React.ChangeEventHandler<HTMLInputElement>
  handleSubmit: (event?: React.FormEvent<HTMLFormElement>) => void
  deleteConversation: (id: string) => void
  updateConversationTitle: (id: string, title: string) => void
}

const ChatRouteContext = createContext<ChatRouteContextValue | null>(null)

function formatMeta(conversation: NonNullable<ChatRouteContextValue["conversation"]>) {
  return [
    conversation.fileSize,
    conversation.pages && `${conversation.pages} pages`,
    conversation.chunks && `${conversation.chunks} chunks`,
  ]
    .filter(Boolean)
    .join(" · ")
}

function ChatRouteProviderInner({
  children,
  conversationId,
  conversation,
  deleteConversation,
  updateConversationTitle,
  saveMessages,
}: {
  children: React.ReactNode
  conversationId: string
  conversation: NonNullable<ChatRouteContextValue["conversation"]>
  deleteConversation: ReturnType<typeof useConversations>["deleteConversation"]
  updateConversationTitle: ReturnType<typeof useConversations>["updateConversationTitle"]
  saveMessages: ReturnType<typeof useConversations>["saveMessages"]
}) {
  const hasExistingMessages = conversation.messages.length > 0
  const [isActive, setIsActive] = useState(hasExistingMessages)
  const [showDetails, setShowDetails] = useState(hasExistingMessages)
  const [showInfo, setShowInfo] = useState(true)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    initialMessages: conversation.messages,
  })

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      saveMessages(conversationId, messages)
    }
  }, [conversationId, isLoading, messages, saveMessages])

  return (
    <ChatRouteContext.Provider
      value={{
        conversationId,
        conversation,
        isLoaded: true,
        messages,
        input,
        isLoading,
        showInfo,
        showDetails,
        isActive,
        setShowInfo,
        setShowDetails,
        setIsActive,
        handleInputChange,
        handleSubmit,
        deleteConversation,
        updateConversationTitle,
      }}
    >
      {children}
    </ChatRouteContext.Provider>
  )
}

function ChatRouteProvider({ children }: { children: React.ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const {
    conversations,
    isLoaded,
    deleteConversation,
    updateConversationTitle,
    saveMessages,
  } = useConversations()
  const conversation = conversations.find((item) => item.id === id) ?? null

  if (!isLoaded || !conversation) {
    return (
      <ChatRouteContext.Provider
        value={{
          conversationId: id,
          conversation,
          isLoaded,
          messages: [],
          input: "",
          isLoading: false,
          showInfo: false,
          showDetails: false,
          isActive: false,
          setShowInfo: () => undefined,
          setShowDetails: () => undefined,
          setIsActive: () => undefined,
          handleInputChange: () => undefined,
          handleSubmit: () => undefined,
          deleteConversation: () => undefined,
          updateConversationTitle: () => undefined,
        }}
      >
        {children}
      </ChatRouteContext.Provider>
    )
  }

  return (
    <ChatRouteProviderInner
      key={conversation.id}
      conversationId={id}
      conversation={conversation}
      deleteConversation={deleteConversation}
      updateConversationTitle={updateConversationTitle}
      saveMessages={saveMessages}
    >
      {children}
    </ChatRouteProviderInner>
  )
}

export function useChatRoute() {
  const context = useContext(ChatRouteContext)
  if (!context) {
    throw new Error("useChatRoute must be used within ChatRouteFrame")
  }

  return context
}

function ChatRouteShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const {
    conversation,
    conversationId,
    isLoaded,
    input,
    isLoading,
    showInfo,
    showDetails,
    deleteConversation,
    updateConversationTitle,
    setShowInfo,
    handleInputChange,
    handleSubmit,
  } = useChatRoute()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [draftTitle, setDraftTitle] = useState(conversation?.title ?? "")

  const shouldShowComposer = isLoaded && Boolean(conversation) && !showDetails
  const shouldShowInfoPanel = showInfo && Boolean(conversation?.summary)

  function handleDeleteConversation() {
    deleteConversation(conversationId)
    setDeleteDialogOpen(false)
    router.push("/app")
  }

  function handleSaveTitle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateConversationTitle(conversationId, draftTitle)
    setEditDialogOpen(false)
  }

  return (
    <>
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
          <div className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-3 shrink-0">
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold">
                {conversation ? conversation.title : "Chat"}
              </h2>
            </div>
              <div className="flex items-center gap-1">
                {conversation?.summary && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowInfo((value) => !value)}
                    title={showInfo ? "Hide document info" : "Show document info"}
                    aria-label={showInfo ? "Hide document info" : "Show document info"}
                  >
                    {showInfo ? (
                      <PanelRightCloseIcon className="size-4" />
                    ) : (
                      <PanelRightIcon className="size-4" />
                    )}
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Conversation actions"
                      aria-label="Conversation actions"
                    >
                      <EllipsisVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => {
                        setDraftTitle(conversation?.title ?? "")
                        setEditDialogOpen(true)
                      }}
                    >
                      <PencilLineIcon className="size-4" />
                      Edit title
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2Icon className="size-4" />
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
              <div className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden">
                {children}
              </div>

              {shouldShowInfoPanel && conversation && (
                <aside className="flex w-72 shrink-0 flex-col border-l border-border">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Document
                    </span>
                    <button
                      onClick={() => setShowInfo(false)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      title="Close"
                      aria-label="Close document info"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>

                  <ScrollArea className="flex-1 min-h-0">
                    <div className="flex flex-col gap-4 p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-md bg-muted p-1.5 shrink-0">
                          <FileTextIcon className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{conversation.docName}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                            {formatMeta(conversation)}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-col gap-2">
                        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          AI Summary
                        </p>
                        <p className="text-sm leading-relaxed text-foreground">
                          {conversation.summary}
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </aside>
              )}
            </div>

            {shouldShowComposer && (
              <div className="border-t border-border px-6 py-4 shrink-0">
                <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Ask a question…"
                    aria-label="Ask a question about your document"
                    autoComplete="off"
                    className="flex-1"
                    name="prompt"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    aria-label="Send message"
                  >
                    <SendIcon />
                  </Button>
                </form>
                <p className="mx-auto mt-2 max-w-3xl text-[11px] text-muted-foreground">
                  Markdown supported: tables, lists, code
                </p>
              </div>
            )}
          </div>
        </div>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove
              {conversation ? ` "${conversation.title}"` : " this conversation"}
              {" "}from your local history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConversation}>
              Delete conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </div>
    </AlertDialog>
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit conversation title</DialogTitle>
            <DialogDescription>
              Update the title shown in the chat header and sidebar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveTitle} className="flex flex-col gap-4">
            <Input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Enter a conversation title"
              aria-label="Conversation title"
              autoFocus
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDraftTitle(conversation?.title ?? "")
                  setEditDialogOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!draftTitle.trim()}>
                Save title
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ChatRouteFrame({ children }: { children: React.ReactNode }) {
  return (
    <ChatRouteProvider>
      <ChatRouteShell>{children}</ChatRouteShell>
    </ChatRouteProvider>
  )
}

export function ChatMessagesView() {
  const { messages, isLoading } = useChatRoute()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [isLoading, messages])

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-4">
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
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.role === "user"
                ? "rounded-br-sm bg-primary text-primary-foreground"
                : "rounded-bl-sm bg-muted text-foreground"
                }`}
            >
              <MarkdownContent
                content={message.content}
                enableLinkPreviews
                className={message.role === "user" ? "[&_code]:bg-primary-foreground/15 [&_pre]:border-primary-foreground/20 [&_pre]:bg-primary-foreground/10 [&_table]:min-w-[20rem] [&_thead]:bg-primary-foreground/10" : ""}
              />
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <ThinkingBubble />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
