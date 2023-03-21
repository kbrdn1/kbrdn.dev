import { getEntryBySlug, CollectionEntry, getCollection } from 'astro:content'
import i18next from 'i18next'

export function getPath(url: string) {
  return new URL(url).pathname
}

export function getPathname(url: string) {
  let pathname = new URL(url).pathname
  if (pathname.includes('en')) {
    return pathname.slice(4)
  }
  return pathname.slice(1)
}

export function getLang() {
  return i18next.language == 'fr' ? 'en' : 'fr'
}

export async function getArticles<T extends 'blog' | 'stack' | 'projects'>(
  collection: T,
  lang: 'en' | 'fr',
  limit?: number,
  ignore?: string,
) {
  let collectionEntries = await getCollection(collection),
    sortedArticlesByLang = collectionEntries.filter(entry => entry.id.startsWith(lang))
  if (ignore)
    sortedArticlesByLang = sortedArticlesByLang.filter(entry => entry.slug != ignore)
  if (limit) return sortedArticlesByLang.slice(0, limit)
  else
    return sortedArticlesByLang.sort((a, b) => {
      return new Date(b.data.editDate) - new Date(a.data.editDate)
    }) as CollectionEntry<T>[]
}

export async function getArticlesByPublishDate<T extends 'blog' | 'stack' | 'projects'>(
  collection: T,
  lang: 'en' | 'fr',
  limit?: number,
  ignore?: string,
) {
  let collectionEntries = await getCollection(collection),
    sortedArticlesByLang = collectionEntries.filter(entry => entry.id.startsWith(lang))
  if (ignore)
    sortedArticlesByLang = sortedArticlesByLang.filter(entry => entry.slug != ignore)
  if (limit) return sortedArticlesByLang.slice(0, limit)
  else
    return sortedArticlesByLang.sort((a, b) => {
      return new Date(b.data.publishDate) - new Date(a.data.publishDate)
    }) as CollectionEntry<T>[]
}
