"use client"

type Props = {
  children: React.ReactNode
}

export function EmptyAppView({ children }: Props) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-5 py-4 sm:px-6">
        <span className="text-sm font-semibold text-foreground/90">ParsePal</span>
      </div>
      <div className="flex min-h-0 min-w-0 flex-1">{children}</div>
    </div>
  )
}
