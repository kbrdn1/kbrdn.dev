# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio/website built with Nuxt 4, using the Nuxt Content module for markdown-based content management. The project is set up as a modern, minimal Nuxt starter with essential modules for content, UI, fonts, and images.

## Development Commands

### Package Manager
This project uses `bun` as the package manager (based on bun.lock presence).

### Common Commands
```bash
# Install dependencies
bun install

# Development server (http://localhost:3000)
bun run dev

# Production build
bun run build

# Preview production build locally
bun run preview

# Generate static site
bun run generate

# Prepare Nuxt (runs automatically after install)
bun run postinstall
```

### Linting
ESLint is configured via `@nuxt/eslint` module. Run:
```bash
bunx eslint .
```

## Architecture

### Nuxt 4 Configuration
- **Compatibility Date**: 2025-07-15
- **Devtools**: Enabled
- **Modules**: @nuxt/content, @nuxt/eslint, @nuxt/fonts, @nuxt/image

### Content Management
Content is managed through `@nuxt/content` with a collection-based approach defined in `content.config.ts`:
- **Collections**: pages, blog, projects, skills, stacks, experiences (6 total)
- **Source Pattern**: Collection-specific patterns in `app/content/`
- **Nuxt Studio**: Integrated for visual content editing (see `.studio/config.json`)
- **MDC Components**: Alert, Callout, CodeGroup available in `app/components/content/`

### Directory Structure
```
app/
├── app.vue           # Root component with NuxtLayout/NuxtPage
├── pages/            # File-based routing
│   └── index.vue     # Homepage (queries content collection)
├── components/       # Auto-imported Vue components
├── composables/      # Auto-imported composables
└── content/          # Markdown content files
    └── index.md      # Homepage content
```

### Key Patterns

**Content Querying**: Pages use `useAsyncData` + `queryCollection` to fetch markdown content:
```ts
const { data: home } = await useAsyncData(() =>
  queryCollection('content').path('/').first()
)
```

**Content Rendering**: Use `<ContentRenderer>` component with the queried data:
```vue
<ContentRenderer v-if="home" :value="home" />
```

**SEO**: Use `useSeoMeta()` composable with content metadata (title, description from markdown frontmatter).

### Installed but Unconfigured Modules
- `@nuxt/ui`: UI component library (installed but not added to modules)
- `@nuxtjs/i18n`: Internationalization (installed but not configured)
- `better-sqlite3`: Database driver (dependency present but no visible usage)

These modules are in dependencies but not yet integrated into `nuxt.config.ts`, suggesting future features planned.

## Important Notes

### ESLint Configuration
ESLint extends from `.nuxt/eslint.config.mjs` (auto-generated). Custom rules should be added to `eslint.config.mjs`.

### Content System
The project uses Nuxt Content v3's collection-based API (not the legacy document-driven mode). Always use `queryCollection()` instead of deprecated content APIs.

### Auto-imports
Nuxt auto-imports components from `app/components/` and composables from `app/composables/`. No manual imports needed for these.

## Deployment

### Docker
The project uses a multi-stage Docker build optimized for Bun + Nuxt 4:
```bash
# Build image
docker build -t kbrdn-dev .

# Run locally
docker run -p 3000:3000 kbrdn-dev

# Or use docker-compose
docker-compose up
```

**Key files**:
- `Dockerfile` - Multi-stage build (deps → builder → runner) with health check
- `.dockerignore` - Excludes node_modules, .nuxt, .output, .git, docs/
- `docker-compose.yml` - Local development with environment variables

### CI/CD Workflows
Located in `.github/workflows/`:

**deploy.yml** - Main deployment pipeline:
- Triggers on push to master (ignores docs/specs changes)
- Build job: Bun install, lint, typecheck, build
- Deploy job: Triggers Dokploy webhook with retry logic
- Notify job: Creates GitHub step summary

**studio-sync.yml** - Content sync:
- Triggers on content file changes in `app/content/`
- Triggers Dokploy redeployment for content updates

### Production Deployment
- **Platform**: Dokploy on VPS (72.60.212.44)
- **Domain**: kbrdn.dev with Let's Encrypt SSL
- **Health Check**: `wget --spider http://localhost:3000` every 30s

### Required Secrets
See `docs/SECRETS.md` for configuration:
- `DOKPLOY_WEBHOOK_URL` - Deployment trigger
- `GH_TOKEN` - GitHub API access
- `RESEND_API_KEY` - Email sending
- `NUXT_STUDIO_TOKEN` - Nuxt Studio API

## Active Technologies
- TypeScript 5.x, Node.js 22+ (via Bun runtime) + Nuxt 4, @nuxt/content, @nuxt/ui v4, @nuxtjs/i18n, Docker
- File-based content (Markdown/MDX) via @nuxt/content, no database
- Dokploy for container orchestration, GitHub Actions for CI/CD
