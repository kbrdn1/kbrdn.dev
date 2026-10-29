// Kylian's gitfut card (gitfut.com, MIT, github.com/younesfdj/gitfut), read by the hero's
// easter egg (HomeWalkout) through server/api/gitfut.get.ts. gitfut is a third party: only
// what the egg draws or says is kept, and a field out of its range throws rather than reaching
// the page (the route then keeps serving the last good card).

export const STATS = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const

export interface GitfutCard {
  /** Full name, for the announcement */
  name: string
  overall: number
  /** CM, ST, CAM… */
  position: string
  /** ISO 3166-1 alpha-2, lower case; null when gitfut could not tell */
  country: string | null
  /** The language in the club's slot (gitfut's `club` is `neutral` for everyone) */
  language: string | null
  /** gitfut's finish: gold, totw, toty, icon… */
  finish: string
  stats: Record<(typeof STATS)[number], number>
}

/** What the egg gets: the card, its picture as gitfut renders it, and the flag gitfut prints */
export interface GitfutWalkout extends GitfutCard {
  /** gitfut's card image, made smaller once on the server (data URI, WebP) */
  image: string
  /** The country's flag (data URI, PNG); null when there is none or gitfut did not send it */
  flag: string | null
}

const rating = (value: unknown, field: string) => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 99)
    throw new Error(`gitfut: ${field} is not a rating`)
  return value
}

const word = (value: unknown, pattern: RegExp, field: string) => {
  if (typeof value !== 'string' || !pattern.test(value)) throw new Error(`gitfut: bad ${field}`)
  return value
}

/** gitfut's /api/card/<login> payload, down to what the egg draws; throws on anything off */
export function toGitfutCard(raw: unknown): GitfutCard {
  if (!raw || typeof raw !== 'object') throw new Error('gitfut: not a card')
  const card = raw as Record<string, unknown>
  const name = word(card.name ?? card.login, /^(?=.*\S).{1,60}$/u, 'name').trim()
  const stats = card.stats as Record<string, unknown> | undefined
  if (!stats || typeof stats !== 'object') throw new Error('gitfut: no stats')

  const language = (card.languageLogo as { name?: unknown } | undefined)?.name ?? card.topLanguage
  return {
    name,
    overall: rating(card.overall, 'overall'),
    position: word(card.position, /^[A-Z]{1,3}$/, 'position'),
    country: card.country == null ? null : word(card.country, /^[a-z]{2}$/, 'country'),
    language: language == null ? null : word(language, /^[\w+#. -]{1,24}$/, 'language'),
    finish: word(card.finish, /^[a-z-]{1,16}$/, 'finish'),
    stats: Object.fromEntries(STATS.map((s) => [s, rating(stats[s], s)])) as GitfutCard['stats'],
  }
}
