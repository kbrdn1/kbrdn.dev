// Roles and degrees: a mortarboard sits by a rolled diploma; it crouches, is thrown up
// tumbling, confetti bursts at the top of its flight, it falls back onto the diploma with a
// squash, its tassel swinging on, twinkles, and down
import { ease, outlineOf, PAL, rand, Raster, shades, smooth, twinkle, type Cameo } from './art'

const CROUCH = [500, 750] as const
const THROW = [750, 2050] as const
const APEX = 1400

// The mortarboard, 26 × 14: its board in perspective, the cap under it, the button on top
function mortarboard(dark: boolean) {
  const art = new Raster(26, 14)
  const black = dark ? shades('#4a4a4a', 0.35, 0.4) : shades('#2a2a2a', 0.4, 0.35)
  art.poly(
    [
      [6, 7],
      [20, 7],
      [19, 13],
      [7, 13],
    ],
    black[0],
  )
  art.rect(7, 12, 12, 1, black[1])
  art.poly(
    [
      [1, 5],
      [13, 1],
      [25, 5],
      [13, 9],
    ],
    black[1],
  )
  art.line(1, 5, 13, 1, black[2])
  art.line(13, 1, 25, 5, black[2])
  art.line(1, 5, 13, 9, black[0])
  art.ball(13, 5, 1.6, 1.2, shades(PAL.gold, 0.3, 0.4))
  art.outline(outlineOf(dark))
  return art
}

// The diploma, rolled, lying: a cream scroll with a red ribbon
function diploma(art: Raster, x: number, y: number) {
  const cream = shades(PAL.cream, 0.2, 0.4)
  for (let j = 0; j < 6; j++) art.rect(x, y + j, 20, 1, cream[j < 2 ? 2 : j > 3 ? 0 : 1])
  art.ball(x, y + 3, 1.5, 3, cream)
  art.ball(x + 20, y + 3, 1.5, 3, shades('#e8c49a', 0.25, 0.3))
  art.rect(x + 9, y, 2, 6, PAL.red)
  art.poly(
    [
      [x + 9, y + 6],
      [x + 7, y + 9],
      [x + 9, y + 8],
    ],
    PAL.red,
  )
  art.poly(
    [
      [x + 11, y + 6],
      [x + 13, y + 9],
      [x + 11, y + 8],
    ],
    PAL.red,
  )
}

export const cap: Cameo = {
  w: 56,
  h: 56,
  duration: 5200,
  origin: [26, 56],
  spread: 32,
  paint(t, dark) {
    const art = new Raster(56, 56)
    const g = 55
    diploma(art, 18, g - 9)

    // Where the board's middle is, how far it has turned, squashed or not
    let [x, y] = [27, g - 12]
    let angle = 0
    let k = 0
    if (t >= CROUCH[0] && t < THROW[0]) k = 0.18 * ease(t, CROUCH[0], CROUCH[1])
    if (t >= THROW[0] && t < THROW[1]) {
      const p = (t - THROW[0]) / (THROW[1] - THROW[0])
      y = g - 12 - 40 * 4 * p * (1 - p)
      x = 27 + 4 * Math.sin(p * Math.PI)
      angle = smooth(t, THROW[0], THROW[1]) * Math.PI * 2 * 1.5
    }
    if (t >= THROW[1] && t < THROW[1] + 300) {
      const p = (t - THROW[1]) / 300
      k = 0.2 * Math.cos(p * Math.PI * 1.5) * (1 - p)
    }
    const board = mortarboard(dark)
    art.outline(outlineOf(dark))
    art.blit(board, 13, 9, x, y + 3, angle, 1 + k * 0.6, 1 - k)

    // The tassel: from the button to the board's corner, hanging, swinging on after the landing
    const swing =
      t >= THROW[1]
        ? 0.7 * Math.sin((t - THROW[1]) / 120) * Math.exp(-(t - THROW[1]) / 900)
        : Math.sin(t / 300) * 0.1
    if (t < THROW[0] || t >= THROW[1]) {
      const corner: [number, number] = [x + 12 * (1 + k * 0.6), y + 3]
      art.line(x, y - 1, corner[0], corner[1], PAL.gold)
      const end: [number, number] = [
        corner[0] + Math.sin(swing) * 7,
        corner[1] + Math.cos(swing) * 7,
      ]
      art.line(corner[0], corner[1], end[0], end[1], PAL.gold)
      art.ball(end[0], end[1] + 1, 1.6, 2, shades(PAL.gold, 0.3, 0.4))
    }

    // Confetti from the top of the throw, fluttering down as they turn
    if (t >= APEX && t < APEX + 2000) {
      const dt = t - APEX
      const colors = [PAL.red, PAL.yellow, PAL.blue, PAL.green, PAL.purple, PAL.orange]
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * 2 * Math.PI + rand(i) * 0.3
        const v = 0.03 + rand(i + 20) * 0.025
        const px = 29 + Math.cos(a) * v * dt + Math.sin(dt / 160 + i) * 1.5
        const py = 6 + Math.sin(a) * v * dt * 0.7 + 0.000018 * dt * dt
        if (py > g) continue
        const flat = Math.floor(dt / 110 + i) % 2
        art.rect(px, py, flat ? 2 : 1, flat ? 1 : 2, colors[i % colors.length]!)
      }
    }
    twinkle(art, 44, 30, t, 2300, PAL.yellow)
    twinkle(art, 12, 26, t, 2600, '#ffffff')
    twinkle(art, 40, 18, t, 2950, PAL.yellow)
    return art
  },
}
