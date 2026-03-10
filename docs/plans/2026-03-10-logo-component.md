# Logo Component Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a shared `Logo` component for ParsePal with optional icon/title rendering and replace current brand-mark occurrences in the web app.

**Architecture:** Add one lightweight shared component in the web app component layer that composes a Lucide icon with the ParsePal wordmark. Wire that component into the public nav and app sidebar only, leaving functional icons untouched and keeping the implementation server-safe.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, `lucide-react`, `next/font`

---

### Task 1: Confirm current brand usage and choose the shared component location

**Files:**
- Read: `apps/web/app/components/PublicNav.tsx`
- Read: `apps/web/app/components/Sidebar.tsx`
- Create: `apps/web/components/Logo.tsx`

**Step 1: Read the current brand consumers**

Run: `Get-Content apps\web\app\components\PublicNav.tsx`
Expected: existing inline `ParsePal` brand text in the public navigation.

**Step 2: Read the app-shell brand consumer**

Run: `Get-Content apps\web\app\components\Sidebar.tsx`
Expected: existing inline `ParsePal` brand text in the sidebar header.

**Step 3: Create the shared component file**

Implement `apps/web/components/Logo.tsx` with this minimal structure:

```tsx
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
  if (!showIcon && !showTitle) return null

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {showIcon ? <MessagesSquareIcon className={cn("size-4 shrink-0", iconClassName)} /> : null}
      {showTitle ? (
        <span className={cn("text-sm font-semibold uppercase tracking-[0.18em]", titleClassName)}>
          ParsePal
        </span>
      ) : null}
    </span>
  )
}
```

**Step 4: Review for unnecessary client/runtime work**

Check:
- no `"use client"`
- no hooks
- no effects
- direct `lucide-react` import

Expected: component stays server-safe and presentational.

**Step 5: Commit**

```bash
git add apps/web/components/Logo.tsx
git commit -m "feat(web): add shared logo component"
```

### Task 2: Replace public-nav brand markup with the shared logo

**Files:**
- Modify: `apps/web/app/components/PublicNav.tsx`
- Read: `apps/web/components/Logo.tsx`

**Step 1: Write the failing expectation manually**

Expected after change:
- the nav no longer hardcodes `ParsePal` text
- brand markup comes from `Logo`

**Step 2: Update imports**

Add:

```tsx
import { Logo } from "@/components/Logo"
```

Remove any brand-specific inline title markup that becomes redundant.

**Step 3: Replace the inline brand text**

Change the nav brand link to:

```tsx
<Link href="/about" className="text-foreground transition-colors hover:text-foreground/70">
  <Logo />
</Link>
```

If spacing needs to stay tighter, pass class overrides instead of duplicating title markup.

**Step 4: Verify the nav still matches the approved typography**

Check:
- icon and title align horizontally
- title remains in the current uppercase tracked style
- icon inherits current text color

**Step 5: Commit**

```bash
git add apps/web/app/components/PublicNav.tsx apps/web/components/Logo.tsx
git commit -m "feat(web): use shared logo in public nav"
```

### Task 3: Replace sidebar brand markup with the shared logo

**Files:**
- Modify: `apps/web/app/components/Sidebar.tsx`
- Read: `apps/web/components/Logo.tsx`

**Step 1: Identify the current sidebar header brand**

Expected: a plain text `ParsePal` span in the sidebar header.

**Step 2: Import the shared logo**

Add:

```tsx
import { Logo } from "@/components/Logo"
```

**Step 3: Replace the header brand markup**

Use:

```tsx
<Logo className="text-sidebar-foreground" />
```

If needed, keep sidebar-specific text color through the wrapper or `titleClassName`.

**Step 4: Recheck interactive controls nearby**

Verify the sidebar collapse button still has:
- `title="Collapse sidebar"`
- `aria-label="Collapse sidebar"`

Expected: the brand refactor does not regress the previous accessibility fix.

**Step 5: Commit**

```bash
git add apps/web/app/components/Sidebar.tsx apps/web/components/Logo.tsx
git commit -m "feat(web): use shared logo in sidebar"
```

### Task 4: Verify compact rendering behavior

**Files:**
- Modify if needed: `apps/web/components/Logo.tsx`

**Step 1: Exercise icon-only mode**

Render locally with:

```tsx
<Logo showTitle={false} />
```

Expected: only the Lucide mark renders with no empty title wrapper.

**Step 2: Exercise title-only mode**

Render locally with:

```tsx
<Logo showIcon={false} />
```

Expected: only the wordmark renders with no empty icon wrapper.

**Step 3: Exercise the all-hidden guard**

Render locally with:

```tsx
<Logo showIcon={false} showTitle={false} />
```

Expected: component returns `null`.

**Step 4: Adjust implementation only if a wrapper or spacing bug appears**

Keep the final code minimal. Do not add state, effects, or memoization.

**Step 5: Commit**

```bash
git add apps/web/components/Logo.tsx
git commit -m "refactor(web): finalize logo display variants"
```

### Task 5: Run verification

**Files:**
- Verify: `apps/web/components/Logo.tsx`
- Verify: `apps/web/app/components/PublicNav.tsx`
- Verify: `apps/web/app/components/Sidebar.tsx`

**Step 1: Run lint**

Run: `pnpm --filter @parse-pal/web lint`
Expected: no new lint failures from the logo work. Pre-existing failures may still appear and should be called out explicitly.

**Step 2: Run the web app for manual verification**

Run: `pnpm --filter @parse-pal/web dev`
Expected: local Next.js dev server starts.

**Step 3: Manually verify brand locations**

Check:
- public nav shows icon + `ParsePal`
- sidebar shows icon + `ParsePal`
- no file/chat/function icons changed unexpectedly

**Step 4: Record any residual issues**

Call out:
- any pre-existing lint errors unrelated to the logo work
- any spacing regressions in compact widths

**Step 5: Commit**

```bash
git add apps/web/components/Logo.tsx apps/web/app/components/PublicNav.tsx apps/web/app/components/Sidebar.tsx
git commit -m "feat(web): rollout shared logo branding"
```
