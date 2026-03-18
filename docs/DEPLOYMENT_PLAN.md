# Plan de Déploiement - kbrdn.dev-v2

> Guide complet pour configurer le déploiement automatique avec Dokploy et Nuxt Studio

## Table des matières

- [Analyse du contexte](#analyse-du-contexte)
- [Phase 1 : Corrections et fichiers de configuration](#phase-1--corrections-et-fichiers-de-configuration)
- [Phase 2 : GitHub Actions](#phase-2--github-actions)
- [Phase 3 : Configuration Dokploy sur VPS](#phase-3--configuration-dokploy-sur-vps)
- [Phase 4 : Nuxt Studio Integration](#phase-4--nuxt-studio-integration)
- [Phase 5 : Composants MDC Custom](#phase-5--composants-mdc-custom)
- [Phase 6 : Secrets GitHub](#phase-6--secrets-github)
- [Phase 7 : Flux de déploiement](#phase-7--flux-de-déploiement)
- [Checklist de mise en production](#checklist-de-mise-en-production)

---

## Analyse du contexte

### Ce qui existe déjà

| Élément | Détails |
|---------|---------|
| Framework | Nuxt 4 avec @nuxt/ui v4 |
| Modules | @nuxt/content, @nuxt/fonts, @nuxt/image, @nuxtjs/i18n |
| Collections | `pages`, `blog`, `projects`, `skills`, `stacks`, `experiences` |
| Contenu | 4 articles .mdx dans `app/content/blogs/` |
| Composants | Hero, Projects, Experiences, GitHubChart, etc. |
| Pages | index, about, blog, blog/[slug] |

### Bug détecté

> **CRITIQUE** : La collection `blog` dans `content.config.ts` cherche dans `blog/**/*.mdx` mais le dossier réel s'appelle `blogs/` (avec un 's')

### VPS Hostinger

| Paramètre | Valeur |
|-----------|--------|
| IP | `72.60.212.44` |
| OS | Ubuntu 24.04 with Claude Code |
| CPU | 4 cores |
| RAM | 16 GB |
| Stockage | 200 GB SSD |
| Accès | `ssh root@72.60.212.44` |

---

## Phase 1 : Corrections et fichiers de configuration

### 1.1 Corriger `content.config.ts`

**Fichier** : `content.config.ts`

**Problème** : Ligne 35, la source pointe vers `blog/` au lieu de `blogs/`

**Correction** :

```typescript
blog: defineCollection({
  type: 'page',
  source: {
    include: 'blogs/**/*.{md,mdx}',  // ← Changer 'blog' en 'blogs'
    cwd: contentDir
  },
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    publishedAt: z.string().optional(),
    updatedAt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional().default('kbrdn'),
    cover: z.string().optional(),
    draft: z.boolean().optional().default(false),
    featured: z.boolean().optional().default(false),
  }),
}),
```

### 1.2 Créer `Dockerfile`

**Fichier** : `Dockerfile`

```dockerfile
# ============================================
# Dockerfile pour kbrdn.dev-v2
# Optimisé pour Bun + Nuxt 4
# ============================================

FROM oven/bun:1-alpine AS base
WORKDIR /app

# ============================================
# Stage: Dependencies
# ============================================
FROM base AS deps

# Copier les fichiers de dépendances
COPY package.json bun.lock ./

# Installer les dépendances
RUN bun install --frozen-lockfile

# ============================================
# Stage: Builder
# ============================================
FROM base AS builder

# Copier les dépendances installées
COPY --from=deps /app/node_modules ./node_modules

# Copier le code source
COPY . .

# Build l'application
RUN bun run build

# ============================================
# Stage: Production
# ============================================
FROM base AS runner

# Variables d'environnement
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nuxt && \
    adduser --system --uid 1001 nuxt

# Copier l'application buildée
COPY --from=builder --chown=nuxt:nuxt /app/.output ./.output

# Changer d'utilisateur
USER nuxt

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["bun", "run", ".output/server/index.mjs"]
```

### 1.3 Créer `.dockerignore`

**Fichier** : `.dockerignore`

```
# Dependencies
node_modules

# Nuxt build outputs
.nuxt
.output
dist

# Git
.git
.gitignore

# Environment files
.env
.env.*
!.env.example

# IDE
.vscode
.idea
.zed
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage
.nyc_output

# Misc
README.md
docs/
*.md
Session.vim
```

### 1.4 Créer `docker-compose.yml` (développement local)

**Fichier** : `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - NUXT_STUDIO_TOKEN=${NUXT_STUDIO_TOKEN}
      - NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL:-http://localhost:3000}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

---

## Phase 2 : GitHub Actions

### 2.1 Workflow de déploiement principal

**Fichier** : `.github/workflows/deploy.yml`

```yaml
name: Deploy to VPS via Dokploy

on:
  push:
    branches:
      - master
  workflow_dispatch:
    inputs:
      force_deploy:
        description: 'Force deployment even without changes'
        required: false
        default: 'false'

env:
  NODE_ENV: production

jobs:
  # ============================================
  # Job: Build & Test
  # ============================================
  build:
    name: Build Application
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Cache dependencies
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Type check
        run: bun run --bun nuxt typecheck
        continue-on-error: true

      - name: Build application
        run: bun run build
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          NUXT_PUBLIC_SITE_URL: https://kbrdn.dev

  # ============================================
  # Job: Deploy to Dokploy
  # ============================================
  deploy:
    name: Deploy to VPS
    runs-on: ubuntu-latest
    needs: build

    steps:
      - name: Trigger Dokploy deployment
        run: |
          response=$(curl -s -w "\n%{http_code}" -X POST "${{ secrets.DOKPLOY_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{
              "ref": "${{ github.ref }}",
              "commit": "${{ github.sha }}",
              "author": "${{ github.actor }}",
              "message": "${{ github.event.head_commit.message }}"
            }')

          http_code=$(echo "$response" | tail -n1)
          body=$(echo "$response" | sed '$d')

          echo "Response: $body"
          echo "HTTP Code: $http_code"

          if [ "$http_code" -lt 200 ] || [ "$http_code" -ge 300 ]; then
            echo "Deployment webhook failed with status $http_code"
            exit 1
          fi

      - name: Notify success
        if: success()
        run: echo "✅ Deployment triggered successfully!"

      - name: Notify failure
        if: failure()
        run: echo "❌ Deployment failed!"
```

### 2.2 Workflow de synchronisation Nuxt Studio

**Fichier** : `.github/workflows/studio-sync.yml`

```yaml
name: Nuxt Studio Sync

on:
  push:
    branches:
      - master
    paths:
      - 'app/content/**'
  pull_request:
    types: [opened, synchronize]
    paths:
      - 'app/content/**'

jobs:
  notify-studio:
    name: Notify Nuxt Studio
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get changed files
        id: changed-files
        run: |
          if [ "${{ github.event_name }}" == "pull_request" ]; then
            files=$(git diff --name-only ${{ github.event.pull_request.base.sha }} ${{ github.sha }} | grep '^app/content/' || true)
          else
            files=$(git diff --name-only ${{ github.event.before }} ${{ github.sha }} | grep '^app/content/' || true)
          fi
          echo "files<<EOF" >> $GITHUB_OUTPUT
          echo "$files" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Notify Nuxt Studio
        if: steps.changed-files.outputs.files != ''
        run: |
          curl -X POST "https://api.nuxt.studio/webhooks/content-updated" \
            -H "Authorization: Bearer ${{ secrets.NUXT_STUDIO_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "repository": "${{ github.repository }}",
              "branch": "${{ github.ref_name }}",
              "commit": "${{ github.sha }}",
              "paths": ["app/content"],
              "changedFiles": ${{ toJSON(steps.changed-files.outputs.files) }}
            }' || echo "Studio notification failed (non-critical)"
```

---

## Phase 3 : Configuration Dokploy sur VPS

### 3.1 Installation de Dokploy

```bash
# Se connecter au VPS
ssh root@72.60.212.44

# Installer Dokploy
curl -sSL https://dokploy.com/install.sh | sh

# Vérifier l'installation
dokploy --version

# Accéder à l'interface Dokploy
# URL: http://72.60.212.44:3000 (port par défaut)
```

### 3.2 Configuration de l'application dans Dokploy

| Paramètre | Valeur |
|-----------|--------|
| **Name** | `kbrdn-dev` |
| **Repository** | `https://github.com/kbrdn1/kbrdn.dev-v2` |
| **Branch** | `master` |
| **Build Type** | `Dockerfile` |
| **Dockerfile Path** | `./Dockerfile` |
| **Build Context** | `.` |
| **Port** | `3000` |
| **Domain** | `kbrdn.dev` |
| **SSL** | Enabled (Let's Encrypt) |

### 3.3 Variables d'environnement Dokploy

```env
# Application
NODE_ENV=production

# GitHub API (pour le chart de contributions)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Resend API (pour le formulaire de contact)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Nuxt Studio
NUXT_STUDIO_TOKEN=nstudio_xxxxxxxxxxxxxxxxxxxx

# Site URL
NUXT_PUBLIC_SITE_URL=https://kbrdn.dev
```

### 3.4 Configuration du webhook Dokploy

1. Dans Dokploy, aller dans **Settings** → **Webhooks**
2. Créer un nouveau webhook
3. Copier l'URL générée (format : `https://dokploy.kbrdn.dev/api/webhooks/deploy/xxx`)
4. Ajouter cette URL dans les secrets GitHub comme `DOKPLOY_WEBHOOK_URL`

### 3.5 Configuration DNS

Ajouter ces enregistrements DNS chez votre registrar :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | `@` | `72.60.212.44` | 3600 |
| A | `www` | `72.60.212.44` | 3600 |
| CNAME | `dokploy` | `kbrdn.dev` | 3600 |

---

## Phase 4 : Nuxt Studio Integration

### 4.1 Mettre à jour `nuxt.config.ts`

**Modifications à apporter** :

```typescript
export default defineNuxtConfig({
  // ... configuration existante ...

  // Ajouter la configuration Content avec Studio
  content: {
    studio: {
      enabled: true,
      gitInfo: {
        contributors: true,
        lastEditTime: true
      }
    },
    sources: {
      content: {
        driver: "fs",
        base: "./app/content",
      },
    },
    // Syntax highlighting pour les blocs de code
    highlight: {
      theme: {
        default: 'github-light',
        dark: 'github-dark',
      },
      preload: ['typescript', 'javascript', 'vue', 'bash', 'json', 'yaml', 'markdown']
    }
  },

  // Mettre à jour runtimeConfig
  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN || "",
    resendApiKey: process.env.RESEND_API_KEY || "",
    studioToken: process.env.NUXT_STUDIO_TOKEN || "",

    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://kbrdn.dev",
    }
  },
})
```

### 4.2 Créer `.studio/config.json`

**Fichier** : `.studio/config.json`

```json
{
  "name": "kbrdn.dev",
  "description": "Portfolio personnel de Kevin Music Director",
  "contentDir": "app/content",
  "branch": "master",
  "collections": {
    "blog": {
      "icon": "i-heroicons-document-text",
      "label": "Blog Posts",
      "labelField": "title",
      "sortBy": "publishedAt",
      "sortDirection": "desc",
      "fields": {
        "title": { "required": true },
        "description": { "textarea": true },
        "publishedAt": { "type": "date" },
        "tags": { "type": "array" },
        "cover": { "type": "image" },
        "draft": { "type": "boolean", "default": false },
        "featured": { "type": "boolean", "default": false }
      }
    },
    "projects": {
      "icon": "i-heroicons-folder",
      "label": "Projects",
      "labelField": "title",
      "sortBy": "date",
      "sortDirection": "desc"
    },
    "experiences": {
      "icon": "i-heroicons-briefcase",
      "label": "Experiences",
      "labelField": "title",
      "sortBy": "startDate",
      "sortDirection": "desc"
    },
    "skills": {
      "icon": "i-heroicons-academic-cap",
      "label": "Skills",
      "labelField": "title"
    },
    "stacks": {
      "icon": "i-heroicons-cube",
      "label": "Tech Stacks",
      "labelField": "title"
    }
  },
  "media": {
    "driver": "github",
    "directory": "public/images"
  },
  "integrations": {
    "github": {
      "enabled": true,
      "autoCommit": true,
      "commitMessage": "chore(content): update via Nuxt Studio"
    }
  }
}
```

### 4.3 Connexion à Nuxt Studio

1. Aller sur [nuxt.studio](https://nuxt.studio)
2. Cliquer sur "New Project"
3. Connecter le repository GitHub `kbrdn1/kbrdn.dev-v2`
4. Configurer :
   - **Content Directory** : `app/content`
   - **Branch** : `master`
5. Récupérer le token d'API et l'ajouter aux secrets GitHub

---

## Phase 5 : Composants MDC Custom

### 5.1 Structure des composants content

```
app/components/content/
├── Alert.vue
├── CodeGroup.vue
├── Callout.vue
├── ImageGallery.vue
└── ProjectCard.vue
```

### 5.2 Créer `app/components/content/Alert.vue`

```vue
<template>
  <UAlert
    :color="color"
    :variant="variant"
    :icon="icon"
    :title="title"
    :description="description"
  >
    <template #default>
      <slot />
    </template>
  </UAlert>
</template>

<script setup lang="ts">
defineProps<{
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'
  variant?: 'solid' | 'outline' | 'soft' | 'subtle'
  icon?: string
  title?: string
  description?: string
}>()
</script>
```

### 5.3 Créer `app/components/content/Callout.vue`

```vue
<template>
  <div
    :class="[
      'my-4 p-4 rounded-lg border-l-4',
      variantClasses[type]
    ]"
  >
    <div class="flex items-start gap-3">
      <UIcon
        :name="iconMap[type]"
        :class="['w-5 h-5 mt-0.5', iconColorClasses[type]]"
      />
      <div class="flex-1">
        <p v-if="title" class="font-semibold mb-1">{{ title }}</p>
        <div class="text-sm">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type CalloutType = 'info' | 'warning' | 'danger' | 'success' | 'tip'

defineProps<{
  type?: CalloutType
  title?: string
}>()

const iconMap: Record<CalloutType, string> = {
  info: 'i-heroicons-information-circle',
  warning: 'i-heroicons-exclamation-triangle',
  danger: 'i-heroicons-x-circle',
  success: 'i-heroicons-check-circle',
  tip: 'i-heroicons-light-bulb'
}

const variantClasses: Record<CalloutType, string> = {
  info: 'bg-blue-500/10 border-blue-500',
  warning: 'bg-yellow-500/10 border-yellow-500',
  danger: 'bg-red-500/10 border-red-500',
  success: 'bg-green-500/10 border-green-500',
  tip: 'bg-purple-500/10 border-purple-500'
}

const iconColorClasses: Record<CalloutType, string> = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  danger: 'text-red-500',
  success: 'text-green-500',
  tip: 'text-purple-500'
}
</script>
```

### 5.4 Créer `app/components/content/CodeGroup.vue`

```vue
<template>
  <UTabs :items="tabs" class="my-4">
    <template #content="{ item }">
      <div class="p-4 bg-neutral-900 rounded-b-lg">
        <ContentSlot :use="item.slot" />
      </div>
    </template>
  </UTabs>
</template>

<script setup lang="ts">
const slots = useSlots()

const tabs = computed(() => {
  const slotNames = Object.keys(slots).filter(name => name !== 'default')
  return slotNames.map((name, index) => ({
    key: index,
    label: name,
    slot: name
  }))
})
</script>
```

### 5.5 Exemple d'utilisation dans un article MDX

```markdown
---
title: "Guide de déploiement"
description: "Comment déployer une app Nuxt sur un VPS"
publishedAt: "2026-01-03"
tags: ["nuxt", "devops", "tutorial"]
---

# Guide de déploiement

Bienvenue dans ce guide !

::Callout{type="info" title="Prérequis"}
Assurez-vous d'avoir un VPS avec Docker installé.
::

## Installation

::CodeGroup
#bash
```bash
bun install
bun run build
```

#docker
```bash
docker build -t myapp .
docker run -p 3000:3000 myapp
```
::

::Alert{color="success" icon="i-heroicons-check-circle" title="Félicitations !"}
Votre application est maintenant déployée.
::
```

---

## Phase 6 : Secrets GitHub

### Configuration des secrets

Aller dans **Settings** → **Secrets and variables** → **Actions** du repository GitHub.

| Secret | Description | Exemple |
|--------|-------------|---------|
| `DOKPLOY_WEBHOOK_URL` | URL du webhook Dokploy pour déclencher les déploiements | `https://dokploy.kbrdn.dev/api/webhooks/deploy/abc123` |
| `GH_TOKEN` | Token GitHub pour l'API (chart de contributions) | `ghp_xxxxxxxxxxxxxxxxxxxx` |
| `RESEND_API_KEY` | Clé API Resend pour le formulaire de contact | `re_xxxxxxxxxxxxxxxxxxxx` |
| `NUXT_STUDIO_TOKEN` | Token d'API Nuxt Studio | `nstudio_xxxxxxxxxxxxxxxxxxxx` |

### Création des tokens

#### GitHub Token (GH_TOKEN)
1. Aller sur [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Créer un token avec les scopes : `read:user`, `repo`
3. Copier le token

#### Resend API Key
1. Aller sur [resend.com/api-keys](https://resend.com/api-keys)
2. Créer une nouvelle clé API
3. Copier la clé

#### Nuxt Studio Token
1. Se connecter sur [nuxt.studio](https://nuxt.studio)
2. Aller dans les paramètres du projet
3. Générer un token d'API
4. Copier le token

---

## Phase 7 : Flux de déploiement

### Schéma du flux complet

```
┌──────────────────────────────────────────────────────────────────┐
│                        FLUX DE DÉPLOIEMENT                        │
└──────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐
│  Nuxt Studio    │──edit──→│     GitHub       │
│  (CMS Editor)   │         │   Repository     │
└─────────────────┘         └────────┬─────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
┌───────────────┐         ┌──────────────────┐         ┌─────────────────┐
│ GitHub Action │         │  GitHub Action   │         │  GitHub Action  │
│   (Build)     │         │  (Studio Sync)   │         │   (Deploy)      │
└───────┬───────┘         └──────────────────┘         └────────┬────────┘
        │                                                       │
        ▼                                                       ▼
┌───────────────┐                                      ┌─────────────────┐
│   Artifact    │                                      │    Dokploy      │
│   (Build)     │                                      │   (VPS Webhook) │
└───────────────┘                                      └────────┬────────┘
                                                                │
                                                                ▼
                                                       ┌─────────────────┐
                                                       │   Docker Build  │
                                                       │   + Deploy      │
                                                       └────────┬────────┘
                                                                │
                                                                ▼
                                                       ┌─────────────────┐
                                                       │   Production    │
                                                       │   kbrdn.dev     │
                                                       └─────────────────┘
```

### Processus détaillé

1. **Édition du contenu**
   - Via Nuxt Studio (interface CMS)
   - Ou directement dans les fichiers MDX
   - Commit automatique sur GitHub

2. **Déclenchement GitHub Actions**
   - Push sur `master` déclenche le workflow `deploy.yml`
   - Modification dans `app/content/` déclenche aussi `studio-sync.yml`

3. **Build & Validation**
   - Installation des dépendances avec Bun
   - Type checking (optionnel)
   - Build de l'application Nuxt

4. **Déploiement via Dokploy**
   - Appel du webhook Dokploy
   - Dokploy pull le code depuis GitHub
   - Build de l'image Docker
   - Déploiement du nouveau container
   - Health check automatique

5. **Mise à jour du site**
   - Le site est accessible sur `kbrdn.dev`
   - SSL/TLS géré par Let's Encrypt via Dokploy

---

## Checklist de mise en production

### Fichiers à créer

- [ ] `Dockerfile`
- [ ] `.dockerignore`
- [ ] `docker-compose.yml`
- [ ] `.github/workflows/deploy.yml`
- [ ] `.github/workflows/studio-sync.yml`
- [ ] `.studio/config.json`
- [ ] `app/components/content/Alert.vue`
- [ ] `app/components/content/Callout.vue`
- [ ] `app/components/content/CodeGroup.vue`

### Corrections à appliquer

- [ ] Fixer `content.config.ts` : changer `blog/` en `blogs/`
- [ ] Mettre à jour `nuxt.config.ts` avec la config Studio
- [ ] Ajouter les champs manquants au schema blog (author, cover, draft, featured)

### Configurations externes

- [ ] Installer Dokploy sur le VPS (`ssh root@72.60.212.44`)
- [ ] Créer l'application dans Dokploy
- [ ] Configurer les variables d'environnement dans Dokploy
- [ ] Générer et configurer le webhook Dokploy
- [ ] Configurer les secrets GitHub (4 secrets)
- [ ] Configurer les enregistrements DNS
- [ ] Connecter le repository à Nuxt Studio

### Tests de validation

- [ ] Build local : `bun run build`
- [ ] Build Docker : `docker build -t kbrdn-dev .`
- [ ] Test Docker : `docker run -p 3000:3000 kbrdn-dev`
- [ ] Push sur master et vérifier le workflow GitHub Actions
- [ ] Vérifier le déploiement sur Dokploy
- [ ] Tester l'édition via Nuxt Studio
- [ ] Vérifier le certificat SSL sur `kbrdn.dev`

### Commandes utiles

```bash
# Build local
bun run build

# Preview production
bun run preview

# Build Docker
docker build -t kbrdn-dev .

# Run Docker
docker run -p 3000:3000 \
  -e GITHUB_TOKEN=ghp_xxx \
  -e RESEND_API_KEY=re_xxx \
  kbrdn-dev

# Docker Compose
docker compose up -d

# Connexion VPS
ssh root@72.60.212.44

# Voir les logs Dokploy
dokploy logs kbrdn-dev
```

---

## Ressources

- [Documentation Nuxt](https://nuxt.com/docs)
- [Documentation Nuxt Content](https://content.nuxt.com)
- [Documentation Nuxt Studio](https://nuxt.studio/docs)
- [Documentation Dokploy](https://dokploy.com/docs)
- [Documentation Bun](https://bun.sh/docs)

---

> **Note** : Ce plan a été généré le 3 janvier 2026 pour le projet kbrdn.dev-v2
