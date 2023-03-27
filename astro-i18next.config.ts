/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: 'fr',
  locales: ['en', 'fr'],
  namespaces: [
    'home',
    'footer',
    'nav',
    'about',
    'blog',
    'contact',
    'skills',
    'inprogress',
    'projects',
    'stack',
    'resume',
    'seo',
    '404',
  ],
  load: ['server'],
  i18nextClient: {
    detection: {
      order: ['querystring', 'path'],
    },
  },
}
