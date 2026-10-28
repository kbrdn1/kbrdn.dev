// Apps: a cannon rolls along on its treads, an invader beams in block by block and marches; the
// cannon tracks it, charges, fires; the invader flashes white and blows apart into its own
// blocks, "+100" rises, the cannon hops for joy, and down
import { INVADERS } from '../invaders'
import {
  burst,
  ease,
  hop,
  outlineOf,
  PAL,
  rand,
  Raster,
  shades,
  smooth,
  text,
  twinkle,
  type Cameo,
} from './art'

const ROLL = [0, 800] as const
const DROP = [300, 1100] as const
const MARCH = [1100, 2300] as const
const CHARGE = [2300, 2550] as const
const FIRE = 2550
const HIT = 2650
const BOOM = 2800
const HOP = 3700

// The crab of the arcade, two art pixels a block, each block lit on its top left
function invader(frame: number, dark: boolean, flash: boolean, shown: number) {
  const rows = INVADERS[1]![frame]!
  const art = new Raster(rows[0]!.length * 2 + 2, rows.length * 2 + 2)
  const purple = flash ? shades('#ffffff', 0.08, 0) : shades(PAL.purple, 0.3, 0.35)
  rows.forEach((row, j) =>
    [...row].forEach((c, i) => {
      // Beaming in, a block after another
      if (c !== '#' || rand(i * 7 + j * 13) >= shown) return
      art.rect(1 + i * 2, 1 + j * 2, 2, 2, purple[1])
      art.set(1 + i * 2, 1 + j * 2, purple[2])
      art.set(2 + i * 2, 2 + j * 2, purple[0])
    }),
  )
  art.outline(outlineOf(dark))
  return art
}

// The cannon, 20 × 14: treads and their wheels turning, a green hull, a turret, the barrel
function cannon(dark: boolean, roll: number) {
  const art = new Raster(20, 14)
  const green = shades(PAL.green, 0.32, 0.35)
  const tread = shades('#4a4a4a', 0.3, 0.4)
  art.box(1, 10, 18, 4, tread)
  for (let i = 0; i < 4; i++) {
    const x = 3.5 + i * 4.3
    art.ball(x, 12, 1.6, 1.6, shades('#7a7a7a', 0.3, 0.4))
    art.set(x + Math.cos(roll + i) * 1.1, 12 + Math.sin(roll + i) * 1.1, '#222222')
  }
  art.box(2, 6, 16, 4, green)
  art.ball(10, 6, 4.5, 3.5, green, 6.5)
  art.box(9, 0, 2, 5, green)
  art.outline(outlineOf(dark))
  return art
}

export const invadersCameo: Cameo = {
  w: 76,
  h: 56,
  duration: 5600,
  origin: [30, 56],
  spread: 32,
  paint(t, dark) {
    const art = new Raster(76, 56)
    const g = 55

    // The invader: beaming in block by block, then marching right a step at a time
    const steps = Math.min(3, Math.floor(Math.max(0, t - MARCH[0]) / 400))
    const ix = 30 + steps * 4
    const iy = 4
    const frame = Math.floor(t / (4 * 85)) % 2
    const flash = t >= HIT && t < BOOM && Math.floor(t / 50) % 2 === 0
    const shown = ease(t, DROP[0], DROP[1])
    if (t >= DROP[0] && t < BOOM) art.blit(invader(frame, dark, flash, shown), 0, 0, ix, iy)

    // The cannon: rolling in, then tracking the invader, recoiling when it fires, hopping
    const target = ix + 12 - 10
    const cx =
      4 + 18 * ease(t, ROLL[0], ROLL[1]) + (target - 22) * smooth(t, MARCH[0] + 200, MARCH[1])
    const recoil = t >= FIRE && t < FIRE + 150 ? 1 : 0
    const joy = hop(t, HOP, 420)
    const body = cannon(dark, cx / 1.6)
    art.blit(
      body,
      10,
      14,
      cx + 10,
      g + 1 + recoil - joy.up * 8,
      0,
      1 + joy.k * 0.6,
      1 - joy.k - recoil * 0.06,
    )

    // The charge at the barrel's mouth, the shot
    const mouth: [number, number] = [cx + 10, g - 13 + recoil]
    if (t >= CHARGE[0] && t < FIRE) {
      const r = 1 + 2.5 * ease(t, CHARGE[0], CHARGE[1])
      art.veil(mouth[0] - r, mouth[1] - r, r * 2, r * 2, PAL.yellow, Math.floor(t / 40))
    }
    if (t >= FIRE && t < HIT + 60) {
      const top = iy + 17
      art.line(mouth[0] - 1, mouth[1], mouth[0] - 1, top, PAL.orange)
      art.line(mouth[0] + 1, mouth[1], mouth[0] + 1, top, PAL.orange)
      art.line(mouth[0], mouth[1], mouth[0], top, '#ffffff')
    }
    // It blows apart: its blocks flung out and falling, a flash of debris, the score rising
    if (t >= BOOM && t < BOOM + 1100) {
      const dt = t - BOOM
      const rows = INVADERS[1]![frame]!
      rows.forEach((row, j) =>
        [...row].forEach((c, i) => {
          if (c !== '#') return
          const [dx, dy] = [i - rows[0]!.length / 2, j - rows.length / 2]
          // Out from the middle, each its own speed, then falling
          const len = Math.hypot(dx, dy - 1) || 1
          const v = 0.02 + rand(i * 13 + j) * 0.025
          const x = ix + 12 + dx * 2 + (dx / len) * v * dt
          const y = iy + 9 + dy * 2 + ((dy - 1) / len) * v * dt + 0.00006 * dt * dt
          if (rand(i + j * 11) * 1100 > dt) art.rect(x, y, 2, 2, PAL.purple)
        }),
      )
      text(art, '+100', ix + 4, iy + 2 - dt * 0.012, PAL.yellow)
    }
    art.outline(outlineOf(dark))
    burst(art, ix + 12, iy + 9, t, BOOM, [PAL.yellow, PAL.orange, '#ffffff'], {
      n: 12,
      speed: 0.07,
      life: 420,
      seed: 5,
    })
    twinkle(art, 34, 6, t, DROP[0], '#ffffff', 450)
    twinkle(art, 52, 14, t, DROP[0] + 250, PAL.purple, 450)
    twinkle(art, cx + 2, g - 20, t, HOP + 300, PAL.yellow)
    twinkle(art, cx + 20, g - 16, t, HOP + 500, '#ffffff')
    return art
  },
}
