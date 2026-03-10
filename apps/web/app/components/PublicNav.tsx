"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GithubIcon } from "lucide-react"
import { Logo } from "@/components/Logo"
import {
  publicActionButtonBaseClassName,
  publicActionSizeClassName,
  publicCompactActionSizeClassName,
  publicPrimaryActionClassName,
  publicSecondaryActionClassName,
} from "@/app/components/public-capsules"
import { Button } from "@/components/ui/button"

type Props = {
  compact?: boolean
}

const links = [
  { href: "/about", label: "About" },
  { href: "/changelogs", label: "Changelogs" },
]

export function PublicNav({ compact = false }: Props) {
  const pathname = usePathname()
  const isAppRoute = pathname.startsWith("/app")

  return (
    <div
      className={
        compact
          ? "container mx-auto flex w-full items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          : "container mx-auto flex w-full flex-wrap items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground"
      }
    >
      <div className="flex items-center gap-4">
        <Link
          href="/about"
          className="text-foreground transition-colors hover:text-foreground/70"
          aria-label="ParsePal"
        >
          <Logo />
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {!isAppRoute && (
          <Button
            asChild
            size={compact ? "sm" : "default"}
            className={
              `${publicActionButtonBaseClassName} ${publicPrimaryActionClassName} ${compact ? publicCompactActionSizeClassName : publicActionSizeClassName}`
            }
          >
            <Link href="/app">Open App</Link>
          </Button>
        )}
        <Button
          asChild
          variant="outline"
          size={compact ? "sm" : "default"}
          className={
            `${publicActionButtonBaseClassName} ${publicSecondaryActionClassName} ${compact ? publicCompactActionSizeClassName : publicActionSizeClassName}`
          }
        >
          <a
            href="https://github.com/design-sparx/parse-pal"
            target="_blank"
            rel="noreferrer"
          >
            <GithubIcon className="size-3.5" aria-hidden="true" />
            Star / Clone
          </a>
        </Button>
      </div>
    </div>
  )
}
