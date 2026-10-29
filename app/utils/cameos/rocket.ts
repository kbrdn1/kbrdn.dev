// Featured projects: a rocket stands on its pad, a countdown pops over it (3, 2, 1), its engine
// lights, smoke rolls out on both sides, it shakes, lifts off faster and faster, smaller and
// smaller far up, leaving a trail of smoke that clears; a star twinkles where it went
import { outlineOf, PAL, pop, rand, Raster, shades, text, twinkle, type Cameo } from './art'

const COUNT = [600, 1100, 1600] as const
const IGNITE = 2100
const LIFT = 2550

// The rocket, 18 × 30: a red nose, a white body, a porthole, a red band, red fins, a nozzle
function rocket(dark: boolean) {
  const art = new Raster(18, 30)
  const white = shades(PAL.paper, 0.18, 0.5)
  const red = shades(PAL.red, 0.3, 0.3)
  const steel = shades(PAL.steel, 0.35, 0.4)
  // Fins behind the body
  art.poly(
    [
      [4, 17],
      [4, 25],
      [0, 28],
      [0, 22],
    ],
    red[0],
  )
  art.poly(
    [
      [14, 17],
      [14, 25],
      [18, 28],
      [18, 22],
    ],
    red[1],
  )
  art.cylinder(3, 9, 12, 16, white)
  // The nose, narrowing to its tip
  for (let y = 0; y < 9; y++) {
    const half = 6 * Math.sqrt((y + 1) / 9.5)
    art.cylinder(9 - half, y, half * 2, 1, red)
  }
  art.cylinder(3, 20, 12, 2, red)
  art.ball(9, 14, 3.4, 3.4, steel)
  art.ball(9, 14, 2.3, 2.3, shades(PAL.blue, 0.4, 0.4))
  art.set(8, 13, '#ffffff')
  art.poly(
    [
      [5, 25],
      [13, 25],
      [14, 29],
      [4, 29],
    ],
    steel[0],
  )
  art.outline(outlineOf(dark))
  return art
}

export const rocketCameo: Cameo = {
  w: 52,
  h: 56,
  duration: 5800,
  origin: [24, 56],
  spread: 30,
  paint(t, dark) {
    const art = new Raster(52, 56)
    const g = 55
    const cx = 24
    const smoke = shades(dark ? '#9a9a9a' : '#d6d6d6', 0.2, 0.4)

    // Smoke: puffs rolling out from under it once lit, then along its way up, growing, then
    // shrinking away
    const puffs: [number, number, number][] = []
    for (let i = 0; i < 10; i++) {
      const born = IGNITE + 60 + i * 70
      const age = t - born
      if (age < 0 || age > 2200) continue
      const side = i % 2 ? 1 : -1
      const r = 2 + Math.min(1, age / 500) * (2.5 + rand(i) * 1.5) - Math.max(0, age - 1500) / 260
      if (r > 0.6)
        puffs.push([cx + side * (5 + age * 0.012 * (1 + rand(i + 9))), g - 3 - age * 0.003, r])
    }
    for (let i = 0; i < 12; i++) {
      const born = LIFT + i * 65
      const age = t - born
      if (age < 0 || age > 1700) continue
      // Where its nozzle was then, drifting apart as it rises
      const y = g - 4 - 0.00009 * (born - LIFT) ** 2 - age * 0.004
      const r =
        1.2 + Math.min(1, age / 450) * (2 + rand(i + 30) * 1.5) - Math.max(0, age - 1000) / 280
      if (r > 0.6) puffs.push([cx + (rand(i + 60) - 0.5) * 5 + Math.sin(age / 300 + i) * 1.5, y, r])
    }
    for (const [x, y, r] of puffs) art.ball(x, y, r, r * 0.85, smoke)

    // The pad
    const steel = shades(PAL.steel, 0.35, 0.4)
    art.box(cx - 12, g - 3, 25, 3, steel)
    art.rect(cx - 10, g, 2, 1, steel[0])
    art.rect(cx + 9, g, 2, 1, steel[0])

    // The countdown, each figure popping over the pad
    COUNT.forEach((at, i) => {
      if (t < at || t >= at + 480) return
      const k = pop(t, at, 200)
      text(art, String(3 - i), cx + 13, 18 - Math.round(4 * k), PAL.orange, 2)
    })

    // It shakes once lit, then goes, faster and faster
    const lift = t < LIFT ? 0 : 0.00009 * (t - LIFT) ** 2
    const shake = t >= IGNITE && t < LIFT + 300 ? (Math.floor(t / 45) % 2) * 2 - 1 : 0
    // Smaller and smaller as it goes, far up into the sky, gone before the top of its box
    const far = Math.max(0, 1 - lift / 46)
    const nozzle = g - 3 - lift
    const x = cx + shake * 0.6
    art.outline(outlineOf(dark))
    if (far > 0.18) art.blit(rocket(dark), 9, 30, x, nozzle, 0, far, far)

    // The flame under the nozzle, flickering, longer once it flies
    if (t >= IGNITE && far > 0.18) {
      const flicker = rand(Math.floor(t / 50))
      const length = (4 + flicker * 3 + (t >= LIFT ? 4 : 0)) * far
      art.ball(x, nozzle + length / 2, 3.4 * far, length / 2 + far, shades(PAL.red, 0.1, 0.1))
      art.ball(x, nozzle + length / 2 - 0.5, 2.4 * far, length / 2, shades(PAL.orange, 0.1, 0.2))
      art.ball(x, nozzle + length / 3, 1.3 * far, length / 3, shades(PAL.yellow, 0, 0.5))
    }
    // Where it vanished, a star, then another
    twinkle(art, cx, 10, t, LIFT + 640, PAL.yellow, 600)
    twinkle(art, cx + 7, 5, t, LIFT + 1000, '#ffffff', 450)
    return art
  },
}
