// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxtjs/i18n'
  ],

  // i18n configuration
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.ts' },
      { code: 'fr', name: 'Français', file: 'fr.ts' }
    ],
    defaultLocale: 'en',
    langDir: 'locales',
    lazy: true,
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'en'
    }
  },

  // Reference to main CSS file with Claude Dark theme
  css: ['~/assets/css/main.css'],

  // Nuxt UI configuration
  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'success',
        'warning',
        'error',
        'neutral'
      ]
    }
  },

  // Color mode configuration - support both light and dark
  colorMode: {
    preference: 'system',
    fallback: 'dark'
  },

  // Font configuration
  fonts: {
    families: [
      { name: 'Inter', provider: 'google' },
      { name: 'Caveat', provider: 'google' }
    ]
  },

  // Runtime configuration for API keys
  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN || '',
    resendApiKey: process.env.RESEND_API_KEY || ''
  },

  // Content configuration
  content: {
    sources: {
      content: {
        driver: 'fs',
        base: './app/content'
      }
    }
  }
})
