import { createError } from 'h3'
import sharp from 'sharp'
import { toGitfutCard, type GitfutWalkout } from '~~/shared/gitfut'

// Kylian's gitfut card for the hero's easter egg (shared/gitfut.ts): the card, its picture as
// gitfut renders it, and the flag gitfut prints. gitfut answers with `max-age=0`, but the card
// follows his GitHub activity and moves a few times a day at most: cached 6 hours under one
// key, and served stale while it is read again (swr), so the first visitor after that wait
// does not wait on gitfut either. A failure throws, and an error is never cached: while gitfut
// is down the last card read since the server started is served; with none at all, the route
// answers 502 and the egg simply does not hatch.
//
// The picture is 810 × 1230 and 1 MB, with no CORS: made smaller here once per read with sharp
// (shipped already, through ipx), about 20 KB of WebP at the height the egg shows it, sent in
// this answer; never through ipx, which would encode it again on every request.

const GITFUT = 'https://gitfut.com'
const HEIGHT = 320

const bytes = (path: string) =>
  $fetch<ArrayBuffer>(`${GITFUT}${path}`, { responseType: 'arrayBuffer', timeout: 10000 }).then(
    (data) => Buffer.from(data),
  )

export default defineCachedEventHandler(
  async (): Promise<GitfutWalkout> => {
    try {
      const card = toGitfutCard(await $fetch(`${GITFUT}/api/card/kbrdn1`, { timeout: 5000 }))
      const [picture, flag] = await Promise.all([
        bytes('/api/card-image/kbrdn1'),
        // The flag is a nicety: without it the egg hangs a plain cloth
        card.country ? bytes(`/badges/flags/${card.country}.png`).catch(() => null) : null,
      ])
      // Both decoded and encoded again: only a picture reaches the page, whatever was sent
      const limit = { limitInputPixels: 2048 * 2048 }
      const image = await sharp(picture, limit)
        .resize({ height: HEIGHT })
        .webp({ quality: 86 })
        .toBuffer()
      const cloth =
        flag &&
        (await sharp(flag, limit)
          .png()
          .toBuffer()
          .catch(() => null))
      return {
        ...card,
        image: `data:image/webp;base64,${image.toString('base64')}`,
        flag: cloth && `data:image/png;base64,${cloth.toString('base64')}`,
      }
    } catch (error) {
      console.error('gitfut card unavailable:', error)
      throw createError({ statusCode: 502, statusMessage: 'gitfut unavailable' })
    }
  },
  { maxAge: 6 * 3600, swr: true, name: 'gitfut', getKey: () => 'kbrdn1' },
)
