# About And Changelogs Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add public `About` and `Changelogs` pages to the Next.js app, wire in app-wide GitHub navigation, and render release notes from the root `CHANGELOG.md`.

**Architecture:** Keep content and release rendering inside the web app. Author the `About` page as a static App Router route, parse the root changelog on the server through a small helper in `apps/web/lib`, and reuse a lightweight public navigation/footer treatment across empty, chat, and public page states so the repository link is visible everywhere.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, existing shadcn/ui primitives, `react-markdown` for changelog rendering

---

### Task 1: Add a minimal changelog parsing utility

**Files:**
- Create: `apps/web/lib/changelog.ts`
- Modify: `apps/web/package.json`

**Step 1: Write the failing test**

There is no established automated test harness in this repo yet for server-side utilities. Treat this as a TDD exception and define the parser behavior explicitly in code comments and manual validation criteria.

Document the expected parser output in `apps/web/lib/changelog.ts` comments:

- ignore the top-level `# Changelog` heading
- split sections on `## `
- extract a release title such as `v1.2.3` or `1.2.3`
- preserve the remaining markdown body
- return newest-first entries in file order

**Step 2: Run validation to confirm current tool support**

Run: `pnpm --filter @parse-pal/web lint apps/web/lib/changelog.ts`
Expected: the file is linted after creation with no syntax or import errors

**Step 3: Write minimal implementation**

Create `apps/web/lib/changelog.ts` with:

- a `type ChangelogEntry = { title: string; slug: string; publishedAt?: string; body: string }`
- a server-only utility that reads `../../CHANGELOG.md` from the repo root
- a parser that:
  - normalizes line endings
  - splits the changelog into `##` sections
  - extracts the first line as the release heading
  - strips empty leading/trailing lines from the body
  - converts the title into a stable `slug`
- a `getChangelogEntries()` function that returns `[]` when the file has no releases

Update `apps/web/package.json` to add:

- `react-markdown`

Only add remark plugins if the default markdown renderer proves insufficient during implementation.

**Step 4: Run validation**

Run: `pnpm --filter @parse-pal/web lint`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/lib/changelog.ts apps/web/package.json pnpm-lock.yaml
git commit -m "feat(web): add changelog parser"
```

### Task 2: Build shared public navigation and footer primitives

**Files:**
- Create: `apps/web/app/components/PublicNav.tsx`
- Create: `apps/web/app/components/PublicFooter.tsx`
- Modify: `apps/web/app/components/EmptyAppView.tsx`
- Modify: `apps/web/app/components/Sidebar.tsx`
- Modify: `apps/web/app/(chat)/layout.tsx`

**Step 1: Write the failing test**

There is no navigation test harness yet. Use manual acceptance criteria as the red state:

- `About` and `Changelogs` are not visible in the current UI
- GitHub is not linked globally in either header or footer

**Step 2: Run the app to confirm the red state**

Run: `pnpm --filter @parse-pal/web dev`
Expected: the current shell has no public navigation links for the new pages

**Step 3: Write minimal implementation**

Create `PublicNav.tsx` with:

- links to `/about`, `/changelogs`, and `https://github.com/design-sparx/parse-pal`
- a compact product label for `ParsePal`
- styling that fits both full-page public routes and the chat shell

Create `PublicFooter.tsx` with:

- a short open-source learning-project line
- a repeated GitHub link
- a compact copyright-free footer layout

Update `EmptyAppView.tsx` to render `PublicNav` at the top.

Update `Sidebar.tsx` to include a compact link cluster near the bottom or header without overcrowding the conversation UI.

Update `apps/web/app/(chat)/layout.tsx` to render `PublicFooter` in a way that remains visible for both empty and non-empty chat states. If the current full-height shell makes this awkward, add a wrapper that allows footer placement without breaking existing scrolling behavior.

**Step 4: Run validation**

Run: `pnpm --filter @parse-pal/web lint`
Expected: PASS

Manually verify:

- links appear in empty state
- links appear in active chat shell
- GitHub is visible in both a top navigation treatment and footer

**Step 5: Commit**

```bash
git add apps/web/app/components/PublicNav.tsx apps/web/app/components/PublicFooter.tsx apps/web/app/components/EmptyAppView.tsx apps/web/app/components/Sidebar.tsx apps/web/app/(chat)/layout.tsx
git commit -m "feat(web): add public navigation shell"
```

### Task 3: Implement the `About` page

**Files:**
- Create: `apps/web/app/about/page.tsx`

**Step 1: Write the failing test**

Use the current route absence as the red state:

- `/about` does not exist and should currently return a 404

**Step 2: Run manual route verification**

Run: `pnpm --filter @parse-pal/web dev`
Expected: `/about` is missing before implementation

**Step 3: Write minimal implementation**

Create `apps/web/app/about/page.tsx` with:

- a lightweight public page wrapper using the new nav/footer components
- a practical introduction section:
  - what ParsePal does
  - how document chat works at a high level
  - a direct GitHub CTA
- a learning-story section:
  - why the project is open source
  - what the project is exploring
  - a short invitation to clone, inspect, or contribute

Design notes:

- keep the page editorial and restrained
- use the existing IBM Plex type system
- prefer section dividers and asymmetry over generic marketing cards

**Step 4: Run validation**

Run: `pnpm --filter @parse-pal/web lint`
Expected: PASS

Manually verify:

- `/about` loads on desktop and mobile
- the GitHub CTA is visible
- copy hierarchy is clear

**Step 5: Commit**

```bash
git add apps/web/app/about/page.tsx
git commit -m "feat(web): add about page"
```

### Task 4: Implement the `Changelogs` page

**Files:**
- Create: `apps/web/app/changelogs/page.tsx`
- Modify: `apps/web/app/globals.css`

**Step 1: Write the failing test**

Use the current route absence as the red state:

- `/changelogs` does not exist and should currently return a 404

**Step 2: Run manual route verification**

Run: `pnpm --filter @parse-pal/web dev`
Expected: `/changelogs` is missing before implementation

**Step 3: Write minimal implementation**

Create `apps/web/app/changelogs/page.tsx` that:

- calls `getChangelogEntries()` server-side
- renders the latest release first in a featured block
- renders older releases in a simple vertical list
- uses `react-markdown` to render release bodies
- includes a fallback state when no releases are available
- includes a fallback state when parsing fails, with a link to `https://github.com/design-sparx/parse-pal/blob/main/CHANGELOG.md`

Update `apps/web/app/globals.css` to add a small markdown prose layer for:

- headings
- paragraphs
- lists
- links
- inline code
- code blocks

Keep the markdown styles narrowly scoped to the changelog content class rather than changing global typography defaults.

**Step 4: Run validation**

Run: `pnpm --filter @parse-pal/web lint`
Expected: PASS

Manually verify:

- `/changelogs` loads
- current root `CHANGELOG.md` content renders without layout issues
- empty/no-release behavior works if the helper returns `[]`

**Step 5: Commit**

```bash
git add apps/web/app/changelogs/page.tsx apps/web/app/globals.css
git commit -m "feat(web): add changelogs page"
```

### Task 5: Update metadata and project documentation

**Files:**
- Modify: `apps/web/app/layout.tsx`
- Modify: `README.md`

**Step 1: Write the failing test**

Use documentation and metadata gaps as the red state:

- app metadata does not reference the open-source nature of the project
- README does not mention the new public pages

**Step 2: Review the current state**

Run: `pnpm --filter @parse-pal/web lint`
Expected: current code remains green before metadata/doc adjustments

**Step 3: Write minimal implementation**

Update `apps/web/app/layout.tsx` metadata to better describe ParsePal as an open source document chat project.

Update `README.md` to mention:

- the new `About` page
- the new `Changelogs` page
- the GitHub link surfaced in the app UI

Keep the README update concise and aligned with the existing style.

**Step 4: Run validation**

Run: `pnpm --filter @parse-pal/web lint`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/app/layout.tsx README.md
git commit -m "docs: document public pages"
```

### Task 6: Final verification

**Files:**
- Review only: `apps/web/app/about/page.tsx`
- Review only: `apps/web/app/changelogs/page.tsx`
- Review only: `apps/web/app/components/PublicNav.tsx`
- Review only: `apps/web/app/components/PublicFooter.tsx`
- Review only: `apps/web/lib/changelog.ts`
- Review only: `apps/web/app/globals.css`

**Step 1: Run the lint check**

Run: `pnpm --filter @parse-pal/web lint`
Expected: PASS

**Step 2: Run a production build smoke check**

Run: `pnpm build`
Expected: PASS for the workspace, including the web app routes and server-side changelog reader

**Step 3: Manual verification**

Check:

- `/about` and `/changelogs` load correctly
- empty app view still feels centered and uncluttered
- active chat view still works with sidebar collapse/expand
- GitHub links open the repository URL
- changelog markdown preserves headings, lists, and links
- mobile layout does not overflow horizontally

**Step 4: Commit**

```bash
git add apps/web/app/about/page.tsx apps/web/app/changelogs/page.tsx apps/web/app/components/PublicNav.tsx apps/web/app/components/PublicFooter.tsx apps/web/app/components/EmptyAppView.tsx apps/web/app/components/Sidebar.tsx apps/web/app/(chat)/layout.tsx apps/web/app/globals.css apps/web/app/layout.tsx apps/web/lib/changelog.ts apps/web/package.json pnpm-lock.yaml README.md
git commit -m "feat(web): add about and changelogs pages"
```
