// An article's share row: a megaphone pops up beside the buttons, takes a breath (it swells),
// and calls out twice: sound waves spread from its bell, a heart, a star and a "+1" fly out
// of it and fall away; a recoil each time, and down
import {
  burst,
  ease,
  heart,
  outlineOf,
  PAL,
  pop,
  rand,
  Raster,
  shades,
  text,
  type Cameo,
} from './art'

const IN = 200
const CALLS = [1100, 2700] as const
const BREATH = 350

// The megaphone, 30 × 20, pointing right: a handle, the body narrowing back, the bell's rim
function megaphone(dark: boolean, swell: number) {
  const art = new Raster(32, 22)
  const red = shades(PAL.red, 0.3, 0.35)
  const white = shades(PAL.paper, 0.15, 0.5)
  const steel = shades(PAL.steel, 0.35, 0.4)
  const s = 1 + swell * 0.12
  // Handle under the body
  art.box(8, 13, 4, 7, steel)
  // The body: narrow at the back, wide at the bell, lit on top
  for (let x = 2; x < 26; x++) {
    const half = (2.5 + (x - 2) * 0.28) * s
    for (let y = Math.round(11 - half); y <= Math.round(11 + half); y++) {
      const ny = (y - 11) / half
      art.set(x, y, red[ny < -0.45 ? 2 : ny > 0.45 ? 0 : 1])
    }
  }
  // The bell's white rim, the mouthpiece at the back
  for (let y = Math.round(11 - 9.5 * s); y <= Math.round(11 + 9.5 * s); y++) {
    art.set(26, y, white[1])
    art.set(27, y, white[0])
  }
  art.box(0, 9, 3, 5, steel)
  art.outline(outlineOf(dark))
  return art
}

export const megaphoneCameo: Cameo = {
  w: 72,
  h: 48,
  duration: 4800,
  origin: [16, 48],
  spread: 26,
  paint(t, dark) {
    const art = new Raster(72, 48)
    const g = 47
    // A breath before each call, a recoil at it
    let swell = 0
    let recoil = 0
    for (const at of CALLS) {
      if (t >= at - BREATH && t < at) swell = ease(t, at - BREATH, at)
      if (t >= at && t < at + 250) recoil = 1 - (t - at) / 250
    }
    const size = pop(t, IN, 300)
    const tilt = -0.32 + recoil * 0.12
    if (size > 0) art.blit(megaphone(dark, swell), 9, 20, 14 - recoil * 2, g + 1, tilt, size, size)

    // Each call: three waves spreading from the bell, and what flies out of it
    const bell: [number, number] = [36, g - 22]
    CALLS.forEach((at, n) => {
      const dt = t - at
      if (dt < 0 || dt > 1400) return
      for (let i = 0; i < 3; i++) {
        const r = 4 + dt * 0.03 - i * 5
        if (r < 3 || r > 22) continue
        for (let a = -0.9; a <= 0.5; a += 0.04)
          if (rand(Math.round(a * 100) + i * 7) > 0.25)
            art.set(
              bell[0] + Math.cos(a) * r,
              bell[1] + Math.sin(a) * r,
              dark ? '#9a9a9a' : '#b0b0b0',
            )
      }
      // A heart, a star, a "+1": out up and right, then falling away
      const fly = (i: number): [number, number] => {
        const a = -0.75 + i * 0.32 + n * 0.1
        const v = 0.03 + i * 0.004
        return [bell[0] + Math.cos(a) * v * dt, bell[1] + Math.sin(a) * v * dt + 0.000025 * dt * dt]
      }
      if (dt < 1200) {
        const [hx, hy] = fly(0)
        heart(art, hx, hy, 2.4, shades(PAL.red, 0.3, 0.4))
        const [sx, sy] = fly(1)
        for (const [dx, dy] of [
          [0, -2],
          [-2, 0],
          [2, 0],
          [0, 2],
          [0, 0],
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ])
          art.set(sx + dx!, sy + dy!, PAL.yellow)
        const [px, py] = fly(2)
        text(art, '+1', px, py, PAL.green)
      }
    })
    art.outline(outlineOf(dark))
    CALLS.forEach((at, i) =>
      burst(art, bell[0], bell[1], t, at, [PAL.yellow, '#ffffff'], {
        n: 6,
        speed: 0.05,
        life: 300,
        seed: i + 11,
      }),
    )
    return art
  },
}
