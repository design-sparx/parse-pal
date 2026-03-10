import { MessagesSquareIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type LogoProps = {
  showIcon?: boolean
  showTitle?: boolean
  className?: string
  iconClassName?: string
  titleClassName?: string
}

export function Logo({
  showIcon = true,
  showTitle = true,
  className,
  iconClassName,
  titleClassName,
}: LogoProps) {
  if (!showIcon && !showTitle) {
    return null
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {showIcon ? (
        <MessagesSquareIcon
          className={cn("size-4 shrink-0", iconClassName)}
          aria-hidden="true"
        />
      ) : null}
      {showTitle ? (
        <span
          className={cn(
            "text-sm font-semibold uppercase tracking-[0.18em]",
            titleClassName
          )}
        >
          ParsePal
        </span>
      ) : null}
    </span>
  )
}
