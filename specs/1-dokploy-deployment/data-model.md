# Data Model: Automated Deployment Pipeline

**Feature**: #1 Dokploy Deployment
**Date**: 2026-01-03
**Plan**: [plan.md](./plan.md)

## Overview

This feature is primarily infrastructure/configuration work and does not introduce new data entities to the application. The existing content collections (pages, blog, projects, skills, stacks, experiences) are already defined in `content.config.ts`.

## Existing Entities (No Changes Required)

The following content collections are already defined and will work with the deployment pipeline:

| Collection | Type | Source |
|------------|------|--------|
| pages | Markdown | `app/content/pages/**/*.md` |
| blog | MDX | `app/content/blogs/**/*.mdx` |
| projects | Markdown/MDX | `app/content/projects/**/*.{md,mdx}` |
| skills | YAML | `app/content/skills/**/*.yaml` |
| stacks | YAML | `app/content/stacks/**/*.yaml` |
| experiences | YAML | `app/content/experiences/**/*.yaml` |

## Configuration Entities (New)

### Environment Configuration

Not a data entity, but key configuration stored as environment variables and GitHub secrets:

```yaml
# GitHub Secrets
DOKPLOY_WEBHOOK_URL: "Webhook URL for deployment trigger"
GH_TOKEN: "GitHub API token for contributions chart"
RESEND_API_KEY: "Email service API key"
NUXT_STUDIO_TOKEN: "Nuxt Studio authentication token"

# Runtime Configuration (nuxt.config.ts)
runtimeConfig:
  githubToken: "GITHUB_TOKEN"
  resendApiKey: "RESEND_API_KEY"
  studioToken: "NUXT_STUDIO_TOKEN"
  public:
    siteUrl: "NUXT_PUBLIC_SITE_URL"
```

### Deployment Metadata (Implicit)

Dokploy tracks deployment state internally:

| Field | Type | Description |
|-------|------|-------------|
| commit_sha | string | Git commit triggering deployment |
| status | enum | pending, building, deploying, running, failed |
| timestamp | datetime | Deployment start time |
| health | boolean | Container health check status |

## API Contracts

**Not Applicable**: This feature does not introduce new API endpoints. All interactions are:

1. **GitHub Actions → Dokploy**: HTTP POST webhook (external)
2. **GitHub Actions → Nuxt Studio**: HTTP POST notification (external)
3. **Dokploy → Container**: Docker health check (internal)

See [research.md](./research.md) for webhook payload examples.

## Schema Changes

### Required: content.config.ts Bug Fix

```diff
// Line 35
blog: defineCollection({
  type: 'page',
  source: {
-   include: 'blog/**/*.{md,mdx}',
+   include: 'blogs/**/*.{md,mdx}',
    cwd: contentDir
  },
  // ... rest unchanged
}),
```

### No Database Migrations

This project uses file-based content via @nuxt/content. No database or migrations required.
