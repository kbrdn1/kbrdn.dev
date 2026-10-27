import { useI18n } from '#imports'

/**
 * A page's OG image, one of the site's components (OgImage/Default: a profile panel;
 * OgImage/Blog: the blog's card), with the labels of the reader's language. Server only,
 * like defineOgImage.
 *
 * One cache entry per language and page: both languages share the page's path (no prefix),
 * and the image rendered first was otherwise served to the other language too.
 */
export function useSiteOgImage(component: 'Default' | 'Blog', props: Record<string, unknown>) {
  if (!import.meta.server) return
  const { t, locale } = useI18n()
  const options = { cacheKey: `${locale.value}:${useRoute().path}` }
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
        ...props,
      },
      options,
    )
  } else
    defineOgImage(
      'Default',
      {
        statusText: t('hero.availableForHire'),
        location: t('footer.location.city'),
        labels: {
          status: t('og.status'),
          location: t('og.location'),
          site: t('og.site'),
          github: t('og.github'),
        },
        ...props,
      },
      options,
    )
}
