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

**deploy.yml** - Main deployment pipeline (build → push → SSH deploy):
- Triggers on push to `main` (→ prod) and `dev` (→ preprod), ignoring `**.md` / `docs/` / `specs/` changes; `workflow_dispatch` supports a target env + rollback-only run
- `resolve` job: derives env (prod/preprod) and image tag (main/dev) from the ref
- `build` job: builds the multi-stage Docker image with buildx and pushes it to GHCR (`ghcr.io/<repo>:<tag>` + `:sha-<sha>`)
- `deploy` job: SSHes into the VPS (key from `VPS_SSH_PRIVATE_KEY`) and runs the remote `deploy`/`rollback` wrapper, passing the image ref and runtime secrets (`GITHUB_TOKEN`, `RESEND_API_KEY`, `NUXT_STUDIO_TOKEN`) inline; writes a GitHub step summary

Content changes (`app/content/**.mdx`) deploy through this same pipeline — `.mdx` is not covered by the `**.md` paths-ignore, so a content push to `main` triggers a full build + deploy.

### Production Deployment
- **Platform**: self-hosted VPS, image pulled from GHCR and deployed over SSH by `deploy.yml` (no Dokploy)
- **Environments**: `main` → prod (https://kbrdn.dev), `dev` → preprod (https://pre-prod.kbrdn.dev)
- **Domain**: kbrdn.dev with Let's Encrypt SSL
- **Health Check**: `wget --spider http://localhost:3000` every 30s

### Required Secrets
Repo-level GitHub Actions secrets (see `docs/SECRETS.md`):
- `VPS_HOST` / `VPS_USER` / `VPS_SSH_PRIVATE_KEY` - SSH deploy target + key
- `GH_TOKEN` - GitHub API access (threaded to the VPS at deploy time)
- `RESEND_API_KEY` - Email sending (contact form) — **source of truth for prod**, injected into the VPS by `deploy.yml`
- `NUXT_STUDIO_TOKEN` - Nuxt Studio API

## Active Technologies
- TypeScript 5.x, Node.js 22+ (via Bun runtime) + Nuxt 4, @nuxt/content, @nuxt/ui v4, @nuxtjs/i18n, Docker
- File-based content (Markdown/MDX) via @nuxt/content, no database
- GHCR for image registry, self-hosted VPS + SSH deploy, GitHub Actions for CI/CD
