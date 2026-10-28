import { queryCollection } from '@nuxt/content/server'

// The pages and the articles, in both languages: French at the root, English under /en/
// (nuxt.config). Each entry lists its two versions as alternates (and the French one as
// x-default), so a crawler pairs them. An article untranslated in one language is still
// listed there: the page falls back to the other language's text. Announced by robots.txt.
const PAGES = ['/', '/experience', '/apps', '/activity', '/blog', '/contact']
const LANGS = { fr: '', en: '/en' } as const

export default defineEventHandler(async (event) => {
  const site = getSiteConfig(event).url.replace(/\/$/, '')
  const posts = [
    ...(await queryCollection(event, 'blog_en').select('path', 'publishedAt').all()),
    ...(await queryCollection(event, 'blog_fr').select('path', 'publishedAt').all()),
  ]
  const lastmod = new Map<string, string>()
  for (const post of posts) {
    const path = post.path.replace('/blogs/', '/blog/')
    const date = post.publishedAt ?? ''
    if (!lastmod.has(path) || date > lastmod.get(path)!) lastmod.set(path, date)
  }

  const href = (prefix: string, path: string) =>
    `${site}${prefix}${path === '/' ? (prefix ? '' : '/') : path}`
  const entry = (path: string, date?: string) =>
    Object.values(LANGS).map((prefix) =>
      [
        `  <url><loc>${href(prefix, path)}</loc>`,
        ...Object.entries(LANGS).map(
          ([lang, alt]) =>
            `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href(alt, path)}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${href('', path)}"/>`,
        date ? `    <lastmod>${date}</lastmod></url>` : '  </url>',
      ].join('\n'),
    )
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...PAGES.flatMap((path) => entry(path)),
    ...[...lastmod]
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([path, date]) => entry(path, date)),
    '</urlset>',
  ].join('\n')
})
