// /parcours: a crab climbs the trail up a snowy mountain to the flag on its peak, cheers in
// confetti, slides down the far side and walks back along the hills to start again. Pines at
// the foot, clouds and birds in the sky, the sun by day, the moon and stars by night.
import { crab } from '../cameos/climb'
import { outlineOf, PAL, rand, Raster, shades, type Rgb } from '../cameos/art'
import { type Hero, phase, wave } from './hero'

const W = 128
const H = 96
const PERIOD = 12000

// The trail up the lit face, foot to peak
const TRAIL: [number, number][] = [
  [26, 89],
  [48, 77],
  [36, 65],
  [53, 53],
  [45, 43],
  [57, 33],
  [62, 22],
]
const PEAK: [number, number] = [62, 17]
// Where it slides down to, and walks back from along the hills
const FOOT: [number, number] = [100, 89]

// A point a fraction f of the way along a polyline
function along(points: [number, number][], f: number): [number, number] {
  const lengths = points
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - points[i]![0], p[1] - points[i]![1]))
  let left = f * lengths.reduce((a, b) => a + b, 0)
  for (let i = 0; i < lengths.length; i++) {
    if (left <= lengths[i]! || i === lengths.length - 1) {
      const p = Math.min(1, left / lengths[i]!)
      const [a, b] = [points[i]!, points[i + 1]!]
      return [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p]
    }
    left -= lengths[i]!
  }
  return points.at(-1)!
}

function still(dark: boolean) {
  const art = new Raster(W, H)
  // The sun by day, the moon and its craters by night
  if (dark) {
    art.ball(20, 16, 6.5, 6.5, ['#9aa0a6', '#d0d4d8', '#f0f2f4'])
    art.ball(18, 15, 1.4, 1.4, ['#b8bec4', '#b8bec4', '#c4c9ce'])
    art.ball(22, 18, 1, 1, ['#b8bec4', '#b8bec4', '#c4c9ce'])
  } else art.ball(20, 16, 7, 7, shades(PAL.yellow, 0.15, 0.5))
  // The far mountain, then the near one: a lit face and a face in shadow, strata, snow
  const far = dark ? ['#4a4f58', '#3c4048'] : ['#cfc6bd', '#b8aea3']
  art.poly(
    [
      [66, 95],
      [104, 34],
      [104, 95],
    ],
    far[0]!,
  )
  art.poly(
    [
      [104, 34],
      [128, 70],
      [128, 95],
      [104, 95],
    ],
    far[1]!,
  )
  const [lit, shade] = dark ? ['#6e655b', '#4c453f'] : ['#bba68f', '#8f7a67']
  art.poly(
    [
      [2, 95],
      [62, 17],
      [70, 95],
    ],
    lit,
  )
  art.poly(
    [
      [62, 17],
      [118, 95],
      [70, 95],
    ],
    shade,
  )
  for (let i = 1; i < 6; i++) {
    const y = 17 + i * 13
    art.line(62 - (y - 17) * 0.77 + 3, y, 62 + (y - 17) * 0.1 - 1, y + 2, mixLine(lit))
    art.line(64 + (y - 17) * 0.1, y + 1, 62 + (y - 17) * 0.72 - 3, y - 1, mixLine(shade))
  }
  const snow = shades(PAL.paper, 0.14, 0.5)
  art.poly(
    [
      [62, 17],
      [52, 30],
      [55, 28],
      [58, 32],
      [62, 28],
      [64, 30],
    ],
    snow[2],
  )
  art.poly(
    [
      [62, 17],
      [64, 30],
      [67, 33],
      [70, 29],
      [73, 31],
    ],
    snow[0],
  )
  // The trail, stone by stone
  const stone = dark ? '#8a8070' : '#efe4d4'
  for (let f = 0; f <= 1; f += 0.018) {
    const [x, y] = along(TRAIL, f)
    art.set(x, y + 1, stone)
  }
  // The hills in front, pines on the left one
  const grass = shades(PAL.green, 0.38, 0.3)
  art.ball(28, 106, 46, 18, grass)
  art.ball(106, 108, 36, 17, grass)
  const pine = shades('#3f8f55', 0.35, 0.3)
  for (const [x, h] of [
    [9, 16],
    [17, 12],
  ] as const) {
    art.rect(x, 92 - 3, 2, 4, PAL.wood)
    for (let tier = 0; tier < 3; tier++) {
      const top = 92 - h + tier * (h / 4)
      art.poly(
        [
          [x + 1, top],
          [x - 5 + tier, top + h / 2.2],
          [x + 7 - tier, top + h / 2.2],
        ],
        pine[tier === 0 ? 2 : 1],
      )
    }
  }
  art.outline(outlineOf(dark))
  return art
}

// A darker line across a face
const mixLine = (base: Rgb) => shades(base, 0.18, 0)[0]

function paint(t: number, dark: boolean) {
  const art = new Raster(W, H)
  const u = phase(t, PERIOD)
  // The time within the loop: what flaps or steps by it repeats exactly from loop to loop
  const tl = u * PERIOD
  // Stars by night, twinkling; the sun's rays by day, breathing
  if (dark)
    for (let i = 0; i < 16; i++) {
      const [x, y] = [4 + rand(i) * 120, 2 + rand(i + 40) * 30]
      if (Math.abs(x - 20) < 9 && Math.abs(y - 16) < 9) continue
      if (wave(u, 3 + (i % 3), rand(i + 80)) > 0.2) art.set(x, y, i % 3 ? '#e0e0e0' : '#9a9a9a')
    }
  else
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 2 * Math.PI + u * Math.PI * 2 * 0.25
      const reach = 10 + 1.5 * (1 + wave(u, 6))
      art.line(
        20 + Math.cos(a) * 9,
        16 + Math.sin(a) * 9,
        20 + Math.cos(a) * reach,
        16 + Math.sin(a) * reach,
        PAL.gold,
      )
    }
  // Clouds drifting to and fro
  const cloud = dark ? shades('#5a6270', 0.25, 0.25) : shades('#ffffff', 0.12, 0)
  for (const [x0, y0, s] of [
    [40, 12, 1],
    [96, 22, 0.8],
  ] as const) {
    const x = x0 + 6 * wave(u, 1, x0 / 40)
    art.ball(x, y0, 6 * s, 3.2 * s, cloud)
    art.ball(x + 5 * s, y0 + 1, 5 * s, 2.6 * s, cloud)
    art.ball(x - 5 * s, y0 + 1, 4.5 * s, 2.4 * s, cloud)
  }
  // Two birds, flapping round the sky
  for (let b = 0; b < 2; b++) {
    const x = 94 + 16 * Math.sin(2 * Math.PI * (u + b * 0.3))
    const y = 10 + b * 6 + 3 * Math.sin(4 * Math.PI * (u + b * 0.3))
    const up = Math.floor(tl / 170 + b) % 2 ? -1 : 1
    const ink = dark ? '#c8c8c8' : '#3a3a3a'
    art.line(x - 3, y + up, x, y, ink)
    art.line(x, y, x + 3, y + up, ink)
  }
  // The flag on the peak, waving
  art.rect(PEAK[0], PEAK[1] - 11, 1, 11, '#7a7a7a')
  const cloth = shades(PAL.orange, 0.3, 0.35)
  for (let i = 1; i <= 8; i++) {
    const w = Math.sin(2 * Math.PI * 14 * u - i * 0.7)
    const tone = Math.cos(2 * Math.PI * 14 * u - i * 0.7)
    for (let j = 0; j < 5; j++)
      art.set(
        PEAK[0] + i,
        PEAK[1] - 11 + j + Math.round(w * (i / 8)),
        cloth[tone > 0.3 ? 2 : tone < -0.3 ? 0 : 1],
      )
  }

  // The crab: up the trail, a hop at each turn; cheers on the peak; slides down the far side;
  // walks back along the hills
  let [x, y] = TRAIL[0]!
  let k = 0
  let walking = true
  let open = false
  if (u < 0.5) {
    const f = u / 0.5
    ;[x, y] = along(TRAIL, f)
    const turn = (f * (TRAIL.length - 1)) % 1
    y -= Math.sin(turn * Math.PI) ** 8 * 3
  } else if (u < 0.62) {
    ;[x, y] = TRAIL.at(-1)!
    walking = false
    open = Math.floor(tl / 170) % 2 === 0
    const jump = Math.sin(((u - 0.5) / 0.12) * Math.PI * 3)
    y -= Math.max(0, jump) * 4
    k = jump < 0 ? -jump * 0.12 : 0
  } else if (u < 0.75) {
    const f = (u - 0.62) / 0.13
    ;[x, y] = [62 + (FOOT[0] - 62) * f, 22 + (FOOT[1] - 22) * f ** 1.4]
    walking = false
  } else {
    const f = (u - 0.75) / 0.25
    ;[x, y] = [
      FOOT[0] + (TRAIL[0]![0] - FOOT[0]) * f,
      FOOT[1] - Math.abs(Math.sin(f * Math.PI * 3)) * 1.5,
    ]
  }
  crab(art, x, y, tl, k, walking, open)
  art.outline(outlineOf(dark))

  // Confetti over the peak while it cheers
  if (u >= 0.5 && u < 0.66) {
    const dt = (u - 0.5) * PERIOD
    const colors = [PAL.red, PAL.yellow, PAL.blue, PAL.green, PAL.purple]
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * 2 * Math.PI
      const v = 0.018 + rand(i) * 0.012
      const cx = PEAK[0] + Math.cos(a) * v * dt
      const cy = PEAK[1] - 6 + Math.sin(a) * v * dt * 0.7 + 0.000012 * dt * dt
      art.rect(cx, cy, 1, Math.floor(dt / 120 + i) % 2 ? 2 : 1, colors[i % colors.length]!)
    }
  }
  return art
}

// At rest (reduced motion): cheering on the peak
export const climb: Hero = { w: W, h: H, period: PERIOD, rest: PERIOD * 0.55, still, paint }
