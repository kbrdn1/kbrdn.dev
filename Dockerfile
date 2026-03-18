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

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --spider -q http://localhost:3000 || exit 1

# Start command
CMD ["bun", "run", ".output/server/index.mjs"]
