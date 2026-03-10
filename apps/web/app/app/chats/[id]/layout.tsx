import { ChatRouteFrame } from "@/app/components/ChatRouteFrame"

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <ChatRouteFrame>{children}</ChatRouteFrame>
}
