// The pages whose address has its own words in each language (i18n `pages`, nuxt.config), by
// route name; the others keep their file path in both. Read by the sitemap too.
export const LOCALIZED_PAGES = {
  experience: { fr: '/parcours', en: '/journey' },
  cgu: { fr: '/cgu', en: '/terms' },
  'apps-tv-kylian-confidentialite': {
    fr: '/apps/tv-kylian/confidentialite',
    en: '/apps/tv-kylian/privacy',
  },
} as const
