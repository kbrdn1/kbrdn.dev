import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import astroI18next from 'astro-i18next'

import image from '@astrojs/image'

// https://astro.build/config
export default defineConfig({
  site: 'https://kbrdn.dev',
  integrations: [
    tailwind(),
    react(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'fr',
        locales: {
          en: 'en-US',
          fr: 'fr-FR',
        },
      },
    }),
    astroI18next(),
    image(),
  ],
})
