"use client"

import type { ComponentProps } from "react"
import { useEffect, useState } from "react"
import { MoonStarIcon, SunMediumIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  THEME_EVENT_NAME,
  THEME_STORAGE_KEY,
  applyTheme,
  getSystemTheme,
  readStoredTheme,
  resolveCurrentTheme,
  setTheme as setDocumentTheme,
  type Theme,
} from "@/lib/theme"

type Props = {
  className?: string
  variant?: ComponentProps<typeof Button>["variant"]
  size?: ComponentProps<typeof Button>["size"]
}

export function ThemeToggleButton({
  className,
  variant = "ghost",
  size = "icon",
}: Props) {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)")

    const syncTheme = () => {
      const nextTheme = resolveCurrentTheme(window.localStorage, mediaQueryList)
      applyTheme(nextTheme)
      setTheme(nextTheme)
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== THEME_STORAGE_KEY) return
      syncTheme()
    }

    const handleThemeChange = (event: Event) => {
      setTheme((event as CustomEvent<Theme>).detail)
    }

    const handleSystemThemeChange = () => {
      if (readStoredTheme(window.localStorage)) return
      const nextTheme = getSystemTheme(mediaQueryList)
      applyTheme(nextTheme)
      setTheme(nextTheme)
    }

    syncTheme()
    mediaQueryList.addEventListener("change", handleSystemThemeChange)
    window.addEventListener("storage", handleStorage)
    window.addEventListener(THEME_EVENT_NAME, handleThemeChange)

    return () => {
      mediaQueryList.removeEventListener("change", handleSystemThemeChange)
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener(THEME_EVENT_NAME, handleThemeChange)
    }
  }, [])

  const nextTheme = theme === "dark" ? "light" : "dark"
  const label = nextTheme === "dark" ? "Switch to dark mode" : "Switch to light mode"

  function handleToggle() {
    setDocumentTheme(nextTheme)
    setTheme(nextTheme)
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleToggle}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? (
        <SunMediumIcon className="size-4" aria-hidden="true" />
      ) : (
        <MoonStarIcon className="size-4" aria-hidden="true" />
      )}
    </Button>
  )
}
