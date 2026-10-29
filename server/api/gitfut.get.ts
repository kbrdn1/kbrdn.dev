import { createError } from 'h3'
import { toGitfutCard } from '~~/shared/gitfut'

// Kylian's gitfut card for the hero's easter egg (shared/gitfut.ts). gitfut answers with
// `max-age=0`, but the card follows his GitHub activity and moves a few times a day at most:
// cached 6 hours under one key, and served stale while it is read again (swr), so the first
// visitor after that wait does not wait on gitfut either. A failure throws, and an error is
// never cached: while gitfut is down the last card read since the server started is served;
// with none at all, the route answers 502 and the egg simply does not hatch.

export default defineCachedEventHandler(
  async () => {
    const raw = await $fetch('https://gitfut.com/api/card/kbrdn1', { timeout: 5000 }).catch(
      (error) => {
        console.error('gitfut request failed:', error)
        throw createError({ statusCode: 502, statusMessage: 'gitfut unavailable' })
      },
    )
    try {
      return toGitfutCard(raw)
    } catch (error) {
      console.error(error)
      throw createError({ statusCode: 502, statusMessage: 'gitfut card unreadable' })
    }
  },
  { maxAge: 6 * 3600, swr: true, name: 'gitfut', getKey: () => 'kbrdn1' },
)
