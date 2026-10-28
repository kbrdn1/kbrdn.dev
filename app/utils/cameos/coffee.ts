// An article's header, by its reading time: a mug of coffee steams on the card; a sugar cube
// drops in with a splash, the coffee ripples, the steam curls into a heart that rises and
// fades, the mug hops for joy, and down
import { burst, ease, heart, hop, outlineOf, PAL, Raster, shades, type Cameo } from './art'

const DROP = [700, 1150] as const
const SPLASH = 1150
const HEART = [1700, 3600] as const
const HOP = 3800

export const coffee: Cameo = {
  w: 48,
  h: 50,
  duration: 5000,
  origin: [20, 50],
  spread: 26,
  paint(t, dark) {
    const art = new Raster(48, 50)
    const g = 49
    const mug = shades(PAL.paper, 0.18, 0.5)
    const band = shades(PAL.orange, 0.3, 0.35)
    const brew = shades('#6b3f22', 0.35, 0.25)
    const joy = hop(t, HOP, 420)
    const [cx, base] = [20, g - joy.up * 6]
    const k = joy.k
    const [w, h] = [18 * (1 + k * 0.6), 16 * (1 - k)]
    const [x0, y0] = [cx - w / 2, base + 1 - h]

    // The handle (a ring, its hole cut out), the mug, its band, the coffee in it, rippling after the splash
    art.ball(x0 + w + 1, y0 + h / 2, 4, 4.5, mug)
    for (let y = Math.floor(y0 + h / 2 - 2); y <= y0 + h / 2 + 2; y++)
      for (let x = Math.floor(x0 + w); x <= x0 + w + 2; x++) art.set(x, y, undefined)
    art.cylinder(x0, y0, w, h, mug)
    art.cylinder(x0, y0 + h * 0.45, w, 3, band)
    const ripple =
      t >= SPLASH && t < SPLASH + 900 ? Math.sin((t - SPLASH) / 70) * (1 - (t - SPLASH) / 900) : 0
    art.ball(cx, y0 + 1, w / 2 - 1.5, 2 + ripple * 0.6, brew)

    art.outline(outlineOf(dark))

    // The sugar cube, falling in
    if (t >= DROP[0] && t < DROP[1]) {
      const y = 2 + (y0 - 4) * ease(t, DROP[0], DROP[1]) ** 0.5
      art.box(cx - 2, y, 4, 4, shades('#ffffff', 0.12, 0))
    }
    burst(art, cx, y0, t, SPLASH, [brew[2], brew[1], '#c08a5a'], {
      n: 10,
      speed: 0.04,
      life: 450,
      seed: 2,
    })

    // The steam: wisps rising and swaying, then curling into a heart that floats off
    const steam = dark ? '#7a7a7a' : '#c8c8c8'
    const curling = t >= HEART[0] && t < HEART[1]
    for (let i = 0; i < 3; i++) {
      if (curling && i === 1) continue
      for (let s = 0; s < 12; s++) {
        const phase = (t / 600 + i * 0.37 + s / 12) % 1
        const y = y0 - 2 - phase * 18
        const x = cx - 4 + i * 4 + Math.sin(phase * 7 + i) * 1.6
        if ((s + i) % 2 === 0) art.set(x, y, steam)
      }
    }
    if (curling) {
      const p = (t - HEART[0]) / (HEART[1] - HEART[0])
      const size = 3.2 * Math.min(1, p * 4) * (1 - Math.max(0, p - 0.75) * 4)
      if (size > 0.6) {
        const outline = new Raster(14, 14)
        heart(outline, 7, 6, size, [steam, steam, steam])
        const fill = new Raster(14, 14)
        heart(fill, 7, 6, size - 1, [steam, steam, steam])
        // Only its edge: steam has no inside
        for (let i = 0; i < outline.cells.length; i++)
          if (fill.cells[i]) outline.cells[i] = undefined
        art.blit(outline, 7, 6, cx + Math.sin(p * 6) * 1.5, y0 - 10 - p * 14)
      }
    }
    return art
  },
}
