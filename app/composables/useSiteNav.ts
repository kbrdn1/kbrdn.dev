import { useI18n } from '#imports'

/**
 * The site's pages, as listed by the header, the blog header and the footer, and which
 * one the current route belongs to (a blog post belongs to /blog), in either language. The home page's
 * sections have their own table of contents (HomeToc).
 */
// In the navbar's order, left to right (a page change comes in from the side it goes to). `to`
// keys a page (the notch's menus); links go by route `name`, the only way to the pages whose
// address changes with the language (/parcours, /en/journey)
export const SITE_PAGES = [
  { to: '/', name: 'index', label: 'nav.home' },
  { to: '/experience', name: 'experience', label: 'nav.experience' },
  { to: '/apps', name: 'apps', label: 'nav.apps' },
  { to: '/activity', name: 'activity', label: 'nav.activity' },
  { to: '/blog', name: 'blog', label: 'nav.blog' },
  { to: '/contact', name: 'contact', label: 'nav.contact' },
] as const

export function useSiteNav() {
  const { t } = useI18n()
  const route = useRoute()

  const links = computed(() =>
    SITE_PAGES.map(({ to, name, label }) => ({ to, name, label: t(label) })),
  )

  // The links stay unprefixed (the notch's menus are keyed by them, NuxtLinkLocale prefixes
  // them); the route has the language's prefix: compare it with the prefixed path. The
  // home is only active on itself, or /en would light up on every English page.
  const localePath = useLocalePath()
  const isActive = (to: string) => {
    const path = localePath(SITE_PAGES.find((page) => page.to === to)?.name ?? to)
    return route.path === path || (to !== '/' && route.path.startsWith(`${path}/`))
  }

  return { links, isActive }
}
