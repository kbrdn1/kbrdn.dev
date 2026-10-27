import { useI18n } from '#imports'

/**
 * A page's OG image, one of the site's components (OgImage/Default: a profile panel;
 * OgImage/Blog: the blog's card), with the labels of the reader's language. Server only,
 * like defineOgImage.
 */
export function useSiteOgImage(component: 'Default' | 'Blog', props: Record<string, unknown>) {
  if (!import.meta.server) return
  const { t } = useI18n()
  if (component === 'Blog') {
    defineOgImage('Blog', {
      readLabel: t('blog.read'),
      readingTimeLabel: t('blog.readingTime'),
      tagsLabel: t('blogNav.tags').toLowerCase(),
      ...props,
    })
  } else defineOgImage('Default', { statusText: t('hero.availableForHire'), ...props })
}
