import { getEntryBySlug } from 'astro:content'
import i18next from 'i18next'
/**
 *
 * @param lang defines the language of the content
 * @returns content of the footer
 */
export async function getFooter(lang: string) {
  let collection = await getEntryBySlug('footer', lang)
  return collection?.data
}
/**
 *
 * @param lang defines the language of the content
 * @returns content of the nav
 */
export async function getNav(lang: string) {
  let collection = await getEntryBySlug('nav', lang)
  return collection?.data
}

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
