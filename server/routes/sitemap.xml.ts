import { queryCollection } from '@nuxt/content/server'

// The pages and the articles. Both languages share every path (no prefix): one entry per
// path, the article's last date across its translations as lastmod. Announced by robots.txt.
const PAGES = ['/', '/experience', '/apps', '/activity', '/blog', '/contact']

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

  const url = (path: string, date?: string) =>
    `  <url><loc>${site}${path === '/' ? '/' : path}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...PAGES.map((path) => url(path)),
    ...[...lastmod].sort(([a], [b]) => a.localeCompare(b)).map(([path, date]) => url(path, date)),
    '</urlset>',
  ].join('\n')
})
