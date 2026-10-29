// The home's hero: badges of the stack (TypeScript, Rust, Vue, Laravel, Nuxt, Go) orbit the
// mascot like a ring, tilted: behind it on the far side, in front of it on the near side,
// larger as they come near, a short trail behind each; a sparkle now and then on the ring.
// Two layers, painted on the loop like the heroes: one behind the mascot, one in front.
import { outlineOf, Raster, shades, twinkle, type Rgb } from '../cameos/art'
import { phase } from './hero'

const W = 168
const H = 112
const PERIOD = 18000
// The ring: its centre (the mascot's chest), radii, tilt
const RING = { x: 84, y: 66, rx: 76, ry: 17, tilt: -0.2 }

// Three by five, the letters the badges need
const LETTERS: Record<string, string[]> = {
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
}

interface Badge {
  color: Rgb
  ink: Rgb
  /** Two letters, or a mark drawn instead */
  word?: string
  mark?: 'vue' | 'nuxt'
}
const BADGES: Badge[] = [
  { color: '#3178c6', ink: '#ffffff', word: 'TS' },
  { color: '#b7410e', ink: '#ffe6d6', word: 'RS' },
  { color: '#f5f5f5', ink: '#35495e', mark: 'vue' },
  { color: '#ff2d20', ink: '#ffffff', word: 'L' },
  { color: '#00dc82', ink: '#0b3d2c', mark: 'nuxt' },
  { color: '#00add8', ink: '#ffffff', word: 'GO' },
]

// A badge, 13 × 13: a rounded tile lit on its top left, its letters or its mark, outlined.
// The hero's easter egg shows the card's language with them (walkout.ts), in this order.
const badges = new Map<boolean, Raster[]>()
export function badgeArt(dark: boolean) {
  let cached = badges.get(dark)
  if (cached) return cached
  cached = BADGES.map((badge) => {
    const art = new Raster(15, 15)
    art.box(1, 1, 13, 13, shades(badge.color, 0.3, 0.3))
    for (const [x, y] of [
      [1, 1],
      [13, 1],
      [1, 13],
      [13, 13],
    ] as const)
      art.set(x, y, undefined)
    if (badge.word) {
      const letters = [...badge.word]
      const x0 = 8 - letters.length * 2
      letters.forEach((letter, n) =>
        LETTERS[letter]!.forEach((row, j) =>
          [...row].forEach((p, i) => p === '#' && art.set(x0 + n * 4 + i, 5 + j, badge.ink)),
        ),
      )
    } else if (badge.mark === 'vue') {
      art.poly(
        [
          [3, 4],
          [12, 4],
          [7.5, 12],
        ],
        '#41b883',
      )
      art.poly(
        [
          [5.5, 4],
          [9.5, 4],
          [7.5, 8],
        ],
        badge.ink,
      )
    } else {
      art.poly(
        [
          [3, 11],
          [7, 4],
          [12, 11],
        ],
        badge.ink,
      )
      art.poly(
        [
          [7, 11],
          [9.5, 7],
          [12, 11],
        ],
        '#ffffff',
      )
    }
    art.outline(outlineOf(dark))
    return art
  })
  badges.set(dark, cached)
  return cached
}

// Where a point of the ring is, at an angle: the tilted ellipse, and how near (-1 far, 1 near)
function onRing(angle: number) {
  const [x, y] = [Math.cos(angle) * RING.rx, Math.sin(angle) * RING.ry]
  const [c, s] = [Math.cos(RING.tilt), Math.sin(RING.tilt)]
  return { x: RING.x + x * c - y * s, y: RING.y + x * s + y * c, near: Math.sin(angle) }
}

/** The two layers at t: what is behind the mascot, what is in front of it */
function layers(t: number, dark: boolean): [Raster, Raster] {
  const back = new Raster(W, H)
  const front = new Raster(W, H)
  const u = phase(t, PERIOD)
  const art = badgeArt(dark)
  BADGES.forEach((badge, i) => {
    const angle = 2 * Math.PI * (u + i / BADGES.length)
    const at = onRing(angle)
    const layer = at.near < 0 ? back : front
    // A short trail behind it on the ring, fainter as it goes
    for (let k = 1; k <= 6; k++) {
      const p = onRing(angle - 0.05 - k * 0.045)
      if (k < 3 || (k + i) % 2 === 0)
        layer.set(p.x, p.y, badge.color === '#f5f5f5' ? '#41b883' : badge.color)
    }
    const scale = 0.7 + 0.45 * ((at.near + 1) / 2)
    layer.blit(art[i]!, 7.5, 7.5, at.x, at.y, 0, scale, scale)
  })
  // Sparkles on the ring, three a loop
  const tl = u * PERIOD
  for (let k = 0; k < 3; k++) {
    const p = onRing(2 * Math.PI * (0.13 + k * 0.37))
    twinkle(p.near < 0 ? back : front, p.x, p.y - 4, tl, PERIOD * (0.15 + k * 0.3), '#ffffff', 500)
  }
  return [back, front]
}

export const ORBIT = { w: W, h: H, period: PERIOD, rest: PERIOD * 0.04, layers }
