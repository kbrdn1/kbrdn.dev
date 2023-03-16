import { getEntryBySlug } from 'astro:content';

export async function getFooter(lang: string) {
    let collection = await getEntryBySlug('footer', lang);
    return collection?.data;
}

export async function getNav(lang: string) {
    let collection = await getEntryBySlug('nav', lang);
    return collection?.data;
}