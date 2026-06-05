# Signet — self-hosted Docker image
#
#   docker build -t signet .
#   docker run -p 3000:3000 signet
#
# The core editor needs zero configuration. To enable optional accounts, pass
# the auth env vars at runtime (see README → Environment Variables):
#   docker run -p 3000:3000 -e DATABASE_URL=... -e BETTER_AUTH_SECRET=... signet

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable pnpm

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- Runtime ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S signet && adduser -S signet -G signet
COPY --from=build --chown=signet:signet /app/.next/standalone ./
COPY --from=build --chown=signet:signet /app/.next/static ./.next/static
COPY --from=build --chown=signet:signet /app/public ./public
USER signet
EXPOSE 3000
CMD ["node", "server.js"]
