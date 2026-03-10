# App Route Migration Design

## Goal

Move the interactive workspace from top-level routes to a dedicated `/app` namespace so the product has a clear separation between:

- public project pages: `/about`, `/changelogs`
- workspace routes: `/app`, `/app/chats/[id]`

Also add clear public-page CTAs that lead into the workspace.

## Current Context

- The root route currently redirects `/` to `/new`.
- The workspace lives in `apps/web/app/(chat)` and currently resolves to:
  - `/new`
  - `/chats/[id]`
- Public pages already live separately under `apps/web/app/(public)`.
- The chat layout uses client-side routing pushes and pathname checks that currently assume `/new` and `/chats/[id]`.
- Public pages now need a clear CTA into the actual app surface.

## Approaches Considered

### 1. Canonical `/app` workspace with redirects from legacy routes

This is the selected option.

The workspace becomes:

- `/app`
- `/app/chats/[id]`

Legacy routes remain temporarily as redirects:

- `/new` -> `/app`
- `/chats/[id]` -> `/app/chats/[id]`

The root route redirects to `/about`.

Why this fits:

- clean separation between public and product routes
- preserves existing bookmarks and local usage during the transition
- gives public pages a natural CTA destination

### 2. Add `/app` as an alias and keep old routes primary

This lowers migration risk but creates duplicate canonical URLs for the same workspace. That weakens the information architecture and keeps the current ambiguity.

### 3. Hard cutover with no redirects

This is structurally simple but creates unnecessary breakage for existing links and route assumptions. There is no upside large enough to justify that disruption.

## Architecture

- Keep public pages at top level through the existing `(public)` route group.
- Introduce a workspace route subtree under `apps/web/app/app`.
- Move the current chat layout and workspace pages there so the final route map is:
  - `/about`
  - `/changelogs`
  - `/app`
  - `/app/chats/[id]`
- Keep API routes unchanged.
- Keep the global root layout unchanged.

## Routing Behavior

- `/` redirects to `/about`
- `/app` becomes the upload/start screen that replaces `/new`
- `/app/chats/[id]` becomes the active conversation route
- `/new` redirects to `/app`
- `/chats/[id]` redirects to `/app/chats/[id]`

Within the workspace:

- sidebar “Upload a PDF” routes to `/app`
- sidebar conversation selection routes to `/app/chats/[id]`
- new conversation creation routes to `/app/chats/[id]`
- empty-state logic checks `/app` instead of `/new`

## Component Impact

The main files affected are:

- `apps/web/app/page.tsx`
- `apps/web/app/(chat)/layout.tsx`
- `apps/web/app/(chat)/new/page.tsx`
- `apps/web/app/(chat)/chats/[id]/page.tsx`
- `apps/web/app/components/Sidebar.tsx`
- `apps/web/app/(public)/about/page.tsx`
- `apps/web/app/(public)/changelogs/page.tsx`

The public page CTA should use `/app` explicitly. No separate `/app` marketing page is needed. The workspace landing route is the app.

## Vercel React / Next.js Considerations

- Keep redirects server-side via App Router route files rather than client-only redirect logic where possible.
- Preserve the current separation between server-rendered public pages and the client-driven workspace layout.
- Avoid route duplication that creates ambiguous navigation targets.
- Keep client-side serialization unchanged by preserving conversation ids and localStorage structure.

## Error Handling And Compatibility

- Redirects must preserve the `id` parameter exactly for existing chat URLs.
- Old route links should continue working without requiring local data migration.
- If a conversation id is not present in localStorage, the chat route should behave exactly as it does today after redirect.

## Verification

- `/` lands on `/about`
- `/app` loads the workspace start state
- `/app/chats/[id]` loads an existing conversation
- `/new` redirects to `/app`
- `/chats/[id]` redirects to `/app/chats/[id]`
- public page CTAs lead to `/app`
- no stale pushes to `/new` or `/chats/[id]` remain in workspace code
