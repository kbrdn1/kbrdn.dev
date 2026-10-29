// Career: three stone steps stand on the card; a crab shuffles up to them, hops up them one by
// one (a crouch, a leap, a squash), raises a flag on the top one, snaps its claws in a little
// dance among twinkles, and it all folds back
import { ease, hop, outlineOf, PAL, Raster, shades, twinkle, type Cameo } from './art'

const HOPS = [800, 1350, 1900] as const
const FLAG = [2550, 2850] as const
const DANCE = [3200, 4500] as const

// Each step: its left, width and height; the crab stands on its middle
const STEPS = [
  { x: 20, w: 14, h: 8 },
  { x: 34, w: 14, h: 16 },
  { x: 48, w: 24, h: 24 },
]

// Stone: rows of bricks, their joints staggered
function steps(art: Raster, g: number, dark: boolean) {
  const stone = shades(dark ? '#6a6a6a' : '#b8b8b8', 0.28, 0.32)
  for (const s of STEPS) {
    art.box(s.x, g + 1 - s.h, s.w, s.h, stone)
    for (let y = g + 1 - s.h + 4; y < g; y += 4) art.line(s.x + 1, y, s.x + s.w - 2, y, stone[0])
    for (let y = g + 1 - s.h, row = 0; y < g; y += 4, row++)
      for (let x = s.x + (row % 2 ? 3 : 6); x < s.x + s.w - 1; x += 7)
        art.line(x, y + 1, x, y + 3, stone[0])
  }
}

// The crab, its feet's middle at (x, y): shell, eyes up on stalks, claws, three legs a side
function crab(
  art: Raster,
  x: number,
  y: number,
  t: number,
  k: number,
  walking: boolean,
  open: boolean,
) {
  const red = shades(PAL.red, 0.3, 0.35)
  const dark = red[0]
  const sy = 1 - k
  // Legs, walking in turn
  for (const s of [-1, 1])
    for (let i = 0; i < 3; i++) {
      const step = walking ? Math.sin(t / 55 + i * 2.1 + (s > 0 ? 1 : 0)) : 0
      const knee: [number, number] = [x + s * (7 + i), y - 4 * sy - 1 - Math.max(0, step)]
      art.line(x + s * (4 + i), y - 4 * sy, knee[0], knee[1], dark)
      art.line(knee[0], knee[1], x + s * (8.5 + i * 1.3) + step * s * 0.5, y, dark)
    }
  // Claws up, the pincers open or shut
  for (const s of [-1, 1]) {
    const hand: [number, number] = [x + s * 10, y - 12 * sy]
    art.stroke([[x + s * 5, y - 6 * sy], [x + s * 8, y - 9 * sy], hand], 1.2, red)
    art.ball(hand[0], hand[1], 2.8, 2.4, red)
    if (open) art.line(hand[0] - s, hand[1] - 2, hand[0] + s * 2, hand[1] - 1, dark)
  }
  // The shell, the eyes on their stalks
  art.ball(x, y - 5 * sy, 7 * (1 + k * 0.6), 4.6 * sy, red)
  for (const s of [-1, 1]) {
    art.line(x + s * 2.5, y - 8 * sy, x + s * 3, y - 11 * sy, dark)
    art.ball(x + s * 3, y - 12.5 * sy, 1.7, 1.7, shades('#ffffff', 0.12, 0))
    art.set(x + s * 3 + (s > 0 ? 0 : -1), y - 12.5 * sy, '#242424')
  }
}

export const climb: Cameo = {
  w: 78,
  h: 56,
  duration: 6000,
  origin: [46, 56],
  spread: 34,
  paint(t, dark) {
    const art = new Raster(78, 56)
    const g = 55
    steps(art, g, dark)

    // The flag: its pole up out of the top step, its cloth unfurling and waving
    const pole = ease(t, FLAG[0], FLAG[0] + 300)
    if (pole > 0) {
      const steel = shades(PAL.steel, 0.35, 0.4)
      const top = g - 24 - Math.round(26 * pole)
      art.rect(70, top, 1, g - 24 - top, steel[1])
      art.ball(70.5, top - 1, 1.3, 1.3, shades(PAL.gold, 0.3, 0.4))
      const width = Math.round(11 * ease(t, FLAG[1], FLAG[1] + 300))
      const cloth = shades(PAL.orange, 0.3, 0.35)
      for (let i = 1; i <= width; i++) {
        const wave = Math.sin(t / 110 + i * 0.6)
        const tone =
          Math.cos(t / 110 + i * 0.6) > 0.3 ? 2 : Math.cos(t / 110 + i * 0.6) < -0.3 ? 0 : 1
        for (let j = 0; j < 7; j++)
          art.set(70 - i, top + 1 + j + Math.round(wave * (i / 11)), cloth[tone])
      }
    }

    // Where the crab is: walking in, then up each step; dancing on the top one
    const spots = [{ x: 12, y: g }, ...STEPS.map((s) => ({ x: s.x + 7, y: g - s.h }))]
    let x = 8 + 4 * ease(t, 0, 700)
    let y = g
    let k = 0
    HOPS.forEach((at, i) => {
      if (t < at) return
      const leap = hop(t, at, 480)
      const p = ease(t, at + 120, at + 480)
      const [a, b] = [spots[i]!, spots[i + 1]!]
      x = a.x + (b.x - a.x) * p
      y = a.y + (b.y - a.y) * p - leap.up * 9
      k = leap.k
    })
    const dancing = t >= DANCE[0] && t < DANCE[1]
    if (dancing) {
      x += Math.round(Math.sin((t - DANCE[0]) / 160) * 2)
      const jump = hop(t, 3800, 380)
      y -= jump.up * 6
      k = jump.k
    }
    const open = dancing ? Math.floor(t / 170) % 2 === 0 : t >= FLAG[0] - 200 && t < FLAG[0]
    crab(art, x, y, t, k, t < 700 || (t > HOPS[0] && t < HOPS[0] + 100), open)

    art.outline(outlineOf(dark))
    twinkle(art, 62, 6, t, 3000, PAL.yellow)
    twinkle(art, 74, 18, t, 3350, PAL.yellow)
    twinkle(art, 52, 14, t, 3700, '#ffffff')
    twinkle(art, 72, 4, t, 4100, PAL.yellow)
    return art
  },
}
