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
  lang: string,
) {
  let collectionEntries = await getCollection(collection)
  return collectionEntries.filter((entry) => entry.id.includes(lang))
}

export function cleanSlug(slug: string): string {
  const [_, result] = slug.split('/')
  if (!result) throw Error(`${slug} might be an invalid slug`)

  return result
}
