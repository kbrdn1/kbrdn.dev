// The banners scripts/banners.ts draws, for the blog and /experience: <dir>/cover.jpg (light, a
// post's `bannerImage`, an entry's `image`), cover-dark.jpg, and for a post cover-og.png, the
// pixel layer frozen for the OG (satori runs no canvas). Any other picture is used as it is.
const COVER = /\/cover\.jpg$/

/** A banner in the colour mode */
export const themedBanner = (src: string, dark: boolean) =>
  dark ? src.replace(COVER, '/cover-dark.jpg') : src

/** A post's banner in the colour mode; the site's own when the post has none */
export function blogBanner(src: string | undefined, dark: boolean) {
  if (!src) return dark ? '/images/banners/dark.jpg' : '/images/banners/light.jpg'
  return themedBanner(src, dark)
}

/** The banner the OG shows (OgImage/Blog.satori.vue) */
export const ogBanner = (src?: string) => src?.replace(COVER, '/cover-og.png')
