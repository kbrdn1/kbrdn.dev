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
- **Collection Type**: `page`
- **Source Pattern**: `**/*.md` (all markdown files)
- Content files are stored in `app/content/`
- Pages query content using `queryCollection('content')`

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

## Active Technologies
- TypeScript 5.x, Node.js 22+ (via Bun runtime) + Nuxt 4, @nuxt/content, @nuxt/ui v4, @nuxtjs/i18n, Docker (feat/#1-dokploy-deployment)
- File-based content (Markdown/MDX) via @nuxt/content, no database (feat/#1-dokploy-deployment)

## Recent Changes
- feat/#1-dokploy-deployment: Added TypeScript 5.x, Node.js 22+ (via Bun runtime) + Nuxt 4, @nuxt/content, @nuxt/ui v4, @nuxtjs/i18n, Docker
