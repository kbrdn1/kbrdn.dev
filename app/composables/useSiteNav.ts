import { useI18n } from '#imports'

/**
 * The site's pages, as listed by the header, the blog header and the footer, and which
 * one the current route belongs to (a blog post belongs to /blog). The home page is the
 * brand link; its sections have their own table of contents (HomeToc).
 */
export function useSiteNav() {
  const { t } = useI18n()
  const route = useRoute()

  const links = computed(() => [
    { to: '/experience', label: t('nav.experience') },
    { to: '/apps', label: t('nav.apps') },
    { to: '/blog', label: t('nav.blog') },
  ])

  const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)

  return { links, isActive }
}
