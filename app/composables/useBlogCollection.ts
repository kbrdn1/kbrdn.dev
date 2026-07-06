type BlogCollection = 'blog_en' | 'blog_fr'

// Locale-aware blog collection name (blog_en / blog_fr) + the fallback locale.
// Content lives in per-locale collections; queries pick the one matching the
// active i18n locale and fall back to the other when a translation is missing.
// Kept narrowed to the blog collections so queryCollection() infers the blog
// item type (title/publishedAt/…) instead of the union of every collection.
export function useBlogCollection() {
  const { locale } = useI18n()

  const collection = computed(
    () => `blog_${locale.value}` as BlogCollection,
  )
  const fallback = computed(
    () => `blog_${locale.value === 'fr' ? 'en' : 'fr'}` as BlogCollection,
  )

  return { locale, collection, fallback }
}
