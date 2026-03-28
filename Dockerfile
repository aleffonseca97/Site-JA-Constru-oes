# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# Build-arg vindo do Compose; não usar ENV aqui para não persistir na camada como variável de imagem.
ARG DATABASE_URL
RUN export DATABASE_URL="$DATABASE_URL" && npm run db:generate && npm run build

# CLI Prisma à parte: o output standalone do Next não inclui dependências hoistadas necessárias ao migrate.
# Manter versão alinhada com package-lock.json (node_modules/prisma).
FROM node:20-bookworm-slim AS migrate-tool
WORKDIR /prismacli
RUN printf '%s\n' '{"private":true}' > package.json \
  && npm install prisma@6.19.2 --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:20-bookworm-slim AS runner
WORKDIR /app

# HOSTNAME=0.0.0.0: Next standalone escuta em todas as interfaces (port mapping do Docker).
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

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

CMD ["sh", "-c", "node ./prismacli/node_modules/prisma/build/index.js migrate deploy && node server.js"]
