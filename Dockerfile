# ── Lumora production image ──────────────────────────────────────────────
# Multi-stage: deps → builder → slim runner using Next.js standalone output.
#
# Build:   docker build -t lumora .
# Run:     docker run -p 3000:3000 -e DATABASE_URL=... lumora
# Compose: see docker-compose.yml (PostgreSQL included).

# 1. Dependencies
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# 2. Builder
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma client is generated for the target platform (linux glibc) and the
# schema is kept so `prisma migrate deploy` can run at container start.
RUN npx prisma generate && npm run build

# 3. Runner
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd -r lumora && useradd -r -g lumora lumora \
    && apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

# Next.js standalone server + static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Runtime dependencies that load from node_modules at runtime (externalized)
# plus the Prisma CLI for `migrate deploy` at startup.
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/pdf-parse ./node_modules/pdf-parse
COPY --from=builder /app/node_modules/pdfjs-dist ./node_modules/pdfjs-dist
COPY --from=builder /app/node_modules/mammoth ./node_modules/mammoth
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/prisma ./prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

# Persistent data location (SQLite mode: mount a volume here)
RUN mkdir -p /data && chown -R lumora:lumora /app /data

USER lumora
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
