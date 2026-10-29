// Explore: a star twinkles on the card; a flying saucer comes from far off, slows down over it,
// its pilot peeks down, a beam comes on and the star rises up it spinning; a flash as it is
// taken in, a happy wobble, and the saucer zips off into the distance, a star where it went
import { burst, ease, outlineOf, PAL, Raster, shades, smooth, twinkle, type Cameo } from './art'

const IN = [300, 1500] as const
const BEAM = [1800, 3300] as const
const RISE = [2050, 3200] as const
const WOBBLE = [3350, 3900] as const
const OUT = [3950, 4500] as const

// The saucer, 30 × 16: a glass dome with its little green pilot, a steel hull, rim lights
function saucer(dark: boolean, t: number, peek: boolean) {
  const art = new Raster(30, 17)
  const steel = shades(dark ? '#a8a8a8' : '#9a9a9a', 0.35, 0.45)
  art.ball(15, 13, 8, 2.5, shades('#6a6a6a', 0.3, 0.3))
  art.ball(15, 10, 14, 4.4, steel)
  art.rect(2, 10, 26, 1, steel[0])
  art.ball(15, 7.5, 7, 6.5, shades(PAL.cyan, 0.35, 0.45), 9)
  // The pilot: a green head, two big eyes, looking down when it peeks
  art.ball(15, 6.5, 3.2, 2.8, shades(PAL.green, 0.3, 0.35))
  art.set(14, peek ? 7 : 6, '#242424')
  art.set(16, peek ? 7 : 6, '#242424')
  art.set(11, 3, '#ffffff')
  art.set(12, 2, '#ffffff')
  // Lights along the rim, their colours running round
  const colors = [PAL.yellow, PAL.red, PAL.blue]
  ;[4, 9.5, 15, 20.5, 26].forEach((x, i) =>
    art.set(x, 11, colors[(i + Math.floor(t / 140)) % colors.length]!),
  )
  art.outline(outlineOf(dark))
  return art
}

// A five-pointed star, 13 × 13, lit on its left
function star(dark: boolean) {
  const art = new Raster(13, 13)
  const gold = shades(PAL.yellow, 0.25, 0.5)
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const r = i % 2 ? 2.6 : 6
    return [6.5 + Math.cos(a) * r, 6.8 + Math.sin(a) * r] as [number, number]
  })
  art.poly(points, gold[1])
  for (let y = 0; y < 13; y++) for (let x = 0; x < 6; x++) if (art.at(x, y)) art.set(x, y, gold[2])
  for (let y = 8; y < 13; y++) for (let x = 7; x < 13; x++) if (art.at(x, y)) art.set(x, y, gold[0])
  art.outline(outlineOf(dark))
  return art
}

export const ufo: Cameo = {
  w: 76,
  h: 56,
  duration: 5600,
  origin: [22, 56],
  spread: 30,
  paint(t, dark) {
    const art = new Raster(76, 56)
    const g = 55
    const home = 22

    // The saucer's way: in from far off at the top right, growing nearer, leaning into it; a
    // wobble; off to the top left, smaller and smaller until it is a star
    const arrive = ease(t, IN[0], IN[1])
    let x = 64 + (home - 64) * arrive
    let y = 3 + (12 - 3) * arrive + Math.round(Math.sin(t / 220))
    let near = 0.2 + 0.8 * arrive
    let tilt = -0.35 * (1 - arrive) ** 2
    if (t >= WOBBLE[0] && t < WOBBLE[1])
      tilt = 0.18 * Math.sin((t - WOBBLE[0]) / 70) * (1 - ease(t, WOBBLE[0], WOBBLE[1]))
    if (t >= OUT[0]) {
      const p = smooth(t, OUT[0], OUT[1])
      x = home - p * 15
      y -= p * 9
      near = 1 - p * 0.85
      tilt = 0.3 * p
    }
    // The beam: a see-through cone of light down to the card, bands running down it
    const beam = t >= BEAM[0] && t < BEAM[1]
    if (beam) {
      const reach = y + 13 + (g - y - 13) * ease(t, BEAM[0], BEAM[0] + 200)
      for (let by = y + 13; by < reach; by++) {
        const half = 3 + ((by - y - 13) / (g - y)) * 8
        const band = Math.floor((by - t / 30) / 3) % 3 === 0
        if (band) art.rect(x - half, by, half * 2, 1, '#fff3b0')
        else art.veil(x - half, by, half * 2, 1, '#fff3b0', by)
      }
    }

    // The star: on the card, then up the beam, spinning and shrinking, until it is taken in
    if (t < RISE[1]) {
      const p = smooth(t, RISE[0], RISE[1])
      const sy = g - 7 - p * (g - 7 - (y + 14))
      art.blit(
        star(dark),
        6.5,
        6.5,
        home,
        sy,
        0,
        t >= RISE[0] ? Math.cos((t - RISE[0]) / 110) : 1,
        1 - p * 0.4,
      )
    }
    // Speed lines behind it as it goes
    if (t >= OUT[0] - 50 && t < OUT[1])
      for (let i = 0; i < 4; i++) {
        const len = (6 + i * 3) * near
        const [lx, ly] = [x + 14 * near + i * 2, y + (4 + i * 2.5) * near]
        art.line(lx, ly, lx + len, ly + len * 0.3, dark ? '#666666' : '#b0b0b0')
      }
    if (t < OUT[1])
      art.blit(saucer(dark, t, t > 1500 && t < BEAM[1]), 15, 10, x, y, tilt, near, near)
    twinkle(art, home - 15, 3, t, OUT[1] - 60, PAL.yellow, 500)
    burst(art, home, y + 12, t, RISE[1], [PAL.yellow, '#ffffff', PAL.gold], {
      n: 12,
      speed: 0.06,
      life: 450,
      seed: 4,
    })
    twinkle(art, home + 6, g - 10, t, 400, '#ffffff', 450)
    twinkle(art, home - 5, g - 4, t, 900, PAL.yellow, 450)
    return art
  },
}
