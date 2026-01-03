# Research: Automated Deployment Pipeline

**Feature**: #1 Dokploy Deployment
**Date**: 2026-01-03
**Plan**: [plan.md](./plan.md)

## Executive Summary

This research documents the technical analysis required to implement an automated deployment pipeline for kbrdn.dev using Docker, GitHub Actions, Dokploy, and Nuxt Studio. The research covers current codebase state, integration patterns, and implementation approaches.

---

## 1. Current Codebase Analysis

### 1.1 Project Structure

```
kbrdn.dev-v2/
├── app/                    # Nuxt 4 application root
│   ├── components/         # Vue components (home, layout, ui)
│   ├── composables/        # Vue composables
│   ├── content/            # Markdown/MDX content
│   │   ├── blogs/          # Blog posts (4 articles)
│   │   ├── pages/          # Static pages
│   │   ├── projects/       # Portfolio projects
│   │   ├── experiences/    # Work experience
│   │   ├── skills/         # Skills listing
│   │   └── stacks/         # Tech stack items
│   ├── layouts/            # Page layouts
│   ├── pages/              # File-based routing
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── nuxt.config.ts          # Nuxt configuration
├── content.config.ts       # Content collections schema
├── package.json            # Dependencies (Bun)
└── bun.lock                # Bun lockfile
```

### 1.2 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Nuxt | 4.x |
| UI Library | @nuxt/ui | 4.x |
| Content | @nuxt/content | Latest |
| i18n | @nuxtjs/i18n | Latest |
| Images | @nuxt/image | Latest |
| Fonts | @nuxt/fonts | Latest |
| Package Manager | Bun | Latest |
| Language | TypeScript | 5.x |

### 1.3 Content Collections (content.config.ts)

| Collection | Source Pattern | Fields |
|------------|----------------|--------|
| pages | `pages/**/*.md` | title, description |
| blog | `blog/**/*.mdx` | title, description, publishedAt, tags |
| projects | `projects/**/*.{md,mdx}` | title, description, date, url, repository, tags |
| skills | `skills/**/*.yaml` | title, icon, color, level |
| stacks | `stacks/**/*.yaml` | title, icon, url |
| experiences | `experiences/**/*.yaml` | title, company, startDate, endDate |

### 1.4 Known Bug: Content Path Mismatch

**Issue**: Line 35 in `content.config.ts` defines:
```typescript
source: { include: 'blog/**/*.mdx' }
```

**Reality**: Content directory is `app/content/blogs/` (with 's')

**Fix Required**: Change `blog/` to `blogs/` in content.config.ts

---

## 2. Docker Configuration Research

### 2.1 Bun Runtime Images

Official Bun images available:
- `oven/bun:latest` - Full image with all tools
- `oven/bun:1-alpine` - Minimal Alpine-based image (recommended for production)
- `oven/bun:1-slim` - Debian slim variant

**Recommendation**: Use `oven/bun:1-alpine` for smallest image size (~150MB vs ~500MB)

### 2.2 Multi-Stage Build Strategy

```
Stage 1: deps      - Install dependencies with frozen lockfile
Stage 2: builder   - Build Nuxt application
Stage 3: runner    - Production image with .output only
```

Benefits:
- Final image contains only production artifacts
- No dev dependencies in production
- Smaller attack surface
- ~100-200MB final image size

### 2.3 Nuxt Output Structure

After `bun run build`, Nuxt generates:
```
.output/
├── server/
│   └── index.mjs    # Server entry point
├── public/          # Static assets
└── nitro.json       # Server configuration
```

Runtime command: `bun run .output/server/index.mjs`

### 2.4 Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `NODE_ENV` | Environment mode | Yes (production) |
| `HOST` | Server bind address | Yes (0.0.0.0) |
| `PORT` | Server port | Yes (3000) |
| `GITHUB_TOKEN` | GitHub API access | Yes |
| `RESEND_API_KEY` | Email API | Yes |
| `NUXT_STUDIO_TOKEN` | Studio integration | Yes |
| `NUXT_PUBLIC_SITE_URL` | Public site URL | Yes |

---

## 3. GitHub Actions Research

### 3.1 Workflow Triggers

| Event | Use Case |
|-------|----------|
| `push: branches: [master]` | Production deployments |
| `workflow_dispatch` | Manual triggers |
| `pull_request` | PR validation (build only) |
| `push: paths: ['app/content/**']` | Content-specific workflows |

### 3.2 Bun Setup Action

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v1
  with:
    bun-version: latest
```

### 3.3 Caching Strategy

```yaml
- name: Cache dependencies
  uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}
```

### 3.4 Webhook Deployment Pattern

GitHub Actions triggers Dokploy via HTTP POST:
```bash
curl -X POST "$DOKPLOY_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"ref": "refs/heads/master", "commit": "abc123"}'
```

Response validation: HTTP 2xx = success

---

## 4. Dokploy Integration Research

### 4.1 Dokploy Overview

Dokploy is a self-hosted PaaS (Platform as a Service) that:
- Manages Docker container deployments
- Provides automatic SSL via Let's Encrypt
- Supports GitHub webhook integration
- Offers zero-downtime deployments
- Includes health check monitoring

### 4.2 Installation (VPS)

```bash
# Install Dokploy
curl -sSL https://dokploy.com/install.sh | sh

# Access dashboard
# http://<vps-ip>:3000
```

### 4.3 Application Configuration

| Setting | Value |
|---------|-------|
| Name | kbrdn-dev |
| Repository | https://github.com/kbrdn1/kbrdn.dev-v2 |
| Branch | master |
| Build Type | Dockerfile |
| Port | 3000 |
| Domain | kbrdn.dev |
| SSL | Let's Encrypt (auto) |

### 4.4 Webhook Setup

1. Navigate to Dokploy dashboard → Application → Settings → Webhooks
2. Generate webhook URL (format: `https://dokploy.domain/api/webhooks/deploy/xxx`)
3. Add URL as GitHub secret `DOKPLOY_WEBHOOK_URL`

### 4.5 Deployment Flow

```
GitHub Push → GitHub Action → Build Validation → Webhook POST → Dokploy
                                                                  ↓
                                                            Git Pull
                                                                  ↓
                                                          Docker Build
                                                                  ↓
                                                          Health Check
                                                                  ↓
                                                          Traffic Switch
                                                                  ↓
                                                          Old Container Stop
```

---

## 5. Nuxt Studio Integration Research

### 5.1 Nuxt Studio Overview

Nuxt Studio is a visual CMS for @nuxt/content:
- Live editing of Markdown/MDX content
- Git-based persistence (commits to repository)
- Media management
- Real-time preview
- Collaboration features

### 5.2 Configuration Requirements

**nuxt.config.ts additions**:
```typescript
content: {
  studio: {
    enabled: true,
    gitInfo: {
      contributors: true,
      lastEditTime: true
    }
  }
}
```

**Runtime config**:
```typescript
runtimeConfig: {
  studioToken: process.env.NUXT_STUDIO_TOKEN
}
```

### 5.3 Studio Configuration File

Location: `.studio/config.json`

Defines:
- Collection schemas and field types
- Media upload configuration
- GitHub integration settings
- Auto-commit messages

### 5.4 Content Sync Flow

```
Editor saves in Studio → Studio commits to GitHub → Push triggers Actions
                                                          ↓
                                                    studio-sync.yml
                                                          ↓
                                                    Notify Studio API
                                                          ↓
                                                    deploy.yml
                                                          ↓
                                                    Dokploy deployment
```

### 5.5 Studio API Webhook

```bash
curl -X POST "https://api.nuxt.studio/webhooks/content-updated" \
  -H "Authorization: Bearer $NUXT_STUDIO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"repository": "kbrdn1/kbrdn.dev-v2", "branch": "master"}'
```

---

## 6. SSL/TLS Configuration

### 6.1 Let's Encrypt via Dokploy

Dokploy handles SSL automatically:
1. Domain added to application settings
2. Dokploy requests certificate from Let's Encrypt
3. Auto-renewal before expiration (typically 30 days before)
4. HTTP → HTTPS redirect handled automatically

### 6.2 DNS Requirements

| Record | Name | Value |
|--------|------|-------|
| A | @ | 72.60.212.44 |
| A | www | 72.60.212.44 |

Propagation: Allow 24-48 hours for global DNS propagation

---

## 7. Health Check Strategy

### 7.1 Docker Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD wget --spider -q http://localhost:3000 || exit 1
```

### 7.2 Dokploy Health Monitoring

Dokploy performs:
- Container health status checks
- HTTP endpoint monitoring
- Automatic restart on failure
- Deployment rollback on health check failure

### 7.3 Deployment Validation

Post-deployment checks:
1. HTTP 200 from `/` endpoint
2. SSL certificate valid
3. All content collections accessible
4. No console errors in browser

---

## 8. Implementation Recommendations

### 8.1 Priority Order

1. **Bug Fix**: Fix content.config.ts path immediately
2. **Docker**: Create Dockerfile and .dockerignore
3. **GitHub Actions**: Set up deploy.yml workflow
4. **Dokploy**: Configure VPS and application
5. **Studio**: Add .studio/config.json and nuxt.config updates
6. **MDC Components**: Optional enhancement for content

### 8.2 Risk Mitigation

| Risk | Mitigation |
|------|------------|
| First deployment failure | Test Docker build locally first |
| DNS propagation delay | Use IP address for initial testing |
| Studio token security | Use GitHub secrets, never commit |
| Webhook timeout | Implement retry logic in workflow |

### 8.3 Testing Strategy

1. **Local**: `docker build && docker run` for container validation
2. **Staging**: Deploy to Dokploy with test domain
3. **Production**: Deploy to kbrdn.dev after staging validation

---

## 9. References

- [Nuxt Documentation](https://nuxt.com/docs)
- [Nuxt Content](https://content.nuxt.com)
- [Nuxt Studio](https://nuxt.studio/docs)
- [Dokploy Documentation](https://dokploy.com/docs)
- [Bun Docker Images](https://hub.docker.com/r/oven/bun)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Let's Encrypt](https://letsencrypt.org/docs)
