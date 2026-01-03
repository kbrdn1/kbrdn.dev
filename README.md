# kbrdn.dev - Portfolio v2

Modern portfolio website built with Nuxt 4 and Nuxt UI.

## ✨ Features

- ⚡ **Nuxt 4** - Latest version with optimal performance
- 🎯 **Sharp Corners** - Distinctive square design elements
- 📱 **Fully Responsive** - Works seamlessly on all devices
- 📝 **Content Management** - Powered by Nuxt Content for easy updates
- 🔍 **SEO Optimized** - Built-in meta tags and OpenGraph support
- ♿ **Accessible** - WCAG compliant components
- 🚀 **Fast** - Optimized for Core Web Vitals

## 🛠️ Tech Stack

### Framework & Core

- [Nuxt 4](https://nuxt.com) - Vue.js meta-framework
- [Vue 3](https://vuejs.org) - Progressive JavaScript framework
- [TypeScript](https://www.typescriptlang.org) - Type-safe development

### UI & Styling

- [Nuxt UI](https://ui.nuxt.com) - Component library
- [Tailwind CSS v4](https://tailwindcss.com) - Utility-first CSS

### Content & Tools

- [Nuxt Content](https://content.nuxt.com) - File-based CMS
- [Nuxt Fonts](https://github.com/nuxt/fonts) - Font optimization
- [Nuxt Image](https://image.nuxt.com) - Image optimization
- [ESLint](https://eslint.org) - Code linting

## 📦 Setup

### Prerequisites

- [Bun](https://bun.sh) v1.0+ (recommended) or Node.js v18+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/kbrdn1/kbrdn.dev-v2.git
cd kbrdn.dev-v2

# Install dependencies
bun install

# Start development server
bun run dev
```

Visit `http://localhost:3000` to see your site!

## 🚀 Development

### Available Scripts

```bash
# Development server (http://localhost:3000)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Generate static site
bun run generate

# Lint code
bunx eslint .
```

### Project Structure

```
kbrdn.dev-v2/
├── app/
│   ├── assets/css/         # Global styles & theme
│   ├── components/         # Vue components
│   │   ├── home/          # Homepage sections
│   │   ├── layout/        # Header, Footer
│   │   ├── projects/      # Project components
│   │   └── ui/            # Reusable UI components
│   ├── composables/       # Composition functions
│   ├── content/           # Markdown content
│   │   └── blogs/         # Blogs markdown files
│   ├── layouts/           # Layout templates
│   ├── pages/             # File-based routes
│   └── app.vue            # Root component
├── public/                # Static assets
├── app.config.ts          # Nuxt UI configuration
├── content.config.ts      # Content collections config
├── nuxt.config.ts         # Nuxt configuration
└── package.json
```

## 📝 Adding Content

### Adding a New Blog Post

1. Create a new markdown file in `app/content/blogs/`:

```bash
touch app/content/blogs/my-article.md
```

2. Add frontmatter and content:

```markdown
---
title: My Awesome Article
description: A brief description of the article
slug: my-article
image: /images/blogs/my-article.png
tags: [Vue, TypeScript, Nuxt]
featured: true
publishedAt: 2025-01-15
---

## Introduction

Your article content goes here...
```

3. The blog post will automatically appear on your site!

### Content Fields

- `title` - Article title
- `description` - Short description (used in cards)
- `slug` - URL-friendly identifier
- `image` - Cover image (optional)
- `tags` - Topics/categories (array)
- `featured` - Highlight on homepage (boolean)
- `publishedAt` - Publication date

## 🎨 Customization

### Theme Colors

Edit `app/assets/css/main.css` to customize the theme:

```css
:root {
  --ui-primary: var(--color-ctp-mauve); /* Primary color */
  --ui-secondary: var(--color-ctp-blue); /* Secondary color */
  --ui-radius: 0; /* Border radius (0 for sharp) */
}
```

### Component Defaults

Edit `app.config.ts` to customize component defaults:

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: "ctp-mauve",
      secondary: "ctp-blue",
    },
    button: {
      default: {
        size: "md",
        variant: "solid",
      },
    },
  },
});
```

### Fonts

The project uses Inter by default. To change fonts, edit `nuxt.config.ts`:

```typescript
fonts: {
  families: [{ name: "Your Font", provider: "google" }];
}
```

Then update `app/assets/css/main.css`:

```css
@theme {
  --font-sans: "Your Font", system-ui, sans-serif;
}
```

## 📊 Performance

- Lighthouse Score: 98+/100
- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Total Bundle Size: ~50KB (gzipped)

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy!

### Netlify

1. Build command: `bun run generate`
2. Publish directory: `.output/public`

### Static Hosting

```bash
# Generate static files
bun run generate

# Files will be in .output/public
# Upload to any static hosting service
```

## 📄 License

MIT License - feel free to use this template for your own portfolio!

## 🙏 Acknowledgments

- [Nuxt Team](https://nuxt.com) for the amazing framework
- [Nuxt UI](https://ui.nuxt.com) for the component library
- [Inter Font](https://rsms.me/inter/) for the typography

## 📧 Contact

- Website: [kbrdn.dev](https://kbrdn.dev)
- GitHub: [@kbrdn1](https://github.com/kbrdn1)
- Email: contact@kbrdn.dev

---

Built with ❤️ using Nuxt
