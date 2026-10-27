import { useI18n } from '#imports'

/**
 * The site's pages, as listed by the header, the blog header and the footer, and which
 * one the current route belongs to (a blog post belongs to /blog). The home page's
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

  const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)

  return { links, isActive }
}
