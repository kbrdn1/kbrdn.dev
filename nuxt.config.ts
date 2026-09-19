import pkg from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxtjs/i18n',
    'nuxt-component-meta',
    'nuxt-og-image',
    // "nuxt-studio", // Désactivé: incompatible avec @nuxt/content v3.7.1 (alpha)
  ],

  site: {
    url: 'https://kbrdn.dev',
    name: 'kbrdn.dev',
  },

  ogImage: {
    defaults: {
      width: 1200,
      height: 630,
    },
  },

  // i18n configuration
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.ts' },
      { code: 'fr', name: 'Français', file: 'fr.ts' },
    ],
    defaultLocale: 'en',
    langDir: 'locales',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      fallbackLocale: 'en',
    },
  },

  // Reference to main CSS file with Claude Dark theme
  css: ['~/assets/css/main.css'],

  // Nuxt UI configuration
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'warning', 'error', 'neutral'],
    },
  },

  // Color mode configuration - support both light and dark
  colorMode: {
    preference: 'system',
    fallback: 'dark',
  },

  // Font configuration
  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700, 900] },
      { name: 'Caveat', provider: 'google' },
      { name: 'Fenix', provider: 'google', weights: [400] },
      {
        name: 'Monaspace Krypton',
        provider: 'local',
        src: '/fonts/monaspace/MonaspaceKrypton-Static.ttf',
      },
    ],
  },

  // Runtime configuration for API keys
  runtimeConfig: {
    githubToken: process.env.GITHUB_TOKEN || '',
    resendApiKey: process.env.RESEND_API_KEY || '',
    // Identité du build, exposée par /api/health. Figée ici au moment du
    // build : c'est ce qui rend l'image auto-descriptive, une valeur lue à
    // l'exécution suivrait le conteneur, pas l'artefact.
    //
    // APP_VERSION porte la version du tag, suffixe de pré-release compris
    // (`1.1.0-rc.2`), là où package.json ne connaît que la version cible
    // (`1.1.0`) — sans ça deux candidats successifs seraient indiscernables.
    appVersion: process.env.APP_VERSION || pkg.version,
    gitSha: process.env.GIT_SHA || 'dev',
    // Figée au build elle aussi, via le build-arg APP_ENV que passent les deux
    // workflows : le déploiement traverse un wrapper sur le VPS, donc rien ne
    // garantit qu'une variable de run atteigne le conteneur.
    //
    // Elle reste surchargeable à l'exécution, mais seulement par la convention
    // Nuxt `NUXT_<CLÉ>` — c'est `NUXT_APP_ENV`, un `APP_ENV` nu est ignoré une
    // fois le build figé.
    appEnv: process.env.APP_ENV || 'local',
  },

  // Page transition
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
  },

  // Content configuration (collections defined in content.config.ts)
  content: {},
})
