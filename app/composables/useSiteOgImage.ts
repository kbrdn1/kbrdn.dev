import { useI18n } from '#imports'

/**
 * A page's OG image, one of the site's components (OgImage/Default: a profile panel;
 * OgImage/Blog: the blog's card), with the labels of the reader's language. Server only,
 * like defineOgImage.
 *
 * One cache entry per language and page. The English pages live under /en/ now, but the key
 * keeps the language: an image cached under a path shared by both languages was once served
 * to the other one (#87), and the key costs nothing.
 */
export function useSiteOgImage(component: 'Default' | 'Blog', props: Record<string, unknown>) {
  if (!import.meta.server) return
  const { t, locale } = useI18n()
  const path = useRoute().path
  const options = { cacheKey: `${locale.value}:${path}` }
  // Where the link leads, and in which language: the card's header and footer say both
  const where = {
    address: `kbrdn.dev${path === '/' ? '' : path.replace(/\/$/, '')}`,
    lang: locale.value,
  }
  if (component === 'Blog') {
    defineOgImage(
      'Blog',
      {
        readLabel: t('blog.read'),
        readingTimeLabel: t('blog.readingTime'),
        labels: {
          published: t('og.published'),
          reading: t('og.reading'),
          tags: t('og.tags'),
          author: t('og.author'),
        },
        ...where,
        ...props,
      },
      options,
    )
  } else
    defineOgImage(
      'Default',
      {
        // Empty unless the page passes one: nuxt-og-image 7 otherwise fills it with the
        // page's SEO description, and a description hides the figures and the stack
        description: '',
        statusText: t('hero.availableForHire'),
        location: t('footer.location.city'),
        labels: {
          status: t('og.status'),
          location: t('og.location'),
          site: t('og.site'),
          github: t('og.github'),
        },
        ...where,
        ...props,
      },
      options,
    )
}
