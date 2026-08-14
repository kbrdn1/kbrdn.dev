# ============================================
# Dockerfile for kbrdn.dev-v2
# Optimized for Bun + Nuxt 4
# ============================================

FROM oven/bun:1-alpine AS base
WORKDIR /app

# ============================================
# Stage: Dependencies
# ============================================
FROM base AS deps

# Copy dependency files
COPY package.json bun.lock ./

# Install dependencies (ignore native module scripts - better-sqlite3 not needed in production)
RUN bun install --frozen-lockfile --ignore-scripts

# ============================================
# Stage: Builder
# ============================================
FROM base AS builder

# Identité du build, figée dans le bundle via runtimeConfig et renvoyée par
# /api/health. Le contexte de build ne contient pas .git (cf. .dockerignore),
# donc le sha ne peut venir que d'ici. APP_VERSION est vide hors release : le
# fallback est alors la version de package.json.
ARG GIT_SHA=dev
ARG APP_VERSION=""
ENV GIT_SHA=$GIT_SHA
ENV APP_VERSION=$APP_VERSION

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN bun run build

# ============================================
# Stage: Production
# ============================================
FROM base AS runner

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_PATH=/app/node_modules

# Create non-root user for security
RUN addgroup --system --gid 1001 nuxt && \
    adduser --system --uid 1001 nuxt

# Copy built application
COPY --from=builder --chown=nuxt:nuxt /app/.output ./.output

# Install runtime dependencies for .output/server (ipx needs ofetch, etc.)
WORKDIR /app/.output/server
RUN rm -rf node_modules && bun install --production
WORKDIR /app

# Switch to non-root user
USER nuxt

# Expose port
EXPOSE 3000

# Health check — vise /api/health, pas `/` : la home rend côté serveur même
# quand la couche API est morte, donc l'ancienne sonde passait au vert sur un
# conteneur à moitié cassé.
#
# `-O /dev/null` et non `--spider` : --spider émet un HEAD, et h3 ne route pas
# HEAD vers un handler `.get` — vérifié sur le build de prod, HEAD
# /api/health répond 404 là où GET répond 200. Un --spider ici marquerait
# tous les conteneurs unhealthy.
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget -q -O /dev/null http://localhost:3000/api/health || exit 1

# Start command
CMD ["bun", "run", ".output/server/index.mjs"]
