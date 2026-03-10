import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"

export type ChangelogEntry = {
  title: string
  slug: string
  publishedAt: string | null
  body: string
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function parseReleaseHeading(heading: string) {
  const title = heading.trim()
  const dateMatch = title.match(/\((\d{4}-\d{2}-\d{2})\)\s*$/)
  const publishedAt = dateMatch?.[1] ?? null
  const cleanTitle = title
    .replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*$/, "")
    .replace(/^\[([^\]]+)\]\([^)]+\)$/, "$1")
    .trim()

  return {
    title: cleanTitle,
    publishedAt,
    slug: slugify(cleanTitle),
  }
}

export function parseChangelog(markdown: string): ChangelogEntry[] {
  const normalized = markdown.replace(/\r\n/g, "\n")
  const sections = normalized
    .split(/^##\s+/m)
    .map((section) => section.trim())
    .filter(Boolean)

  return sections
    .map((section) => {
      const [heading, ...bodyLines] = section.split("\n")

      if (!heading || heading.startsWith("# Changelog")) {
        return null
      }

      const meta = parseReleaseHeading(heading)

      return {
        ...meta,
        body: bodyLines.join("\n").trim(),
      }
    })
    .filter((entry): entry is ChangelogEntry => Boolean(entry))
}

async function readChangelogFile() {
  const filePath = path.join(process.cwd(), "..", "..", "CHANGELOG.md")
  return readFile(filePath, "utf8")
}

export async function getChangelogEntries() {
  try {
    const markdown = await readChangelogFile()
    return {
      entries: parseChangelog(markdown),
      hasError: false,
    }
  } catch {
    return {
      entries: [] as ChangelogEntry[],
      hasError: true,
    }
  }
}
