// The timeline: a tear-off calendar stands in the header on its two rings; its page flips up
// and flies off, year after year of the career (2020, 2022, 2023, 2026), the last one with a
// sparkle, and it folds back
import { outlineOf, PAL, pop, Raster, shades, smooth, text, twinkle, type Cameo } from './art'

const YEARS = ['2020', '2022', '2023', '2026']
const FLIPS = [900, 1700, 2500] as const
const FLIP = 280
const FALL = 600

// A page, 24 × 22: the year big in the middle, a month line under it, ruled
function page(year: string, last: boolean) {
  const art = new Raster(24, 22)
  art.box(0, 0, 24, 22, shades(PAL.paper, 0.14, 0.5))
  text(art, year, 4, 6, last ? PAL.rust : '#3a3a3a', 1)
  art.rect(6, 14, 12, 1, '#b0b0b0')
  art.rect(8, 17, 8, 1, '#c8c8c8')
  return art
}

export const calendar: Cameo = {
  w: 52,
  h: 48,
  duration: 4300,
  origin: [20, 48],
  spread: 26,
  paint(t, dark) {
    const art = new Raster(52, 48)
    const [x0, y0] = [8, 14]
    // The block: a red header with its two rings, the pages' edges under the top one
    art.box(x0, y0 + 30, 24, 2, shades('#d0c8bc', 0.2, 0.2))
    art.box(x0, y0, 24, 8, shades(PAL.red, 0.3, 0.35))
    // Under a page being turned, the next one already shows
    const next = FLIPS.filter((at) => t >= at).length
    art.blit(page(YEARS[next]!, next === 3), 0, 0, x0, y0 + 8)
    for (const rx of [x0 + 6, x0 + 18]) art.ball(rx, y0, 1.6, 2.2, shades(PAL.steel, 0.3, 0.45))
    art.outline(outlineOf(dark))

    // The page being turned: up about the top edge, then off to the right, falling, spinning
    FLIPS.forEach((at, i) => {
      const dt = t - at
      if (dt < 0 || dt > FLIP + FALL) return
      const sheet = page(YEARS[i]!, false)
      sheet.outline(outlineOf(dark))
      if (dt < FLIP) {
        const lift = Math.cos(smooth(dt, 0, FLIP) * Math.PI)
        if (Math.abs(lift) > 0.08) art.blit(sheet, 12, 0, x0 + 12, y0 + 8, 0, 1, lift)
      } else {
        const p = (dt - FLIP) / FALL
        const x = x0 + 12 + p * 22
        const y = y0 + 4 - 10 * Math.sin(p * Math.PI) + p * 26
        art.blit(sheet, 12, 11, x, y, p * 2.4, 0.6 * (1 - p * 0.5), 0.6 * (1 - p * 0.5))
      }
    })
    // The last year, a pop and a sparkle
    const last = pop(t, FLIPS[2] + FLIP, 260)
    if (last > 0 && t < FLIPS[2] + FLIP + 900) {
      twinkle(art, x0 + 28, y0 + 6, t, FLIPS[2] + FLIP + 60, PAL.yellow, 500)
      twinkle(art, x0 - 3, y0 + 14, t, FLIPS[2] + FLIP + 300, '#ffffff', 450)
    }
    return art
  },
}
