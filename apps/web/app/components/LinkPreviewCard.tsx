"use client"

import { useEffect, useState } from "react"

type LinkPreviewData = {
  url: string
  title: string
  description: string
  siteName: string
  image: string | null
}

type Props = {
  href: string
}

const previewCache = new Map<string, LinkPreviewData | null>()

function getHostname(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "")
  } catch {
    return value
  }
}

function isPreviewEligible(href: string) {
  try {
    const url = new URL(href)
    if (!["http:", "https:"].includes(url.protocol)) return false
    if (url.hostname === "localhost" || url.hostname.startsWith("127.")) return false
    return true
  } catch {
    return false
  }
}

export function LinkPreviewCard({ href }: Props) {
  const isEligible = isPreviewEligible(href)
  const cachedPreview = previewCache.get(href)
  const [preview, setPreview] = useState<LinkPreviewData | null>(null)
  const [hasFailed, setHasFailed] = useState(false)
  const resolvedPreview = cachedPreview === undefined ? preview : cachedPreview
  const resolvedFailure = cachedPreview === null || (cachedPreview === undefined && hasFailed)

  useEffect(() => {
    if (!isEligible) {
      return
    }

    if (cachedPreview !== undefined) {
      return
    }

    const controller = new AbortController()

    async function loadPreview() {
      try {
        setHasFailed(false)
        const params = new URLSearchParams({ url: href })
        const response = await fetch(`/api/link-preview?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          previewCache.set(href, null)
          setHasFailed(true)
          return
        }

        const data = (await response.json()) as LinkPreviewData
        previewCache.set(href, data)
        setPreview(data)
      } catch {
        if (!controller.signal.aborted) {
          previewCache.set(href, null)
          setHasFailed(true)
        }
      }
    }

    void loadPreview()

    return () => controller.abort()
  }, [cachedPreview, href, isEligible])

  if (!isEligible || resolvedFailure || !resolvedPreview) return null

  return (
    <a
      href={resolvedPreview.url}
      target="_blank"
      rel="noreferrer noopener"
      className="mt-2 flex overflow-hidden rounded-xl border border-border/70 bg-background/50 transition-colors hover:bg-background/70"
    >
      <div className="min-w-0 flex-1 p-3">
        <p className="truncate text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {resolvedPreview.siteName || getHostname(resolvedPreview.url)}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">
          {resolvedPreview.title}
        </p>
        {resolvedPreview.description && (
          <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">
            {resolvedPreview.description}
          </p>
        )}
      </div>
      {resolvedPreview.image && (
        <div className="hidden w-24 shrink-0 border-l border-border/60 sm:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedPreview.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
    </a>
  )
}
