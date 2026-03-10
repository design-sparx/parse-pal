# App Route Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the interactive workspace from `/new` and `/chats/[id]` to canonical `/app` routes, keep public pages at top level, and add redirects from legacy workspace URLs.

**Architecture:** Create a dedicated workspace route subtree under `apps/web/app/app`, move the existing client chat shell and pages into that subtree, and keep compatibility through server-side redirect routes for `/new` and `/chats/[id]`. Public pages remain under the existing `(public)` route group and point their CTAs to `/app`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, client-side router navigation, localStorage-backed conversation state

---

### Task 1: Add the new `/app` workspace route structure

**Files:**
- Create: `apps/web/app/app/layout.tsx`
- Create: `apps/web/app/app/page.tsx`
- Create: `apps/web/app/app/chats/[id]/page.tsx`
- Modify: `apps/web/app/(chat)/layout.tsx`
- Modify: `apps/web/app/(chat)/new/page.tsx`
- Modify: `apps/web/app/(chat)/chats/[id]/page.tsx`

**Step 1: Write the failing test**

Use the current route map as the red state:

- `/app` does not exist
- `/app/chats/[id]` does not exist
- the workspace still depends on `/new` and `/chats/[id]`

**Step 2: Verify the red state**

Run: `pnpm --filter @parse-pal/web dev`
Expected:

- `/app` is missing before implementation
- `/new` remains the current workspace entry route

**Step 3: Write minimal implementation**

Create route files so the workspace resolves to:

- `apps/web/app/app/layout.tsx`
- `apps/web/app/app/page.tsx`
- `apps/web/app/app/chats/[id]/page.tsx`

Move or adapt the current logic from:

- `apps/web/app/(chat)/layout.tsx`
- `apps/web/app/(chat)/new/page.tsx`
- `apps/web/app/(chat)/chats/[id]/page.tsx`

Implementation requirements:

- `app/page.tsx` under the new subtree should behave like the old `/new` screen
- `app/chats/[id]/page.tsx` should behave like the old chat detail route
- the workspace layout should use `/app` and `/app/chats/[id]` in pathname logic and router pushes

If extracting shared client components from the old route files reduces duplication, do that instead of keeping two parallel implementations.

**Step 4: Run validation**

Run: `pnpm exec eslint "app/app/layout.tsx" "app/app/page.tsx" "app/app/chats/[id]/page.tsx"`
Working directory: `apps/web`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/app/app/layout.tsx apps/web/app/app/page.tsx apps/web/app/app/chats/[id]/page.tsx apps/web/app/(chat)/layout.tsx apps/web/app/(chat)/new/page.tsx apps/web/app/(chat)/chats/[id]/page.tsx
git commit -m "refactor(web): move workspace under app routes"
```

### Task 2: Add redirects from legacy routes

**Files:**
- Modify: `apps/web/app/page.tsx`
- Create: `apps/web/app/new/page.tsx`
- Create: `apps/web/app/chats/[id]/page.tsx`

**Step 1: Write the failing test**

Use the current root and legacy-route behavior as the red state:

- `/` redirects to `/new` instead of `/about`
- `/new` is a concrete page instead of a redirect
- `/chats/[id]` is a concrete page instead of a redirect

**Step 2: Verify the red state**

Run: `pnpm --filter @parse-pal/web dev`
Expected:

- `/` lands on `/new`
- `/new` renders the workspace directly

**Step 3: Write minimal implementation**

Update:

- `apps/web/app/page.tsx` to redirect to `/about`
- `apps/web/app/new/page.tsx` to redirect to `/app`
- `apps/web/app/chats/[id]/page.tsx` to redirect to `/app/chats/[id]`

Use App Router server-side redirects with `redirect()` from `next/navigation`.

**Step 4: Run validation**

Run: `pnpm exec eslint app/page.tsx app/new/page.tsx "app/chats/[id]/page.tsx"`
Working directory: `apps/web`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/app/page.tsx apps/web/app/new/page.tsx apps/web/app/chats/[id]/page.tsx
git commit -m "refactor(web): redirect legacy workspace routes"
```

### Task 3: Update workspace navigation to use `/app`

**Files:**
- Modify: `apps/web/app/components/Sidebar.tsx`
- Modify: `apps/web/app/app/layout.tsx`
- Modify: `apps/web/app/app/page.tsx`
- Modify: `apps/web/app/app/chats/[id]/page.tsx`

**Step 1: Write the failing test**

Use the current route assumptions as the red state:

- sidebar actions still push to `/new` or `/chats/[id]`
- workspace empty-state logic still checks `/new`
- conversation creation still routes to `/chats/[id]`

**Step 2: Verify the red state**

Run: `rg -n '"/new"|`/new`|"/chats/|`/chats/' apps/web/app -S`
Expected: existing workspace files still reference legacy route targets

**Step 3: Write minimal implementation**

Update routing targets so:

- upload/new-chat action routes to `/app`
- conversation selection routes to `/app/chats/[id]`
- post-ingest conversation creation routes to `/app/chats/[id]`
- pathname parsing in the workspace layout matches `/app/chats/[id]`
- empty-state route detection matches `/app`

Keep route helpers simple and localized unless duplication becomes large enough to justify extracting a shared route helper.

**Step 4: Run validation**

Run: `pnpm exec eslint app/components/Sidebar.tsx "app/app/layout.tsx" "app/app/page.tsx" "app/app/chats/[id]/page.tsx"`
Working directory: `apps/web`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/app/components/Sidebar.tsx apps/web/app/app/layout.tsx apps/web/app/app/page.tsx apps/web/app/app/chats/[id]/page.tsx
git commit -m "refactor(web): update workspace navigation to app routes"
```

### Task 4: Add public-page CTA links to the workspace

**Files:**
- Modify: `apps/web/app/(public)/about/page.tsx`
- Modify: `apps/web/app/(public)/changelogs/page.tsx`
- Optionally modify: `apps/web/app/components/PublicNav.tsx`

**Step 1: Write the failing test**

Use the current public pages as the red state:

- they do not provide a clear CTA into `/app`

**Step 2: Verify the red state**

Run: `pnpm --filter @parse-pal/web dev`
Expected:

- `/about` and `/changelogs` lack a primary route into the workspace

**Step 3: Write minimal implementation**

Add a clear CTA pointing to `/app` on both public pages.

Recommended copy:

- `Open App`
- `Launch App`

Keep the CTA visually present but secondary to page content. Do not turn the public header into a marketing navbar with multiple competing primary buttons.

**Step 4: Run validation**

Run: `pnpm exec eslint "app/(public)/about/page.tsx" "app/(public)/changelogs/page.tsx"`
Working directory: `apps/web`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/app/(public)/about/page.tsx apps/web/app/(public)/changelogs/page.tsx apps/web/app/components/PublicNav.tsx
git commit -m "feat(web): add app entry ctas to public pages"
```

### Task 5: Update documentation and route references

**Files:**
- Modify: `README.md`

**Step 1: Write the failing test**

Use documentation drift as the red state:

- README still documents `/new` and `/chats/:id` as the main workspace routes

**Step 2: Verify the red state**

Run: `rg -n '/new|/chats/:id|/app' README.md -S`
Expected:

- README references old workspace URLs

**Step 3: Write minimal implementation**

Update the route table and flow descriptions to reflect:

- `/about`
- `/changelogs`
- `/app`
- `/app/chats/:id`
- redirect compatibility for `/new` and `/chats/:id`

Keep the docs concise.

**Step 4: Run validation**

Run: `pnpm exec eslint`
Working directory: `apps/web`
Expected: this may still fail on existing repo lint debt unrelated to the route migration; if so, document the exact residual issues and confirm the changed files lint clean with targeted commands

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: update workspace routes"
```

### Task 6: Final verification

**Files:**
- Review only: `apps/web/app/app/layout.tsx`
- Review only: `apps/web/app/app/page.tsx`
- Review only: `apps/web/app/app/chats/[id]/page.tsx`
- Review only: `apps/web/app/page.tsx`
- Review only: `apps/web/app/new/page.tsx`
- Review only: `apps/web/app/chats/[id]/page.tsx`

**Step 1: Run targeted lint**

Run:

```bash
pnpm exec eslint "app/app/layout.tsx" "app/app/page.tsx" "app/app/chats/[id]/page.tsx" app/page.tsx app/new/page.tsx "app/chats/[id]/page.tsx" "app/(public)/about/page.tsx" "app/(public)/changelogs/page.tsx" app/components/Sidebar.tsx
```

Working directory: `apps/web`

Expected: PASS

**Step 2: Run production build smoke check**

Run: `pnpm build`
Working directory: repository root
Expected: PASS with routes generated for `/about`, `/changelogs`, `/app`, and `/app/chats/[id]`

**Step 3: Manual verification**

Check:

- `/` redirects to `/about`
- `/app` renders the workspace start screen
- uploading a document from `/app` navigates to `/app/chats/[id]`
- selecting a conversation from the sidebar navigates to `/app/chats/[id]`
- `/new` redirects to `/app`
- `/chats/[id]` redirects to `/app/chats/[id]`
- public-page CTA leads to `/app`
- existing conversation history still appears from localStorage

**Step 4: Commit**

```bash
git add apps/web/app/app apps/web/app/page.tsx apps/web/app/new/page.tsx apps/web/app/chats apps/web/app/components/Sidebar.tsx apps/web/app/(public)/about/page.tsx apps/web/app/(public)/changelogs/page.tsx README.md
git commit -m "refactor(web): move workspace to app routes"
```
