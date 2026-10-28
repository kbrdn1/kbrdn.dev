import { useI18n } from '#imports'

// What every page's <head> shares: the language, the canonical address, the Open Graph frame
// and the site's JSON-LD (the person and the website, referenced by @id from each page's
// own nodes). Called once by app.vue, and by error.vue, which replaces it on errors.
//
// French at the root, English under /en/ (nuxt.config): each page's canonical is its own
// language's address, hreflang points at the other one, x-default at the French root.

const SAME_AS = [
  'https://github.com/kbrdn1',
  'https://linkedin.com/in/kylian-bardini-aa0528234',
  'https://twitter.com/kbrdn1',
]
const OG_LOCALES = { en: 'en_US', fr: 'fr_FR' } as const

/** A path's absolute address on this environment's origin (site.url), no trailing slash */
export function useSiteUrl() {
  const base = useSiteConfig().url.replace(/\/$/, '')
  return (path = '/') => base + (path === '/' ? '/' : path.replace(/\/$/, ''))
}

/** The site's person node, by reference */
export function usePersonRef() {
  return { '@id': `${useSiteUrl()('/')}#person` }
}

/**
 * JSON-LD nodes in a <script type="application/ld+json">, one per key so a page's nodes
 * replace themselves on navigation. `<` is escaped: titles end up inside a <script>.
 */
export function useJsonLd(key: string, nodes: () => Record<string, unknown>[]) {
  useHead({
    script: [
      {
        key: `ld-${key}`,
        type: 'application/ld+json',
        innerHTML: () =>
          JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes() }).replace(
            /</g,
            '\\u003c',
          ),
      },
    ],
  })
}

/**
 * A page's own nodes: the page itself (WebPage or a subtype, inside the website, about the
 * person), whatever the page adds (`nodes`), and the trail from the home when it has one.
 */
export function usePageSchema(
  type: string,
  page: () => { name: string; description?: string; [key: string]: unknown },
  options: {
    /** Unprefixed paths, or route names for a page whose address changes with the language:
     * they follow the page's language */
    trail?: () => { name: string; path: string }[]
    nodes?: () => Record<string, unknown>[]
  } = {},
) {
  const { t, locale } = useI18n()
  const route = useRoute()
  const url = useSiteUrl()
  const localePath = useLocalePath()
  const person = usePersonRef()
  useJsonLd('page', () => [
    {
      '@type': type,
      '@id': `${url(route.path)}#webpage`,
      url: url(route.path),
      inLanguage: locale.value,
      isPartOf: { '@id': `${url('/')}#website` },
      about: person,
      ...page(),
    },
    ...(options.nodes?.() ?? []),
    ...(options.trail
      ? [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [{ name: t('nav.home'), path: '/' }, ...options.trail()].map(
              (crumb, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: crumb.name,
                item: url(localePath(crumb.path)),
              }),
            ),
          },
        ]
      : []),
  ])
}

export function useSiteSeo({ indexable = true } = {}) {
  const { t, locale } = useI18n()
  const route = useRoute()
  const url = useSiteUrl()
  const switchLocalePath = useSwitchLocalePath()
  const person = usePersonRef()
  const lang = computed(() => locale.value as keyof typeof OG_LOCALES)

  useHead({
    htmlAttrs: { lang },
    link: indexable
      ? [
          { key: 'canonical', rel: 'canonical', href: () => url(route.path) },
          ...(['fr', 'en'] as const).map((code) => ({
            key: `hreflang-${code}`,
            rel: 'alternate' as const,
            hreflang: code,
            href: () => url(switchLocalePath(code) || '/'),
          })),
          {
            key: 'hreflang-x-default',
            rel: 'alternate' as const,
            hreflang: 'x-default',
            href: () => url(switchLocalePath('fr') || '/'),
          },
        ]
      : [],
  })
  useSeoMeta({
    ogSiteName: 'kbrdn.dev',
    ogType: 'website',
    ogUrl: indexable ? () => url(route.path) : undefined,
    ogLocale: () => OG_LOCALES[lang.value],
    ogLocaleAlternate: () => OG_LOCALES[lang.value === 'fr' ? 'en' : 'fr'],
    twitterSite: '@kbrdn1',
    twitterCreator: '@kbrdn1',
  })
  if (!indexable) return

  useJsonLd('site', () => [
    {
      '@type': 'WebSite',
      '@id': `${url('/')}#website`,
      url: url('/'),
      name: 'kbrdn.dev',
      description: t('seo.description'),
      inLanguage: lang.value,
      publisher: person,
    },
    {
      '@type': 'Person',
      ...person,
      name: 'Kylian Bardini',
      alternateName: 'kbrdn1',
      url: url('/'),
      image: url('/images/avatar.png'),
      jobTitle: t('seo.jobTitle'),
      address: { '@type': 'PostalAddress', addressLocality: 'Nancy', addressCountry: 'FR' },
      knowsAbout: ['TypeScript', 'Vue.js', 'Nuxt', 'Laravel', 'AWS', 'Rust'],
      sameAs: SAME_AS,
    },
  ])
}
