// Posts and reflections: a ruled page grows out of the card, a pencil writes a line of joined-up
// handwriting on it, lifts, taps, thinks (three dots), an idea flickers on in a bulb above and
// shines, the pencil underlines what it wrote, and it all folds back
import { ease, outlineOf, PAL, pop, Raster, shades, smooth, twinkle, type Cameo } from './art'

const WRITE = [400, 2500] as const
const THINK = [2750, 2900, 3050] as const
const BULB = 3200
const LIT = [3350, 3430, 3520] as const
const UNDERLINE = [4300, 4700] as const

// The page: its left, top, width, height, and the line it writes on
const PAGE = { x: 3, y: 31, w: 46, h: 24, line: 47 }

// A pencil lying left to right, its point on the left (x 0, y 3)
function pencil(dark: boolean) {
  const art = new Raster(31, 7)
  const body = shades(PAL.yellow, 0.18, 0.5)
  const wood = shades('#e8c49a', 0.2, 0.4)
  const steel = shades(PAL.steel, 0.3, 0.45)
  const rubber = shades(PAL.pink, 0.2, 0.35)
  art.rect(0, 3, 1, 1, '#3a3a3a')
  art.rect(1, 2, 1, 3, '#3a3a3a')
  for (let x = 2; x < 7; x++) {
    const half = Math.round(((x - 1) / 6) * 3)
    for (let y = 3 - half; y <= 3 + half; y++) art.set(x, y, wood[y < 3 ? 2 : y > 4 ? 0 : 1])
  }
  for (let x = 7; x < 23; x++)
    for (let y = 0; y < 7; y++) art.set(x, y, body[y < 2 ? 2 : y > 4 ? 0 : 1])
  for (let x = 23; x < 26; x++)
    for (let y = 0; y < 7; y++) art.set(x, y, y === 6 ? steel[0] : steel[(x + y) % 2 ? 1 : 2])
  for (let x = 26; x < 31; x++)
    for (let y = x === 30 ? 1 : 0; y < (x === 30 ? 6 : 7); y++)
      art.set(x, y, rubber[y < 2 ? 2 : y > 4 ? 0 : 1])
  art.outline(outlineOf(dark))
  return art
}

// The handwriting: loops going up, a gap between two words; s from 0 to 1
function hand(s: number): [number, number] {
  const turn = s * 2 * Math.PI * 4.5
  return [12 + 30 * s + 1.7 * Math.sin(turn), PAGE.line - 3 * (1 - Math.cos(turn))]
}
const GAP = [0.47, 0.53] as const

export const pencilCameo: Cameo = {
  w: 72,
  h: 56,
  duration: 5800,
  origin: [26, 56],
  spread: 32,
  paint(t, dark) {
    const art = new Raster(72, 56)
    const paper = shades(PAL.paper, 0.1, 0.5)
    // The page, ruled, a red margin
    art.box(PAGE.x, PAGE.y, PAGE.w, PAGE.h, paper)
    for (let y = PAGE.y + 4; y < PAGE.y + PAGE.h - 1; y += 4)
      art.line(PAGE.x + 1, y, PAGE.x + PAGE.w - 2, y, '#bcd6f5')
    art.line(PAGE.x + 7, PAGE.y + 1, PAGE.x + 7, PAGE.y + PAGE.h - 2, PAL.pink)

    // The bulb: it pops in dark, flickers, and lights up
    const shown = pop(t, BULB)
    const lit = t >= LIT[2] || (t >= LIT[0] && t < LIT[1])
    const [bx, by] = [62, 15]
    if (shown > 0) {
      const glass = lit ? shades(PAL.yellow, 0.15, 0.6) : shades('#d0d0d0', 0.2, 0.5)
      art.box(bx - 2, by + 5 * shown, 5, 4 * shown, shades(PAL.steel, 0.3, 0.45))
      art.ball(bx + 0.5, by, 5.5 * shown, 6 * shown, glass)
      if (shown > 0.8) {
        const wire = lit ? '#fff6c8' : '#888888'
        art.line(bx - 1, by + 3, bx - 1, by, wire)
        art.line(bx + 2, by + 3, bx + 2, by, wire)
        art.line(bx - 1, by, bx + 2, by, wire)
      }
    }
    art.outline(outlineOf(dark))

    // What it writes, in graphite, with a gap between two words
    const ink = '#3a3a3a'
    const written = smooth(t, WRITE[0], WRITE[1])
    let last = hand(0)
    for (let s = 0; s <= written; s += 0.004) {
      const p = hand(s)
      if (s < GAP[0] || s > GAP[1]) art.line(last[0], last[1], p[0], p[1], ink)
      last = p
    }
    const under = ease(t, UNDERLINE[0], UNDERLINE[1])
    if (under > 0) art.line(11, PAGE.line + 2, 11 + 32 * under, PAGE.line + 2, ink)

    // Its point: along the words, then up to think, tapping, then along the underline, and up
    let [x, y] = hand(written)
    if (t >= WRITE[1] && t < UNDERLINE[0]) {
      const up = ease(t, WRITE[1], WRITE[1] + 250)
      const tap =
        t > THINK[0] - 200 && t < THINK[2] ? Math.abs(Math.sin((t - THINK[0]) / 70)) * 2 : 0
      x += (36 - x) * up
      y += (PAGE.line - 9 - y) * up + tap
    } else if (t >= UNDERLINE[0]) {
      const back = 1 - ease(t, UNDERLINE[0] - 200, UNDERLINE[0])
      x = 11 + 32 * under + back * 30
      y = PAGE.line + 2 - back * 9 - 9 * ease(t, UNDERLINE[1], UNDERLINE[1] + 300)
    }
    const tilt = -0.9 + (t < WRITE[1] ? 0.1 * Math.sin(written * 60) : 0)
    art.blit(pencil(dark), 0.5, 3.5, x, y, tilt)

    // Thinking, a dot after another, up to the idea
    if (t < LIT[2] + 200)
      THINK.forEach((at, i) => {
        if (t >= at) art.ball(52 + i * 2.5, 27 - i * 4, 0.9 + i * 0.4, 0.9 + i * 0.4, paper)
      })
    // Lit: its rays come and go, sparks around it
    if (lit && shown > 0.8) {
      const fade = 1 - ease(t, 5000, 5400)
      const reach = (3 + 1.5 * Math.sin(t / 90)) * fade
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 2 * Math.PI
        const [cx, cy] = [Math.cos(a), Math.sin(a)]
        if (cy > 0.75) continue
        art.line(
          bx + 0.5 + cx * 8.5,
          by + cy * 9,
          bx + 0.5 + cx * (8.5 + reach),
          by + cy * (9 + reach),
          PAL.gold,
        )
      }
      twinkle(art, 51, 6, t, 3700, PAL.yellow)
      twinkle(art, 69, 24, t, 3950, PAL.yellow)
      twinkle(art, 66, 4, t, 4250, PAL.yellow)
    }
    return art
  },
}
