# Implementation Plan: Automated Deployment Pipeline

**Branch**: `feat/#1-dokploy-deployment` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-dokploy-deployment/spec.md`

## Summary

Implement an automated deployment pipeline for kbrdn.dev using Docker containerization, GitHub Actions CI/CD, Dokploy orchestration, and Nuxt Studio integration. The pipeline will enable content editors to publish via Nuxt Studio with 5-minute deployment, developers to deploy code changes automatically, and visitors to experience fast, secure page loads.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22+ (via Bun runtime)
**Primary Dependencies**: Nuxt 4, @nuxt/content, @nuxt/ui v4, @nuxtjs/i18n, Docker
**Storage**: File-based content (Markdown/MDX) via @nuxt/content, no database
**Testing**: Manual validation, Docker health checks, GitHub Actions CI
**Target Platform**: Linux VPS (Ubuntu 24.04) with Docker, production at kbrdn.dev
**Project Type**: Web application (SSR Nuxt 4)
**Performance Goals**: Page load < 3 seconds, deployment < 10 minutes, content sync < 5 minutes
**Constraints**: Zero-downtime deployments, 99.5% uptime, valid SSL/TLS
**Scale/Scope**: Single VPS (4 cores, 16GB RAM, 200GB SSD), personal portfolio site

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Branch Convention | ✅ PASS | Using `feat/#1-dokploy-deployment` format |
| II. Commit Convention | ✅ PASS | Will use `✨ feat(deploy):` prefix with emoji |
| III. Quality Gates | ✅ PASS | CI/CD includes linting, typecheck (continue-on-error), build validation |
| IV. Issue & PR Management | ✅ PASS | Issue #1 created, will use proper labels |
| V. Code Style | ✅ PASS | Nuxt 4 with Vue 3 Composition API, Bun package manager |

## Project Structure

### Documentation (this feature)

```text
specs/1-dokploy-deployment/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (N/A - no data entities)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
# Nuxt 4 application structure (existing)
app/
├── components/          # Vue components
│   ├── content/         # MDC components (NEW: Alert, Callout, CodeGroup)
│   ├── home/            # Homepage sections
│   ├── layout/          # Layout components
│   └── ui/              # Reusable UI components
├── composables/         # Vue composables
├── content/             # Markdown/MDX content
│   ├── blogs/           # Blog posts
│   ├── pages/           # Static pages
│   ├── projects/        # Project entries
│   ├── experiences/     # Work experiences
│   ├── skills/          # Skills list
│   └── stacks/          # Tech stacks
├── layouts/             # Page layouts
├── pages/               # File-based routing
└── utils/               # Utility functions

# Deployment configuration (NEW)
.github/
└── workflows/
    ├── deploy.yml       # Main deployment workflow
    └── studio-sync.yml  # Nuxt Studio sync workflow

.studio/
└── config.json          # Nuxt Studio configuration

# Docker configuration (NEW)
Dockerfile               # Multi-stage build for Bun + Nuxt
.dockerignore            # Docker build exclusions
docker-compose.yml       # Local development compose
```

**Structure Decision**: Nuxt 4 SSR web application with file-based content. No backend separation needed - single deployment unit with Docker containerization. GitHub Actions for CI/CD, Dokploy for VPS orchestration.

## Complexity Tracking

> No violations detected. Implementation follows project conventions.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Single container | Monolithic deployment | Portfolio site doesn't need microservices |
| File-based content | No database | @nuxt/content handles content natively |
| GitHub Actions + Dokploy | Separation of concerns | CI/CD in GitHub, orchestration on VPS |

## Implementation Phases

### Phase 0: Research (Captured in research.md)

- Current Nuxt 4 + @nuxt/content configuration
- Dokploy webhook API and deployment triggers
- Nuxt Studio API integration requirements
- Docker best practices for Bun runtime
- Let's Encrypt SSL automation via Dokploy

### Phase 1: Design Artifacts

#### 1.1 Bug Fix (FR-010)
- Fix `content.config.ts`: Change `blog/` to `blogs/` (line 35)

#### 1.2 Docker Configuration
- Dockerfile: Multi-stage build (deps → builder → runner)
- .dockerignore: Exclude dev files, docs, IDE settings
- docker-compose.yml: Local development with env vars

#### 1.3 GitHub Actions
- deploy.yml: Build validation + Dokploy webhook trigger
- studio-sync.yml: Content change detection + Studio notification

#### 1.4 Nuxt Studio Integration
- nuxt.config.ts: Enable Studio, configure content sources
- .studio/config.json: Collection definitions, media config

#### 1.5 MDC Components (Optional Enhancement)
- Alert.vue: UAlert wrapper for content
- Callout.vue: Styled callout boxes
- CodeGroup.vue: Tabbed code blocks

### Phase 2: Tasks (Generated by /speckit.tasks)

Tasks will be organized by user story:
- **US1 (P1)**: Content Editor Publishing - Nuxt Studio + content sync
- **US2 (P2)**: Developer Code Deployment - Docker + GitHub Actions + Dokploy
- **US3 (P3)**: Site Visitor Experience - SSL, health checks, performance

## Dependencies & External Configuration

### GitHub Secrets Required
| Secret | Purpose |
|--------|---------|
| `DOKPLOY_WEBHOOK_URL` | Trigger Dokploy deployment |
| `GH_TOKEN` | GitHub API for contributions chart |
| `RESEND_API_KEY` | Contact form email sending |
| `NUXT_STUDIO_TOKEN` | Nuxt Studio API authentication |

### DNS Configuration
| Type | Name | Value |
|------|------|-------|
| A | @ | 72.60.212.44 |
| A | www | 72.60.212.44 |
| CNAME | dokploy | kbrdn.dev |

### VPS Configuration (Dokploy)
- Application name: `kbrdn-dev`
- Repository: `https://github.com/kbrdn1/kbrdn.dev-v2`
- Branch: `master`
- Build type: Dockerfile
- Port: 3000
- Domain: kbrdn.dev
- SSL: Let's Encrypt (auto)

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Webhook failure | Auto-retry in GitHub Actions, manual trigger option |
| Concurrent deploys | Dokploy queues deployments |
| Docker build failure | Previous container remains running |
| Content merge conflicts | Git-based resolution through GitHub |

## Success Validation

After implementation, verify against spec.md success criteria:
- [ ] SC-001: Content sync < 5 minutes
- [ ] SC-002: Code deployment < 10 minutes
- [ ] SC-003: 99.5% uptime
- [ ] SC-004: Page load < 3 seconds
- [ ] SC-005: Valid SSL certificate
- [ ] SC-006: Zero-downtime deployments
- [ ] SC-007: 100% build failure blocking
- [ ] SC-008: All 6 content collections accessible
