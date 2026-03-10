"use client"

export function ThinkingBubble() {
  return (
    <div
      aria-live="polite"
      aria-label="Assistant is thinking"
      className="relative overflow-hidden rounded-2xl rounded-bl-sm border border-border/70 bg-muted px-4 py-3 text-foreground"
    >
      <div className="pointer-events-none absolute inset-0 thinking-bubble-shimmer" />
      <div className="relative flex items-center gap-3">
        <div className="flex items-end gap-1">
          <span className="thinking-bubble-dot animation-delay-0" />
          <span className="thinking-bubble-dot animation-delay-150" />
          <span className="thinking-bubble-dot animation-delay-300" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Thinking</span>
          <span className="text-[11px] text-muted-foreground">
            Drafting your response
          </span>
        </div>
      </div>
    </div>
  )
}
