FROM node:24-alpine AS base
RUN npm install -g pnpm

# ── Install deps ─────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile --ignore-scripts

# ── Build shared + server ─────────────────────────────────────────────────────
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/shared/node_modules ./shared/node_modules || true
COPY --from=deps /app/server/node_modules ./server/node_modules || true
COPY . .
RUN pnpm --filter @guruapp/shared build
RUN pnpm --filter server build

# ── Production image ──────────────────────────────────────────────────────────
FROM node:24-alpine AS production
WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts
COPY --from=build /app/shared/dist ./shared/dist
COPY --from=build /app/server/dist ./server/dist
COPY server/prisma ./server/prisma
EXPOSE 4000
WORKDIR /app/server
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/server.js"]
