# Repository Guidelines

## Project Structure & Module Organization

This repository is a `pnpm` workspace managed with Turborepo.

- `apps/web` contains the Next.js app. Routes live in `apps/web/app`, route-specific UI is under `apps/web/app/components`, and shared UI primitives are in `apps/web/components`.
- `apps/cli/src` contains CLI entry points such as `ingest.ts` and `chat.ts`.
- `packages/rag/src` holds shared retrieval, embedding, and vector store logic consumed by both apps.
- `docs/` stores design notes and implementation plans.

## Build, Test, and Development Commands

- `pnpm dev` starts the workspace in development mode through Turbo.
- `pnpm build` builds all workspaces.
- `pnpm ingest` runs the CLI ingestion flow.
- `pnpm chat` runs the CLI chat flow.
- `pnpm --filter @parse-pal/web dev` runs only the web app.
- `pnpm --filter @parse-pal/web lint` runs ESLint for the web app.

Run commands from the repository root unless a command explicitly targets a workspace.

## Coding Style & Naming Conventions

- Use TypeScript for app and package code.
- Follow the existing style: 2-space indentation, double quotes, and semicolon-free files.
- Name React components in `PascalCase` (`ChatView.tsx`), hooks in `camelCase` with a `use` prefix (`useConversations.ts`), and route folders using Next.js conventions (`(chat)`, `[id]`, `new`).
- Keep shared exports small and focused in `packages/rag`.

## Testing Guidelines

There is no established automated test suite yet. For now:

- run `pnpm --filter @parse-pal/web lint` before submitting UI changes
- manually verify the affected web flow in `apps/web`
- test CLI changes by running `pnpm ingest` or `pnpm chat` with the relevant `.env` values

When adding tests, place them next to the feature or in a nearby `__tests__` folder and use clear names like `ChatView.test.tsx`.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit style, typically `feat: ...`, `feat(ui): ...`, and `refactor: ...`. Keep commit subjects short and imperative.

Pull requests should include:

- a concise summary of the user-visible change
- linked issue or task reference when available
- screenshots or short recordings for UI changes
- notes on manual verification and any known gaps

## Security & Configuration Tips

Copy `.env.example` when setting up locally and keep secrets out of git. The web app and CLI both rely on environment configuration, so document any new variables in `.env.example` and the PR description.
