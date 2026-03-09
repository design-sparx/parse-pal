# About And Changelogs Pages Design

## Goal

Add two public-facing pages to the web app:

- `About`: explain what ParsePal is, why it exists, and its role as an open source learning project
- `Changelogs`: present release-driven project updates using the repository changelog markdown as the source of truth

Also add a repository link throughout the app so users can clone or star the project on GitHub.

## Current Context

- The web app is a Next.js App Router app under `apps/web/app`.
- The root app currently redirects `/` to `/new`.
- The chat experience uses `apps/web/app/(chat)/layout.tsx` with a sidebar shell for active conversations and `EmptyAppView` for the empty state.
- The repository already uses `release-it` at the workspace root and keeps generated release notes in `CHANGELOG.md`.
- GitHub Releases are not enabled in `.release-it.json`, so the existing local changelog file is the correct release content source today.

## Approaches Considered

### 1. Static routes with local changelog parsing

This is the selected option. `About` is authored directly in the web app, and `Changelogs` reads the root `CHANGELOG.md` file, parses its release sections, and renders them in a styled public page.

Why this fits:

- uses the release process already in the repo
- avoids unnecessary network fetches and GitHub API failure modes
- keeps the changelog page aligned with the versioned source controlled artifact

### 2. Live GitHub API releases page

This would fetch releases directly from GitHub at request time. It reduces duplication if GitHub Releases become the canonical source later, but it adds external dependencies, rate-limit concerns, and more error handling than the current project needs.

### 3. Fully manual content pages

This would keep both pages as hand-authored content in the app. It is simple, but it makes the changelog page drift from the actual release flow and creates avoidable duplicate maintenance.

## Architecture

- Add `apps/web/app/about/page.tsx` for the project overview page.
- Add `apps/web/app/changelogs/page.tsx` for the release history page.
- Add a small server-side helper under `apps/web/lib` that reads the root `CHANGELOG.md`, splits it into release entries, and returns normalized data for rendering.
- Add a small app-shell treatment for public navigation so `About`, `Changelogs`, and GitHub are visible without turning the product into a docs site.
- Keep the existing chat flow and route group intact.

## Content Direction

### About

The page should be hybrid:

- practical first: what ParsePal does, how the chat-with-documents flow works, and where the code lives
- reflective second: why it is open source, what is being learned, and the experimental nature of the project

The repository CTA should be prominent but compact, with copy oriented around cloning, reading the source, and starring the repo.

### Changelogs

The page should feel like release notes rather than marketing copy:

- newest release first
- release tag and date clearly visible
- markdown content rendered with readable spacing for headings, lists, links, and code blocks
- fallback empty state if no releases are present yet

## Visual Direction

Use an editorial open-source style that fits the current IBM Plex typography and neutral theme tokens:

- warm, restrained surface treatment rather than glossy SaaS cards
- strong section dividers and visible hierarchy
- compact utility navigation, not a full marketing navbar
- layouts that work on both the empty app surface and standalone public pages

## Navigation

Add links for:

- `About`
- `Changelogs`
- `GitHub`

The GitHub link should appear in both the header/navigation treatment and the footer so users can discover it from anywhere in the app.

## Error Handling

- If `CHANGELOG.md` cannot be parsed, render a non-blocking fallback state on `/changelogs` with a link to the repository.
- If the changelog contains only the heading and no release sections, show a “no releases yet” state with the GitHub link.
- If a release section has missing body content, still render its heading metadata and preserve the list order.

## Verification

- navigation reaches `/about` and `/changelogs`
- GitHub CTA appears app-wide in the chosen placements
- changelog markdown renders cleanly from the current `CHANGELOG.md`
- empty state and chat state both preserve access to the public links
- `pnpm --filter @parse-pal/web lint` passes
