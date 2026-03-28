# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

#ARG DATABASE_URL
#ENV DATABASE_URL=${DATABASE_URL}

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

#RUN npm run db:generate && npm run build
RUN npm run build

# Prisma CLI isolado do node_modules do standalone (evita dependências hoistadas faltando)
FROM node:20-bookworm-slim AS migrate-tool
WORKDIR /prismacli
RUN printf '%s\n' '{"private":true}' > package.json \
  && npm install prisma@6.19.2 --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=migrate-tool --chown=nextjs:nodejs /prismacli/node_modules ./prismacli/node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="72.62.108.253"

CMD ["sh", "-c", "node ./prismacli/node_modules/prisma/build/index.js migrate deploy && node server.js"]
