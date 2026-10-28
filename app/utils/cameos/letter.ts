// Contact details: a sealed envelope hops twice on the card, its seal bursts, the flap swings
// open, a letter slides up and three hearts float out of it, beating; the letter goes back
// down, the flap shuts, the seal pops back on, and down
import {
  burst,
  ease,
  heart,
  hop,
  outlineOf,
  PAL,
  pop,
  Raster,
  shades,
  smooth,
  twinkle,
  type Cameo,
} from './art'

const HOPS = [250, 750] as const
const SEAL = 1300
const FLAP = [1400, 1700, 4450, 4750] as const
const CARD = [1700, 2050, 4100, 4400] as const
const HEARTS = [2050, 2450, 2850] as const
const RESEAL = 4800

export const letter: Cameo = {
  w: 56,
  h: 44,
  duration: 5400,
  origin: [24, 44],
  spread: 28,
  paint(t, dark) {
    const art = new Raster(56, 44)
    const g = 43
    const paper = shades(PAL.paper, 0.16, 0.5)
    const inside = shades('#e2d6c6', 0.2, 0.3)
    const red = shades(PAL.red, 0.3, 0.35)

    // Its hops, squashing it
    let up = 0
    let k = 0
    for (const at of HOPS) {
      const h = hop(t, at, 420)
      up += h.up * 7
      k += h.k
    }
    const [w, h] = [28 * (1 + k * 0.6), 18 * (1 - k)]
    const [x0, y0] = [24 - w / 2, g + 1 - h - up]
    const at = (x: number, y: number): [number, number] => [x0 + x * (w / 28), y0 + y * (h / 18)]

    // The flap swings open about the top edge: its tip from down over the front to up behind
    const open = smooth(t, FLAP[0], FLAP[1]) * (1 - smooth(t, FLAP[2], FLAP[3]))
    const swing = Math.cos(open * Math.PI)
    const flap = () =>
      art.poly(
        [at(0, 0), at(28, 0), [x0 + w / 2, y0 + swing * 11 * (h / 18)]],
        swing >= 0 ? paper[1] : inside[0],
      )

    // Behind: the back, the flap when open, the letter sliding up
    art.box(x0, y0, w, h, inside)
    if (swing < 0) flap()
    const card = ease(t, CARD[0], CARD[1]) * (1 - ease(t, CARD[2], CARD[3]))
    if (card > 0) {
      const cy = y0 + 2 - card * 12
      art.box(x0 + 4, cy, w - 8, 14, paper)
      for (let ly = cy + 3; ly < cy + 12; ly += 3) art.line(x0 + 6, ly, x0 + w - 7, ly, '#b0b0b0')
    }
    // The front: the pocket and its folds, the flap over it when shut
    art.poly([at(0, 0), at(14, 9), at(28, 0), at(28, 18), at(0, 18)], paper[1])
    art.line(...at(0, 18), ...at(13, 10), paper[0])
    art.line(...at(28, 18), ...at(15, 10), paper[0])
    art.rect(x0, y0 + h - 1, w, 1, paper[0])
    if (swing >= 0) flap()
    // The seal on the flap's tip: it bursts, and pops back on once shut
    const back = pop(t, RESEAL, 260)
    if (t < SEAL || back > 0) {
      const r = 2.8 * (t < SEAL ? 1 : back)
      art.ball(x0 + w / 2, y0 + 10 * (h / 18), r, r, red)
    }
    art.outline(outlineOf(dark))
    burst(art, x0 + w / 2, y0 + 10, t, SEAL, [PAL.red, PAL.pink, PAL.yellow], {
      n: 10,
      speed: 0.05,
      life: 450,
      seed: 7,
    })

    // The hearts, out of the letter, floating up and swaying, beating, shrinking away
    HEARTS.forEach((born, i) => {
      const age = t - born
      if (age < 0 || age > 1500) return
      const size = (2.4 + (i % 2) * 0.6) * (1 - Math.max(0, age - 1000) / 500)
      const beat = 1 + 0.2 * Math.max(0, Math.sin(age / 130)) ** 6
      const hx = 24 + (i - 1) * 7 + Math.sin(age / 200 + i) * 3
      art.blit(heartSprite(size * beat, dark), 6, 6, hx, y0 - 6 - age * 0.014)
    })
    twinkle(art, 40, y0 - 4, t, 2300, PAL.yellow)
    twinkle(art, 9, y0 - 8, t, 2700, '#ffffff')
    return art
  },
}

// A heart on its own raster, outlined
function heartSprite(size: number, dark: boolean) {
  const art = new Raster(13, 13)
  if (size > 0.5) heart(art, 6.5, 5.5, size, shades(PAL.red, 0.3, 0.4))
  art.outline(outlineOf(dark))
  return art
}
