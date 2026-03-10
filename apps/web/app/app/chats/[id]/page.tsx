"use client"

import { ChatConversationView } from "@/app/components/ChatConversationView"
import { ChatMessagesView, useChatRoute } from "@/app/components/ChatRouteFrame"

export default function AppChatPage() {
  const { showDetails } = useChatRoute()

  return (
    <>
      <ChatConversationView />
      {!showDetails && <ChatMessagesView />}
    </>
  )
}
