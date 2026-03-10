"use client"

import type { ComponentPropsWithoutRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { LinkPreviewCard } from "@/app/components/LinkPreviewCard"
import { cn } from "@/lib/utils"

type Props = {
  content: string
  className?: string
  enableLinkPreviews?: boolean
}

function MarkdownLink({
  className,
  enablePreview,
  ...props
}: ComponentPropsWithoutRef<"a"> & {
  enablePreview?: boolean
}) {
  const href = typeof props.href === "string" ? props.href : ""

  return (
    <span className="inline-flex max-w-full flex-col align-top">
      <a
        {...props}
        target="_blank"
        rel="noreferrer noopener"
        className={cn("font-medium underline underline-offset-4 hover:opacity-80", className)}
      />
      {enablePreview && href ? <LinkPreviewCard href={href} /> : null}
    </span>
  )
}

export function MarkdownContent({
  content,
  className,
  enableLinkPreviews = false,
}: Props) {
  return (
    <div
      className={cn(
        "max-w-none text-sm leading-7 text-inherit",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
        "[&_code]:rounded [&_code]:bg-background/70 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]",
        "[&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold",
        "[&_li]:ml-4 [&_li]:pl-1",
        "[&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5",
        "[&_p]:text-inherit",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-border/70 [&_pre]:bg-background/80 [&_pre]:p-3",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_table]:w-full [&_table]:min-w-[28rem] [&_table]:border-collapse [&_table]:text-left",
        "[&_tbody_tr:not(:last-child)]:border-b [&_tbody_tr:not(:last-child)]:border-border/50",
        "[&_td]:border-border/50 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top",
        "[&_th]:border-b [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold",
        "[&_thead]:bg-background/60",
        "[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5",
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ol:not(:first-child)]:mt-3 [&_p:not(:first-child)]:mt-3 [&_pre:not(:first-child)]:mt-3 [&_table:not(:first-child)]:mt-3 [&_ul:not(:first-child)]:mt-3",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => <MarkdownLink {...props} enablePreview={enableLinkPreviews} />,
          table: ({ className: tableClassName, ...props }) => (
            <div className="overflow-x-auto rounded-lg border border-border/70">
              <table {...props} className={cn(tableClassName)} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
