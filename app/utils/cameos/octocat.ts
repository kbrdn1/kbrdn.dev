// GitHub activity: the Octocat grows out of the card, breathes, looks left and right, raises a
// tentacle and taps a contribution square from empty up to the busiest green, a "+1" pops,
// the square flies off and bursts, it jumps for joy, waves, and folds back into the card
import { burst, ease, FRAME, Raster, text, type Cameo, type Tones } from './art'

const OCTOCAT = {
  light: {
    outline: '#1b1f23',
    body: ['#22272e', '#30363d', '#484f58'] as Tones,
    face: ['#dca17d', '#f2c6a4', '#fde4d0'] as Tones,
    ear: '#e79aa4',
    eye: '#1b1f23',
    glint: '#ffffff',
    nose: '#d9667a',
    // The contribution graph's levels, empty to busiest, and a cell's outline
    levels: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    cell: '#1b1f23',
  },
  dark: {
    outline: '#0d1117',
    body: ['#8b949e', '#c9d1d9', '#f0f6fc'] as Tones,
    face: ['#dca17d', '#f2c6a4', '#fde4d0'] as Tones,
    ear: '#e79aa4',
    eye: '#0d1117',
    glint: '#ffffff',
    nose: '#d9667a',
    levels: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    cell: '#0d1117',
  },
}

// Its scene (ms): looking around, the square tapped up, the jump, the wave
const LOOK = [700, 1300, 1900] as const
const BLINK = 2050
const RAISE = 2250
const TAPS = [2550, 2800, 3050, 3300] as const
const FLY = 3550
const BURST = 3850
const JUMP = { crouch: 4050, off: 4170, land: 4570 } as const
const WAVE = [4750, 5300] as const

export const octocat: Cameo = {
  w: 44,
  h: 56,
  duration: 5750,
  origin: [22, 56],
  spread: 30,
  paint(t, dark) {
    const c = OCTOCAT[dark ? 'dark' : 'light']
    const art = new Raster(44, 56)
    const cx = 22

    // Squash (k > 0) and stretch (k < 0), and how high it is off the ground
    let k = 0
    let lift = 0
    if (t >= JUMP.crouch && t < JUMP.off) k = 0.14 * ease(t, JUMP.crouch, JUMP.off)
    else if (t >= JUMP.off && t < JUMP.land) {
      const p = (t - JUMP.off) / (JUMP.land - JUMP.off)
      lift = 36 * p * (1 - p)
      k = -0.1 * (1 - p)
    } else if (t >= JUMP.land && t < JUMP.land + 260) {
      const p = (t - JUMP.land) / 260
      k = 0.16 * Math.cos(p * Math.PI * 1.5) * (1 - p)
    }
    // Breathing: up a pixel now and then
    const breath = t < JUMP.crouch && Math.sin(t / 260) > 0.55 ? 1 : 0
    const base = art.h - 1 - Math.round(lift)
    // A point dy above its feet, dx off its middle, squashed or stretched
    const X = (dx: number) => cx + dx * (1 + k * 0.6)
    const Y = (dy: number) => base - dy * (1 - k)
    // The tentacles sway, and swing after a landing
    const shake = 1 + (t >= JUMP.land ? 2.5 * Math.max(0, 1 - (t - JUMP.land) / 700) : 0)
    // The right one raised: for the taps, then for the wave
    const raised =
      t < FLY + 100
        ? ease(t, RAISE, RAISE + 250) * (1 - ease(t, FLY - 50, FLY + 100))
        : ease(t, WAVE[0], WAVE[0] + 200) * (1 - ease(t, WAVE[1] - 150, WAVE[1]))
    // Each tap bobs it down a little
    const tap = TAPS.reduce((d, at) => d + Math.max(0, 1 - Math.abs(t - at - 60) / 90), 0)

    // Tentacles: five from under the body, the outer ones curling out; the right one, raised,
    // from its side, up and out beside the head, in front of it
    let tip: [number, number] = [0, 0]
    const tentacle = (i: number) => {
      const out = (i - 2) * 0.32
      const up = i === 4 ? raised : 0
      let x = X((i - 2) * 2.4 + 2.5 * up)
      let y = Y(7.5 + 2.5 * up)
      for (let s = 0; s <= 7; s++) {
        const sway = (0.1 + 0.035 * s) * shake * Math.sin(t / 170 + i * 1.3 - s * 0.55)
        const curl = Math.abs(i - 2) === 2 ? Math.max(0, s - 4) * 0.42 * Math.sign(i - 2) : 0
        const hello = t >= WAVE[0] ? 0.45 * Math.sin(t / 90) : 0
        const angle = (out + sway + curl) * (1 - up) + (2.65 - 0.1 * s + hello - tap * 0.3) * up
        const r = s < 3 ? 1.25 : s < 6 ? 0.95 : 0.7
        art.ball(x, y, r, r, c.body)
        x += Math.sin(angle) * 1.15
        y += Math.cos(angle) * 1.15
      }
      if (i === 4) tip = [x, y]
    }
    for (let i = 0; i < 4; i++) tentacle(i)
    if (!raised) tentacle(4)

    // Body, ears, head, face
    art.ball(X(0), Y(9.5), 6 * (1 + k * 0.6), 3.4 * (1 - k), c.body)
    const hy = Y(19 + breath)
    for (const s of [-1, 1]) {
      art.poly(
        [
          [X(s * 10.5), hy - 2],
          [X(s * 8.5), hy - 11 * (1 - k)],
          [X(s * 3.5), hy - 7.5],
        ],
        c.body[1],
      )
      art.poly(
        [
          [X(s * 9), hy - 3.5],
          [X(s * 8.3), hy - 8.5 * (1 - k)],
          [X(s * 5.5), hy - 6.5],
        ],
        c.ear,
      )
    }
    art.ball(X(0), hy, 11 * (1 + k * 0.6), 8.6 * (1 - k), c.body)
    const fy = hy + 2.5
    art.ball(X(0), fy, 8 * (1 + k * 0.6), 5.2 * (1 - k), c.face)
    if (raised) tentacle(4)

    // Eyes: ahead, left, right; shut a moment, and smiling once landed
    const gaze = t >= LOOK[0] && t < LOOK[1] ? -1 : t >= LOOK[1] && t < LOOK[2] ? 1 : 0
    const shut = (t >= BLINK && t < BLINK + 2 * FRAME) || (t >= JUMP.land && t < WAVE[1])
    for (const s of [-1, 1]) {
      const ex = Math.round(X(s * 3.6) - 1) + gaze
      const ey = Math.round(fy - 2)
      if (shut) {
        art.set(ex, ey + 1, c.eye)
        art.set(ex + 1, ey, c.eye)
        art.set(ex + 2, ey + 1, c.eye)
      } else {
        art.rect(ex, ey - 1, 2, 4, c.eye)
        art.set(ex, ey - 1, c.glint)
      }
    }
    art.rect(Math.round(X(0)) - 1, Math.round(fy + 1), 2, 1, c.nose)
    // Whiskers, out over the cheeks
    for (const s of [-1, 1])
      for (const dy of [0.5, 2])
        for (let d = 6.5; d < 11; d++)
          art.set(X(s * d) - (s < 0 ? 1 : 0), Math.round(fy + dy) + (d > 9 ? 1 : 0), c.eye)

    art.outline(c.outline)

    // The contribution square over the raised tip: it pops in empty, each tap a level up and a
    // bounce, then it flies off and bursts
    if (t >= TAPS[0] - 150 && t < BURST) {
      const level = TAPS.filter((at) => t >= at).length
      const flown = 22 * ease(t, FLY, BURST) ** 2
      const pop = 1 + 0.35 * Math.max(0, ...TAPS.map((at) => 1 - Math.abs(t - at - 40) / 120))
      const size = Math.round(7 * pop)
      const sx = Math.round(tip[0] + 2 - size / 2)
      const sy = Math.round(tip[1] - 6 - size / 2 - flown)
      art.rect(sx, sy, size, size, c.cell)
      art.rect(sx + 1, sy + 1, size - 2, size - 2, c.levels[level]!)
      // Rounded corners
      for (const [x, y] of [
        [sx, sy],
        [sx + size - 1, sy],
        [sx, sy + size - 1],
        [sx + size - 1, sy + size - 1],
      ] as const)
        art.set(x, y, undefined)
      // "+1" pops over it at the last tap, rising
      if (t >= TAPS[3] && t < FLY + 150) {
        const rise = Math.round(4 * ease(t, TAPS[3], TAPS[3] + 300))
        text(art, '+1', sx - 1, sy - 7 - rise, c.levels[4]!)
      }
    }
    // The burst: green blocks flung out, falling, gone
    burst(art, tip[0] + 2, tip[1] - 28, t, BURST, c.levels.slice(1), {
      n: 16,
      speed: 0.05,
      life: 700,
    })
    return art
  },
}
