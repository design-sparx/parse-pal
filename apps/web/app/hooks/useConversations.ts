"use client"

import { useState, useEffect, useCallback } from "react"
import type { Message } from "ai"

export type Conversation = {
  id: string
  title: string
  docName: string
  fileSize?: string
  pages?: number
  chunks?: number
  summary?: string
  createdAt: number
  messages: Message[]
}

const STORAGE_KEY = "parse-pal-conversations"

function load(): Conversation[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Conversation[]) : []
  } catch {
    return []
  }
}

function save(conversations: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const stored = load()
    setConversations(stored)
    if (stored.length > 0) setActiveId(stored[0].id)
  }, [])

  const active = conversations.find((c) => c.id === activeId) ?? null

  const createConversation = useCallback(
    (
      docName: string,
      meta?: { fileSize: string; pages: number; chunks: number; summary: string }
    ): string => {
      const id = crypto.randomUUID()
      const conv: Conversation = {
        id,
        title: docName,
        docName,
        ...meta,
        createdAt: Date.now(),
        messages: [],
      }
      setConversations((prev) => {
        const next = [conv, ...prev]
        save(next)
        return next
      })
      setActiveId(id)
      return id
    },
    []
  )

  const saveMessages = useCallback((id: string, messages: Message[]) => {
    setConversations((prev) => {
      const next = prev.map((c) => {
        if (c.id !== id) return c
        const firstUserMsg = messages.find((m) => m.role === "user")
        const title = firstUserMsg
          ? firstUserMsg.content.slice(0, 40)
          : c.docName
        return { ...c, messages, title }
      })
      save(next)
      return next
    })
  }, [])

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id)
        save(next)
        return next
      })
      setActiveId((prev) => {
        if (prev !== id) return prev
        const remaining = conversations.filter((c) => c.id !== id)
        return remaining.length > 0 ? remaining[0].id : null
      })
    },
    [conversations]
  )

  return {
    conversations,
    activeId,
    active,
    createConversation,
    saveMessages,
    deleteConversation,
    setActiveId,
  }
}
