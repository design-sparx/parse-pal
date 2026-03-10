"use client"

import { PublicNav } from "@/app/components/PublicNav"

type Props = {
  children: React.ReactNode
}

export function EmptyAppView({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <header className="shrink-0 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full container items-center justify-between px-5 py-4 sm:px-6">
          <PublicNav />
        </div>
      </header>
      <div className="flex min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  )
}
