import { useI18n } from '#imports'

/**
 * The site's pages, as listed by the header, the blog header and the footer, and which
 * one the current route belongs to (a blog post belongs to /blog), in either language. The home page's
 * sections have their own table of contents (HomeToc).
 */
// In the navbar's order, left to right (a page change comes in from the side it goes to)
export const SITE_PAGES = [
  { to: '/', label: 'nav.home' },
  { to: '/experience', label: 'nav.experience' },
  { to: '/apps', label: 'nav.apps' },
  { to: '/activity', label: 'nav.activity' },
  { to: '/blog', label: 'nav.blog' },
  { to: '/contact', label: 'nav.contact' },
] as const

export function useSiteNav() {
  const { t } = useI18n()
  const route = useRoute()

  const links = computed(() => SITE_PAGES.map(({ to, label }) => ({ to, label: t(label) })))

  // The links stay unprefixed (the notch's menus are keyed by them, NuxtLinkLocale prefixes
  // them); the route has the language's prefix: compare it with the prefixed path. The
  // home is only active on itself, or /en would light up on every English page.
  const localePath = useLocalePath()
  const isActive = (to: string) => {
    const path = localePath(to)
    return route.path === path || (to !== '/' && route.path.startsWith(`${path}/`))
  }

  return { links, isActive }
}
