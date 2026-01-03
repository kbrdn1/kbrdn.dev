# Architecture

This document describes the architecture of kbrdn.dev portfolio.

## Overview

```
kbrdn.dev/
├── app/                    # Application source code
│   ├── components/         # Vue components
│   ├── composables/        # Vue composables
│   ├── content/            # Markdown content
│   ├── layouts/            # Page layouts
│   ├── pages/              # File-based routing
│   └── utils/              # Utility functions
├── docs/                   # Documentation
├── i18n/                   # Internationalization
├── public/                 # Static assets
├── server/                 # Server middleware
└── .github/                # GitHub templates
```

## Tech Stack

### Core
- **Nuxt 4** - Vue.js meta-framework with SSR/SSG
- **Vue 3** - Composition API
- **TypeScript** - Type safety

### UI
- **Nuxt UI** - Component library
- **Tailwind CSS v4** - Utility-first CSS

### Content
- **Nuxt Content** - Markdown-based CMS
- **MDC** - Markdown Components

### Optimization
- **Nuxt Image** - Image optimization
- **Nuxt Fonts** - Font optimization

## Directory Details

### `/app/components/`

Organized by domain:

```
components/
├── home/           # Homepage sections
│   ├── Hero.vue
│   ├── Projects.vue
│   ├── Experiences.vue
│   └── ...
├── layout/         # Layout components
│   ├── Header.vue
│   ├── Footer.vue
│   └── DottedBackground.vue
└── ui/             # Reusable UI
    ├── ThemeToggle.vue
    ├── LanguageSwitcher.vue
    └── ...
```

### `/app/composables/`

Reusable Vue composition functions:

- `useGitHubContributions` - Fetch GitHub contribution data
- `useGitHubRepos` - Fetch GitHub repositories
- `useReducedMotion` - Accessibility: reduced motion preference

### `/app/content/`

Markdown content with frontmatter:

```
content/
├── index.md        # Homepage content
├── blog/           # Blog posts
└── pages/          # Static pages
```

### `/i18n/`

Internationalization files:

```
i18n/
├── locales/
│   ├── en.ts       # English translations
│   └── fr.ts       # French translations
└── config.ts       # i18n configuration
```

## Data Flow

```
┌─────────────────┐
│   Markdown      │
│   Content       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Nuxt Content   │
│   Collections   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Vue Pages     │
│   & Components  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SSR/SSG       │
│   Output        │
└─────────────────┘
```

## Rendering Strategy

- **SSR** - Server-side rendering for dynamic content
- **ISR** - Incremental static regeneration for blog posts
- **CSR** - Client-side rendering for interactive components

## Performance Considerations

1. **Image Optimization**: All images processed by Nuxt Image
2. **Font Loading**: Fonts preloaded with Nuxt Fonts
3. **Code Splitting**: Automatic by Nuxt
4. **Lazy Loading**: Components and images lazy-loaded
5. **Caching**: Aggressive caching headers

## Security

- **CSP**: Content Security Policy headers
- **HTTPS**: Enforced in production
- **No Secrets**: No secrets in client-side code
