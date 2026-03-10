import Link from "next/link"
import { ArrowUpRightIcon, GithubIcon } from "lucide-react"
import {
  publicActionButtonBaseClassName,
  publicActionSizeClassName,
  publicPrimaryActionClassName,
  publicSecondaryActionClassName,
  publicTagClassName,
} from "@/app/components/public-capsules"
import { Button } from "@/components/ui/button"

const principles = [
  "Learn in public through a working product, not isolated experiments",
  "Keep the stack understandable enough to modify without ceremony",
  "Ship UI changes that feel intentional, not generic demo polish",
]

export default function AboutPage() {
  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)] lg:items-start">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Open Source Document Chat
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              ParsePal turns PDF exploration into a small, inspectable learning
              system.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-foreground/80 sm:text-lg">
              Upload a document, generate embeddings locally, get an AI summary, and
              keep chatting against the retrieved context. The project is intentionally
              open so the product, prompts, and tradeoffs are easy to study.
            </p>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-border/70 bg-muted/35 p-6 sm:p-7">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Source
          </p>
          <div className="mt-4 space-y-4">
            <p className="text-sm leading-7 text-foreground/80">
              Clone the repo, inspect the RAG pipeline, or follow releases as the
              product changes in public.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className={`${publicActionButtonBaseClassName} ${publicPrimaryActionClassName} ${publicActionSizeClassName}`}
              >
                <Link href="/app">
                  Open App
                  <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={`${publicActionButtonBaseClassName} ${publicSecondaryActionClassName} ${publicActionSizeClassName}`}
              >
                <a
                  href="https://github.com/design-sparx/parse-pal"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GithubIcon className="size-4" aria-hidden="true" />
                  View on GitHub
                  <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-10 border-t border-border/70 pt-10 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            What It Does
          </p>
          <p className="text-sm leading-8 text-foreground/85 sm:text-base">
            ParsePal is a focused interface for chatting with a single PDF at a time.
            The current flow ingests a document, stores embeddings in ChromaDB,
            generates a concise AI summary, and keeps conversation history in the app
            so each upload becomes an inspectable thread.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className={publicTagClassName}>
              Next.js 16
            </span>
            <span className={publicTagClassName}>
              React 19
            </span>
            <span className={publicTagClassName}>
              ChromaDB
            </span>
            <span className={publicTagClassName}>
              Groq + Vercel AI SDK
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Why It Exists
          </p>
          <p className="text-sm leading-8 text-foreground/85 sm:text-base">
            This project is for learning in public. That includes RAG plumbing,
            release discipline, layout decisions, and the less glamorous work of making
            a small tool feel coherent across empty, active, and public-facing states.
          </p>
        </div>
      </section>

      <section className="grid gap-8 border-t border-border/70 pt-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Learning Principles
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Build with enough structure to learn from every release.
          </h2>
        </div>
        <div className="space-y-4">
          {principles.map((principle) => (
            <div
              key={principle}
              className="rounded-[1.5rem] border border-border/70 bg-background p-5"
            >
              <p className="text-sm leading-7 text-foreground/85">{principle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 border-t border-border/70 pt-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
            Follow The Work
          </p>
          <p className="max-w-2xl text-sm leading-8 text-foreground/85 sm:text-base">
            The easiest way to track progress is through the repository and the release
            notes. The changelogs page in this app mirrors that release history so the
            product can explain itself without leaving the interface.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className={`${publicActionButtonBaseClassName} ${publicSecondaryActionClassName} ${publicActionSizeClassName}`}
        >
          <Link href="/changelogs">
            Read changelogs
            <ArrowUpRightIcon className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </>
  )
}
