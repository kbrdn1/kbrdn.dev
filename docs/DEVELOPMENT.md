# Development Guide

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Git](https://git-scm.com)
- A code editor (VS Code recommended)

## Getting Started

### 1. Clone the Repository

```bash
git clone git@github.com:kbrdn1/kbrdn.dev.git
cd kbrdn.dev
```

### 2. Install Dependencies

```bash
make install
# or
bun install
```

### 3. Start Development Server

```bash
make dev
# or
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Available Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start development server |
| `make build` | Build for production |
| `make preview` | Preview production build |
| `make generate` | Generate static site |
| `make lint` | Run ESLint |
| `make typecheck` | Run TypeScript check |
| `make clean` | Clean build artifacts |
| `make fmt` | Format code |

## Development Workflow

### Creating a New Component

1. Create file in appropriate directory:
   ```bash
   touch app/components/ui/MyComponent.vue
   ```

2. Use the component (auto-imported):
   ```vue
   <template>
     <UiMyComponent />
   </template>
   ```

### Adding a New Page

1. Create file in `app/pages/`:
   ```bash
   touch app/pages/about.vue
   ```

2. The page will be available at `/about`

### Adding Content

1. Create markdown file in `app/content/`:
   ```bash
   touch app/content/blog/my-post.md
   ```

2. Add frontmatter:
   ```markdown
   ---
   title: My Post
   description: A description
   publishedAt: 2025-01-01
   ---

   Content here...
   ```

### Adding Translations

1. Add keys in `i18n/locales/en.ts`:
   ```typescript
   export default {
     mySection: {
       title: 'My Title',
       description: 'My description'
     }
   }
   ```

2. Add French translations in `i18n/locales/fr.ts`:
   ```typescript
   export default {
     mySection: {
       title: 'Mon Titre',
       description: 'Ma description'
     }
   }
   ```

3. Use in component:
   ```vue
   <script setup>
   const { t } = useI18n()
   </script>

   <template>
     <h1>{{ t('mySection.title') }}</h1>
   </template>
   ```

## Code Style

### Vue Components

- Use `<script setup lang="ts">` for all components
- Use Composition API
- Follow naming conventions:
  - Components: PascalCase
  - Files: PascalCase.vue
  - Props/emits: camelCase

### TypeScript

- Strict mode enabled
- Define interfaces for props
- Use type inference where possible

### CSS

- Use Tailwind CSS utilities
- Follow utility-first approach
- Use `cn()` helper for conditional classes

## Debugging

### Vue DevTools

Install [Vue DevTools](https://devtools.vuejs.org/) browser extension.

### Nuxt DevTools

Press `Shift + Alt + D` to open Nuxt DevTools.

### Common Issues

#### Hydration Mismatch

Use `<ClientOnly>` for client-only components:

```vue
<ClientOnly>
  <ThemeToggle />
</ClientOnly>
```

#### Type Errors

Run type check:
```bash
make typecheck
```

#### Cache Issues

Clear cache:
```bash
make clean
bun run dev
```
