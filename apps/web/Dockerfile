FROM node:20-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS deps

RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  g++ \
  libgomp1 \
  make \
  python3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/cli/package.json apps/cli/package.json
COPY packages/rag/package.json packages/rag/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS builder

WORKDIR /app
COPY . .

RUN pnpm --filter @parse-pal/web build

FROM node:20-bookworm-slim AS runner

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends \
  ca-certificates \
  libgomp1 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
