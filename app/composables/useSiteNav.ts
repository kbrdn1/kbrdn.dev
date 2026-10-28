import { useI18n } from '#imports'

/**
 * The site's pages, as listed by the header, the blog header and the footer, and which
 * one the current route belongs to (a blog post belongs to /blog), in either language. The home page's
 * sections have their own table of contents (HomeToc).
 */
export function useSiteNav() {
  const { t } = useI18n()
  const route = useRoute()

  const links = computed(() => [
    { to: '/', label: t('nav.home') },
    { to: '/experience', label: t('nav.experience') },
    { to: '/apps', label: t('nav.apps') },
    { to: '/activity', label: t('nav.activity') },
    { to: '/blog', label: t('nav.blog') },
    { to: '/contact', label: t('nav.contact') },
  ])

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
