import { getEntryBySlug } from 'astro:content';
/**
 * 
 * @param lang defines the language of the content
 * @returns content of the footer
 */
export async function getFooter(lang: string) {
    let collection = await getEntryBySlug('footer', lang);
    return collection?.data;
}
/**
 * 
 * @param lang defines the language of the content
 * @returns content of the nav
 */
export async function getNav(lang: string) {
    let collection = await getEntryBySlug('nav', lang);
    return collection?.data;
}