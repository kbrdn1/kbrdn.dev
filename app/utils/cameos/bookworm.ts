// The blog's intro: a closed book lies on the line; its cover swings open, a bookworm in round
// glasses comes up out of the pages, reads along a line, takes a bite out of the page (crumbs),
// smiles, and sinks back in; the cover shuts with a puff of dust
import { burst, ease, outlineOf, PAL, Raster, shades, smooth, twinkle, type Cameo } from './art'

const OPEN = [300, 750] as const
const RISE = [800, 1150] as const
const READ = [1250, 2650] as const
const BITE = 2800
const SINK = [3700, 4050] as const
const SHUT = [4100, 4500] as const

export const bookworm: Cameo = {
  w: 60,
  h: 36,
  duration: 5000,
  origin: [24, 36],
  spread: 26,
  paint(t, dark) {
    const art = new Raster(60, 36)
    const g = 35
    const cover = shades(PAL.purple, 0.35, 0.3)
    const pages = shades(PAL.cream, 0.15, 0.45)
    const gold = PAL.gold
    // The book: pages seen from the side, cream with their edges, lying on the line
    const [x0, x1, top] = [10, 40, g - 7]
    art.rect(x0, g - 1, x1 - x0, 1, cover[0])
    art.box(x0 + 1, top + 1, x1 - x0 - 2, g - top - 2, pages)
    for (let y = top + 2; y < g - 1; y += 2) art.line(x0 + 2, y, x1 - 3, y, pages[0])
    art.rect(x0, top, 2, g - top, cover[0])

    // The cover, hinged on the spine: shut it lies on the pages, open it rests on the left
    const open = smooth(t, OPEN[0], OPEN[1]) * (1 - smooth(t, SHUT[0], SHUT[1]))
    const angle = open * Math.PI * 0.94
    const [hx, hy] = [x0 + 1, top]
    const len = x1 - x0
    const [ex, ey] = [hx + Math.cos(angle) * len, hy - Math.sin(angle) * len * 0.55]
    art.stroke(
      [
        [hx, hy],
        [ex, ey],
      ],
      1.3,
      cover,
    )
    if (open < 0.5) art.line(hx + 6, hy - 1 + angle, Math.min(ex, hx + 20), hy - 1 + angle, gold)

    // The worm: out of the middle of the pages, its segments swaying, round glasses, a smile
    const up = ease(t, RISE[0], RISE[1]) * (1 - smooth(t, SINK[0], SINK[1]))
    if (up > 0) {
      const green = shades(PAL.green, 0.32, 0.35)
      const reading = t >= READ[0] && t < READ[1]
      const scan = reading ? Math.sin(((t - READ[0]) / (READ[1] - READ[0])) * Math.PI * 3) * 3 : 0
      const bite = t >= BITE && t < BITE + 400
      const base: [number, number] = [26, top + 1]
      let [x, y] = base
      const segments: [number, number][] = []
      for (let i = 0; i < 6; i++) {
        segments.push([x, y])
        const sway = Math.sin(t / 220 - i * 0.8) * 0.5 + (i > 2 ? scan * 0.2 : 0)
        x += sway + (bite ? 0.4 : 0)
        y -= 2.6 * up
      }
      segments.forEach(([sx, sy], i) => art.ball(sx, sy, 2.7 - i * 0.12, 2.4, green))
      // Its head, at the top
      const [hx2, hy2] = segments.at(-1)!
      art.ball(hx2 + 0.5, hy2 - 1.5, 3.6, 3.2, green)
      const ink = '#242424'
      // The glasses: two rings, the eyes looking along the line it reads
      for (const s of [-1, 1]) {
        const gx = hx2 + 0.5 + s * 1.8
        art.set(gx - 1, hy2 - 3, ink)
        art.set(gx, hy2 - 3, ink)
        art.set(gx - 1, hy2 - 1, ink)
        art.set(gx, hy2 - 1, ink)
        art.set(gx - 1.5 + (scan > 1 ? 1 : 0), hy2 - 2, ink)
      }
      art.line(hx2 - 0.5, hy2 - 2, hx2 + 1.5, hy2 - 2, ink)
      art.set(hx2 - 1, hy2 + 0.5, bite ? ink : green[0])
      art.set(hx2 + 2, hy2 + 0.5, bite ? ink : green[0])
      if (!bite && t > BITE + 400) art.line(hx2 - 0.5, hy2 + 1, hx2 + 1.5, hy2 + 1, ink)
    }

    art.outline(outlineOf(dark))
    // The bite: a bit of page gone, crumbs flung; the dust as the cover shuts
    if (t >= BITE + 150 && t < SHUT[0])
      for (const [bx, by] of [
        [31, top + 1],
        [32, top + 1],
        [31, top + 2],
      ] as const)
        art.set(bx, by, undefined)
    burst(art, 31, top, t, BITE + 150, [PAL.cream, '#e8c49a'], {
      n: 8,
      speed: 0.03,
      life: 500,
      seed: 3,
    })
    burst(art, hx + len / 2, top, t, SHUT[1] - 60, [dark ? '#777777' : '#c8c8c8'], {
      n: 10,
      speed: 0.035,
      life: 450,
      gravity: -0.00002,
      seed: 8,
    })
    twinkle(art, 40, top - 12, t, BITE + 500, PAL.yellow, 450)
    return art
  },
}
