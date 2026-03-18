# Quickstart: Automated Deployment Pipeline

**Feature**: #1 Dokploy Deployment
**Date**: 2026-01-03
**Estimated Setup Time**: 30-45 minutes

## Prerequisites

Before starting, ensure you have:

- [ ] SSH access to VPS at `72.60.212.44`
- [ ] GitHub repository admin access for secrets
- [ ] Accounts created for: [Nuxt Studio](https://nuxt.studio), [Resend](https://resend.com)
- [ ] Domain DNS access to configure `kbrdn.dev`

## Quick Setup Steps

### 1. Local: Fix Content Bug (2 min)

```bash
# Edit content.config.ts line 35
# Change: include: 'blog/**/*.{md,mdx}'
# To:     include: 'blogs/**/*.{md,mdx}'
```

### 2. Local: Create Docker Files (5 min)

Create `Dockerfile`:
```dockerfile
FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
RUN addgroup --system --gid 1001 nuxt && adduser --system --uid 1001 nuxt
COPY --from=builder --chown=nuxt:nuxt /app/.output ./.output
USER nuxt
EXPOSE 3000
CMD ["bun", "run", ".output/server/index.mjs"]
```

Create `.dockerignore`:
```
node_modules
.nuxt
.output
.git
.env*
!.env.example
*.md
docs/
```

### 3. Local: Test Docker Build (5 min)

```bash
# Build image
docker build -t kbrdn-dev .

# Test run (Ctrl+C to stop)
docker run -p 3000:3000 kbrdn-dev

# Verify at http://localhost:3000
```

### 4. VPS: Install Dokploy (10 min)

```bash
# SSH into VPS
ssh root@72.60.212.44

# Install Dokploy
curl -sSL https://dokploy.com/install.sh | sh

# Note the dashboard URL (usually http://72.60.212.44:3000)
```

### 5. Dokploy: Configure Application (5 min)

1. Open Dokploy dashboard
2. Create new application:
   - **Name**: `kbrdn-dev`
   - **Repository**: `https://github.com/kbrdn1/kbrdn.dev-v2`
   - **Branch**: `master`
   - **Build Type**: Dockerfile
   - **Port**: 3000
3. Add environment variables:
   ```
   NODE_ENV=production
   GITHUB_TOKEN=<your-token>
   RESEND_API_KEY=<your-key>
   NUXT_STUDIO_TOKEN=<your-token>
   NUXT_PUBLIC_SITE_URL=https://kbrdn.dev
   ```
4. Configure domain: `kbrdn.dev`
5. Enable SSL (Let's Encrypt)
6. Copy webhook URL from Settings → Webhooks

### 6. GitHub: Configure Secrets (5 min)

Go to Repository → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `DOKPLOY_WEBHOOK_URL` | (from Dokploy step 6) |
| `GH_TOKEN` | [Create at GitHub Settings](https://github.com/settings/tokens) |
| `RESEND_API_KEY` | [Get from Resend](https://resend.com/api-keys) |
| `NUXT_STUDIO_TOKEN` | (from Nuxt Studio project settings) |

### 7. Local: Create GitHub Actions (5 min)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to VPS
on:
  push:
    branches: [master]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install --frozen-lockfile
      - run: bun run build
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Dokploy
        run: |
          curl -X POST "${{ secrets.DOKPLOY_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{"ref": "${{ github.ref }}", "commit": "${{ github.sha }}"}'
```

### 8. DNS: Configure Records (variable time)

Configure DNS records at your domain registrar (e.g., Cloudflare, Namecheap, GoDaddy):

| Type | Name | Value | TTL | Purpose |
|------|------|-------|-----|---------|
| A | @ | 72.60.212.44 | 300 | Root domain (kbrdn.dev) |
| A | www | 72.60.212.44 | 300 | WWW subdomain |
| CNAME | dokploy | kbrdn.dev | 300 | Dokploy dashboard (optional) |

**Important DNS Notes:**
- TTL of 300 (5 minutes) allows faster propagation during setup
- After verified working, increase TTL to 3600 (1 hour) for caching
- DNS propagation can take 5 minutes to 48 hours depending on registrar
- Use `dig kbrdn.dev` or [dnschecker.org](https://dnschecker.org) to verify

**If using Cloudflare:**
- Set proxy status to "DNS only" (gray cloud) initially for SSL setup
- After Dokploy SSL is configured, you can enable orange cloud proxy

### 9. SSL: Configure Let's Encrypt (5 min)

In Dokploy dashboard, configure SSL:

1. **Navigate to Application → Domains**
2. **Add domain**: `kbrdn.dev`
3. **Enable SSL**:
   - Certificate type: Let's Encrypt
   - Auto-renew: Enabled (default)
4. **Add www redirect** (optional):
   - Add domain: `www.kbrdn.dev`
   - Enable redirect to main domain

**SSL Verification:**
```bash
# Check certificate from command line
curl -vI https://kbrdn.dev 2>&1 | grep -A 6 "Server certificate"

# Or use online checker
# https://www.ssllabs.com/ssltest/analyze.html?d=kbrdn.dev
```

**Troubleshooting SSL:**
- Ensure DNS is pointing to VPS before enabling SSL
- Let's Encrypt rate limits: 5 certificates per domain per week
- Check Dokploy logs: `docker logs dokploy`
- Verify port 80 is accessible for ACME challenge

### 10. Deploy! (2 min)

```bash
git add .
git commit -m "✨ feat(deploy): add Docker and CI/CD configuration"
git push origin master
```

Monitor deployment:
- GitHub: Actions tab → Deploy workflow
- Dokploy: Dashboard → Application logs

## Verification Checklist

After deployment completes:

- [ ] Site loads at https://kbrdn.dev
- [ ] SSL certificate shows as valid
- [ ] Blog posts display correctly (confirms content bug fixed)
- [ ] GitHub Actions shows green checkmark
- [ ] Dokploy shows "Running" status

## Troubleshooting

### Build fails in GitHub Actions
```bash
# Check Bun version compatibility
bun --version

# Verify lockfile is committed
git status bun.lock
```

### Dokploy webhook not triggering
```bash
# Test webhook manually
curl -X POST "your-webhook-url" -d '{}'
```

### SSL certificate not issued
- Wait 5-10 minutes for Let's Encrypt
- Verify DNS is pointing to VPS IP
- Check Dokploy logs for certificate errors

### Container health check failing
```bash
# SSH to VPS and check container logs
docker logs kbrdn-dev

# Verify port binding
docker ps
```

## Next Steps

After basic deployment is working:

1. Add Nuxt Studio integration (`.studio/config.json`)
2. Create studio-sync.yml workflow for content updates
3. Add MDC components for enhanced content editing
4. Set up monitoring/alerts in Dokploy

See [plan.md](./plan.md) for full implementation details.
