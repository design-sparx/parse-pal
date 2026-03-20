type Props = {
  className?: string
}

export function AiMistakesNotice({ className }: Props) {
  return (
    <p className={className ?? "text-xs text-muted-foreground"}>
      AI can make mistakes. Verify important details.
    </p>
  )
}
