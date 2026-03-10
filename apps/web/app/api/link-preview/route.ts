import { NextRequest, NextResponse } from "next/server"

const REQUEST_TIMEOUT_MS = 5000

type PreviewPayload = {
  url: string
  title: string
  description: string
  siteName: string
  image: string | null
}

function isBlockedHostname(hostname: string) {
  const normalized = hostname.toLowerCase()

  if (normalized === "localhost" || normalized === "::1" || normalized.endsWith(".local")) {
    return true
  }

  if (
    normalized.startsWith("127.") ||
    normalized.startsWith("10.") ||
    normalized.startsWith("192.168.")
  ) {
    return true
  }

  const private172 = normalized.match(/^172\.(\d{1,3})\./)
  if (private172) {
    const secondOctet = Number(private172[1])
    if (secondOctet >= 16 && secondOctet <= 31) return true
  }

  return false
}

function extractMetaTag(html: string, key: string, attribute: "property" | "name") {
  const pattern = new RegExp(
    `<meta[^>]+${attribute}=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  )

  return html.match(pattern)?.[1]?.trim() ?? ""
}

function extractTitle(html: string) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? ""
}

function toAbsoluteUrl(value: string, baseUrl: URL) {
  if (!value) return ""

  try {
    return new URL(value, baseUrl).toString()
  } catch {
    return ""
  }
}

function buildPreviewPayload(url: URL, html: string): PreviewPayload | null {
  const title = extractMetaTag(html, "og:title", "property") || extractTitle(html)
  const description =
    extractMetaTag(html, "og:description", "property") ||
    extractMetaTag(html, "description", "name")
  const siteName = extractMetaTag(html, "og:site_name", "property") || url.hostname
  const image = toAbsoluteUrl(extractMetaTag(html, "og:image", "property"), url) || null

  if (!title && !description) return null

  return {
    url: url.toString(),
    title: title || url.hostname,
    description,
    siteName,
    image,
  }
}

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url")

  if (!target) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  let url: URL

  try {
    url = new URL(target)
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 })
  }

  if (!["http:", "https:"].includes(url.protocol) || isBlockedHostname(url.hostname)) {
    return NextResponse.json({ error: "Unsupported url" }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "ParsePal Link Preview Bot/1.0",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Preview unavailable" }, { status: 502 })
    }

    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.includes("text/html")) {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 415 })
    }

    const html = (await response.text()).slice(0, 200_000)
    const payload = buildPreviewPayload(url, html)

    if (!payload) {
      return NextResponse.json({ error: "Preview unavailable" }, { status: 404 })
    }

    return NextResponse.json(payload)
  } catch {
    return NextResponse.json({ error: "Preview unavailable" }, { status: 502 })
  }
}
