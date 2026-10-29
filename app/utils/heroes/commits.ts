// /activity: an invader commits. Strapped to a jetpack, it flies to and fro over a contribution
// graph on an easel, a block held under it; over a column it lets go, the block falls and lands
// in a cell, which pops a level up, "+1". Like the arcade's invaders it speeds up as it goes,
// till the blocks rain; the full graph gleams, confetti flies, the invader spins for joy, and
// the cells drain back to empty in a wave.
import { INVADERS } from '../invaders'
import {
  clamp,
  ease,
  mix,
  outlineOf,
  PAL,
  pop,
  rand,
  Raster,
  shades,
  smooth,
  text,
  twinkle,
  type Rgb,
  type Tones,
} from '../cameos/art'
import { type Hero, phase, wave } from './hero'

const W = 128
const H = 96
const PERIOD = 16640
// Pose cadence: the loop is a whole number of two-pose steps, so the legs end where they start
const POSE = 80

// The graph: 13 weeks of 5 days, 6-pixel cells 7 apart
const COLS = 13
const ROWS = 5
const GX = 19
const GY = 39
const PITCH = 7
const CELL = 6
const cellX = (c: number) => GX + c * PITCH
const cellY = (r: number) => GY + r * PITCH
// A column's middle, in art pixels, from a column number (fractions for the turns past the ends)
const colMid = (c: number) => GX + c * PITCH + CELL / 2

// The levels, empty to busiest: the site's oranges, the busiest the darkest on a light page and
// the brightest on a dark one, as the site's own graph does
const LEVELS: Record<'light' | 'dark', Rgb[]> = {
  light: ['#e8e4df', '#f4c895', '#e8a573', '#d4825d', '#a64d2e'],
  dark: ['#2a2a2a', '#a64d2e', '#d4825d', '#e8a573', '#f4c895'],
}
const tonesOf = (color: Rgb): Tones => [
  mix(color, '#000000', 0.2),
  color,
  mix(color, '#ffffff', 0.38),
]
const TONES = {
  light: LEVELS.light.map(tonesOf),
  dark: LEVELS.dark.map(tonesOf),
}

// ── The script, worked out once: where the invader is when, and every block it drops

// Gravity, art pixels per ms²
const G = 0.0005
// The invader's top, hovering; the block hangs this far under it
const HOVER = 6
const HANG = 16
const hover = (t: number) => HOVER + Math.round(wave(t / PERIOD, 20))

interface Seg {
  t0: number
  t1: number
  x0: number
  x1: number
}
interface Drop {
  t: number
  col: number
  row: number
  // The cell's level once it lands
  to: number
  y0: number
  land: number
  // Slow ones say "+1"
  slow: boolean
}

const START = 400
const SEGS: Seg[] = []
const DROPS: Drop[] = []
// Each column's days in the order they are filled
const ORDER = Array.from({ length: COLS }, (_, c) =>
  [0, 1, 2, 3, 4].sort((a, b) => rand(c * 5 + a + 1) - rand(c * 5 + b + 1)),
)
const filled = Array.from({ length: COLS }, () => 0)
// How busy a day ends up, mostly light
const busy = (c: number, r: number) => {
  const p = rand(c * 11 + r * 17 + 5)
  return p < 0.32 ? 1 : p < 0.62 ? 2 : p < 0.85 ? 3 : 4
}
let clock = START
let at = -0.8

function move(to: number, d: number) {
  SEGS.push({ t0: clock, t1: clock + d, x0: at, x1: to })
  clock += d
  at = to
}
// Let a block go over a column at t: into the column's next empty day, or one more on a day
// already lit
function drop(col: number, t: number, slow: boolean, again?: Drop) {
  const row = again ? again.row : ORDER[col]![filled[col]!++]!
  const to = again ? again.to + 1 : slow ? 1 : busy(col, row)
  const y0 = hover(t) + HANG
  DROPS.push({ t, col, row, to, y0, land: t + Math.sqrt((2 * (cellY(row) - y0)) / G), slow })
}
// Where smoothstep reaches y (0 to 1)
const unsmooth = (y: number) => 0.5 - Math.sin(Math.asin(1 - 2 * y) / 3)
// A sweep from end to end without stopping, a block over every other column (so they fall
// apart, not in a chain)
function sweep(to: number, d: number, odd: number) {
  const from = at
  const cols = Array.from({ length: COLS }, (_, c) => (to > from ? c : COLS - 1 - c))
  for (const c of cols)
    if (c % 2 === odd && filled[c]! < ROWS)
      drop(c, clock + unsmooth((c - from) / (to - from)) * d, false)
  move(to, d)
}

// First pass, slow: it stops over four columns, one block each
for (const c of [1, 4, 7, 10]) {
  move(c, 100 + 60 * Math.abs(c - at))
  move(c, 100)
  drop(c, clock, true)
  move(c, 260)
}
move(12.8, 320)
// Back, quicker, without stopping long: the other columns, and twice a day already lit
for (const c of [12, 11, 9, 8, 7, 6, 5, 4, 3, 2, 0]) {
  move(c, 50 + 70 * Math.abs(c - at))
  const again = c === 7 || c === 4 ? DROPS.find((d) => d.col === c) : undefined
  drop(c, clock, true, again)
  move(c, 70)
}
move(-0.8, 200)
// Then sweeps, faster and faster, till every day is lit
;[1000, 900, 820, 760, 700, 660, 620, 600].forEach((d, k) => sweep(k % 2 ? -0.8 : 12.8, d, k % 2))

// The full graph: it gleams, confetti flies, the invader comes to the middle and spins
const FULL = Math.max(...DROPS.map((d) => d.land)) + 140
move(6, FULL + 100 - clock)
const SPIN = [clock, clock + 1000] as const
move(6, 1500)
// Then the cells drain, a wave from the left, and it flies back to where it starts
const DRAIN = FULL + 1900
move(6, DRAIN + 200 - clock)
move(-0.8, 1100)
// A new block grows under it before the loop starts again
const REGROW = PERIOD - 700

// Where the invader is (art pixels, its middle) and which way it is going at t
function flight(t: number) {
  for (const s of SEGS)
    if (t >= s.t0 && t < s.t1) {
      const p = smooth(t, s.t0, s.t1)
      return { x: colMid(s.x0 + (s.x1 - s.x0) * p), dir: Math.sign(s.x1 - s.x0) }
    }
  return { x: colMid(-0.8), dir: 0 }
}

// ── Painting

// A cell, w × h around (cx, cy), its corners rounded, lit on its top and left edges
function tile(art: Raster, cx: number, cy: number, w: number, h: number, tones: Tones) {
  const [x0, y0] = [Math.round(cx - w / 2), Math.round(cy - h / 2)]
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const [ex, ey] = [i === 0 || i === w - 1, j === 0 || j === h - 1]
      if (ex && ey) continue
      art.set(x0 + i, y0 + j, tones[j === h - 1 || i === w - 1 ? 0 : j === 0 || i === 0 ? 2 : 1])
    }
}

// The squid of the arcade at (x, y), its top left, two art pixels a block, each lit on its top
// left; behind it the jetpack's two tanks, out on either side
function invader(art: Raster, x: number, y: number, frame: number, dark: boolean) {
  const steel = shades(dark ? '#9a9a9a' : '#a8a8a8', 0.35, 0.45)
  for (const tx of [x - 4, x + 16]) {
    art.cylinder(tx, y + 4, 4, 8, steel)
    art.ball(tx + 2, y + 4, 2, 1.5, steel)
    art.rect(tx + 1, y + 12, 2, 2, steel[0])
  }
  const purple = shades(PAL.purple, 0.18, 0.24)
  INVADERS[0]![frame]!.forEach((row, j) =>
    [...row].forEach((c, i) => {
      if (c !== '#') return
      art.rect(x + i * 2, y + j * 2, 2, 2, purple[1])
      art.set(x + i * 2, y + j * 2, purple[2])
      art.set(x + i * 2 + 1, y + j * 2 + 1, purple[0])
    }),
  )
}

// The jetpack's flames under its two tanks, flickering, longer when it goes fast
function flames(art: Raster, x: number, y: number, tl: number, fast: number, kx = 1) {
  const colors = ['#fff4c2', PAL.yellow, PAL.orange, PAL.red]
  for (const side of [-1, 1]) {
    // Under the nozzle, 10 pixels either side of its middle, nearer as it turns side on
    const fx = Math.round(x + 8 + side * 10 * kx - 1)
    const pose = Math.floor(tl / POSE)
    const long =
      4 + ((pose + side) & 1) + (rand(pose * 2 + side) > 0.6 ? 1 : 0) + Math.round(fast * 2)
    for (let j = 0; j < long; j++) {
      const color = colors[Math.min(3, Math.floor((j / long) * 4))]!
      if (j < long - 1) art.rect(fx, y + 14 + j, 2, 1, color)
      else art.set(fx + ((pose >> 1) & 1), y + 14 + j, color)
    }
  }
}

function still(dark: boolean) {
  const art = new Raster(W, H)
  const wood = shades(PAL.wood, 0.32, 0.3)
  // The easel: its back leg, behind, and its mast over the board
  art.stroke(
    [
      [64, 84],
      [64, 91],
    ],
    1.2,
    shades(mix(PAL.wood, '#000000', 0.25), 0.3, 0.2),
  )
  art.cylinder(62, 26, 4, 8, wood)
  // The board: a wooden frame, its grain, and the face inside, in its shadow on the top left
  art.box(13, 33, 102, 51, wood)
  for (let x = 14; x < 114; x++) {
    if (rand(x) > 0.7) art.set(x, 34, wood[0])
    if (rand(x + 200) > 0.7) art.set(x, 82, wood[0])
  }
  const face = dark ? '#1c1c1c' : '#fbfaf8'
  art.rect(16, 36, 96, 45, face)
  art.rect(16, 36, 96, 1, mix(face, '#000000', dark ? 0.35 : 0.08))
  art.rect(16, 36, 1, 45, mix(face, '#000000', dark ? 0.35 : 0.08))
  // The clamp holding its top
  art.box(59, 31, 10, 4, shades(mix(PAL.wood, '#000000', 0.2), 0.3, 0.3))
  // The empty days, set into the face
  const [empty, emptyShade] = [
    LEVELS[dark ? 'dark' : 'light'][0]!,
    mix(face, '#000000', dark ? 0.1 : 0.14),
  ]
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS; r++) {
      tile(art, cellX(c) + 3, cellY(r) + 3, CELL, CELL, [empty, empty, emptyShade])
    }
  // Under the graph: a caption, and the legend, less to more
  const ink = dark ? '#4a4a4a' : '#c9c2ba'
  art.rect(GX, 76, 14, 1, ink)
  art.rect(GX + 16, 76, 8, 1, ink)
  art.rect(80, 76, 5, 1, ink)
  LEVELS[dark ? 'dark' : 'light'].forEach((color, i) => art.rect(87 + i * 4, 75, 3, 3, color))
  // The tray it stands on, and the front legs, splayed
  art.box(9, 84, 110, 3, wood)
  art.stroke(
    [
      [24, 86],
      [18, 93],
    ],
    1.3,
    wood,
  )
  art.stroke(
    [
      [104, 86],
      [110, 93],
    ],
    1.3,
    wood,
  )
  art.outline(outlineOf(dark))
  // Its shadow on the floor, dithered, where nothing is painted
  const shadow = dark ? '#262626' : '#d6cfc7'
  for (let y = 92; y < 95; y++)
    for (let x = 10; x < 118; x++) {
      const [nx, ny] = [(x + 0.5 - 64) / 54, (y + 0.5 - 93.5) / 1.8]
      if (nx * nx + ny * ny <= 1 && (x + y) % 2 === 0 && !art.at(x, y)) art.set(x, y, shadow)
    }
  return art
}

function paint(t: number, dark: boolean) {
  const u = phase(t, PERIOD)
  const tl = u * PERIOD
  const tones = TONES[dark ? 'dark' : 'light']
  // The cells, laid on the face, not outlined; what moves over them, outlined
  const cells = new Raster(W, H)
  const fg = new Raster(W, H)

  // Each day's level now: the last block landed on it, then the drain, a level a pose
  // Where the shine across the full graph is, along the diagonal from its top left
  const shine = tl >= FULL + 2 * POSE ? (tl - FULL - 2 * POSE) * 0.25 - 10 : -Infinity
  const level = Array.from({ length: COLS * ROWS }, () => 0)
  const landed = Array.from({ length: COLS * ROWS }, () => -1)
  for (const d of DROPS) {
    const i = d.row * COLS + d.col
    if (d.land <= tl && d.land > landed[i]!) [level[i], landed[i]] = [d.to, d.land]
  }
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r < ROWS; r++) {
      const i = r * COLS + c
      const top = level[i]!
      if (!top) continue
      const cx = cellX(c) + 3
      const cy = cellY(r) + 3
      // Draining: a level down each pose, from the left; the last one shrinks away
      const drained = tl - (DRAIN + c * 60 + r * 30)
      const lv = drained < 0 ? top : top - Math.floor(drained / POSE)
      if (lv <= 0) {
        const size = lv === 0 ? 4 : lv === -1 ? 2 : 0
        if (size) tile(cells, cx, cy, size, size, tones[1]!)
        continue
      }
      // Landing: squashed flat and white hot, stretched, a touch too big, settled
      const since = tl - landed[i]!
      let [w, h] = [CELL, CELL]
      let hot = 0
      if (since < POSE) [w, h, hot] = [8, 4, 0.6]
      else if (since < 2 * POSE) [w, h, hot] = [5, 7, 0.25]
      else if (since < 3 * POSE) [w, h] = [7, 7]
      // Full: the whole graph flashes, two poses, before its shine
      if (tl >= FULL && tl < FULL + 2 * POSE) hot = Math.max(hot, 0.45)
      // The full graph's shine passing: each cell hops a pixel as it goes by
      const hopped = Math.abs(cx - GX + cy - GY - shine) < 5 ? 1 : 0
      const base = tones[lv]!
      tile(
        cells,
        cx,
        cy - hopped,
        w,
        h,
        hot ? (base.map((c) => mix(c, '#ffffff', hot)) as Tones) : base,
      )
    }
  // The shine itself: a broad and a thin diagonal stripe across the lit cells, from the left
  if (shine > -10 && shine < 130)
    for (let y = GY - 1; y < GY + 36; y++)
      for (let x = GX - 1; x < GX + 92; x++) {
        const color = cells.at(x, y)
        const s = x - GX + y - GY - shine
        if (color && s >= 0 && s < 4 && s !== 2)
          cells.set(x, y, mix(color, '#ffffff', s < 2 ? 0.7 : 0.45))
      }

  // The invader: flying to and fro, bobbing; for joy at the end, up and spinning
  const { x, dir } = flight(tl)
  const spin = clamp((tl - SPIN[0]) / (SPIN[1] - SPIN[0]))
  const lift = Math.round(3 * Math.sin(Math.PI * spin))
  const ix = Math.round(x - 8)
  // Lighter for a moment as it lets a slow one go
  const recoil = DROPS.some((d) => d.slow && tl >= d.t && tl < d.t + 2 * POSE) ? 1 : 0
  const iy = hover(tl) - lift - recoil
  const frame = Math.floor(tl / (2 * POSE)) % 2
  const kx = spin > 0 && spin < 1 ? Math.cos(2 * Math.PI * 2 * spin) : 1
  if (kx === 1) invader(fg, ix, iy, frame, dark)
  else {
    const body = new Raster(26, 18)
    invader(body, 5, 1, frame, dark)
    fg.blit(body, 13, 9, ix + 8, iy + 8, 0, kx, 1)
  }

  // The block it holds, growing after each drop; and every block falling, stretched by speed
  const next = DROPS.findIndex((d) => d.t > tl)
  const prev = DROPS[next - 1]
  if (next >= 0 || tl >= REGROW) {
    const a = tl >= REGROW ? REGROW : prev ? prev.t + 30 : -Infinity
    const gap = next >= 0 && prev ? DROPS[next]!.t - prev.t : 600
    const size = Math.round(CELL * pop(tl, a, Math.min(220, gap * 0.6)))
    const lv = (DROPS[next] ?? DROPS[0]!).to
    if (size > 0) tile(fg, ix + 8, iy + HANG + 3, size, size, tones[lv]!)
  }
  for (const d of DROPS) {
    if (tl < d.t || tl >= d.land) continue
    const fall = tl - d.t
    const v = G * fall
    const stretch = v > 0.17 ? 2 : v > 0.08 ? 1 : 0
    tile(
      fg,
      colMid(d.col),
      d.y0 + 0.5 * G * fall * fall + 3,
      CELL - (stretch ? 1 : 0),
      CELL + stretch,
      tones[d.to]!,
    )
  }
  // The flames, roaring when it goes fast or spins
  const seg = SEGS.find((s) => tl >= s.t0 && tl < s.t1)
  const fast = seg ? clamp((Math.abs(seg.x1 - seg.x0) * PITCH) / (seg.t1 - seg.t0) / 0.12) : 0
  flames(fg, ix, iy, tl, Math.max(fast, spin > 0 && spin < 1 ? 1 : 0), kx)
  fg.outline(outlineOf(dark))

  // "+1" over the slow ones as they land, rising, blinking out
  for (const d of DROPS) {
    if (!d.slow || tl < d.land || tl >= d.land + 640) continue
    if (tl > d.land + 520 && Math.floor(tl / 40) % 2) continue
    const rise = Math.round(6 * ease(tl, d.land, d.land + 640))
    text(fg, '+1', cellX(d.col) - 0.5, cellY(d.row) - 7 - rise, dark ? '#ffffff' : '#a64d2e')
  }
  // Its eyes catch the light, looking where it goes
  if (kx === 1) {
    const look = dir > 0 ? 1 : 0
    fg.set(ix + 4 + look, iy + 6, '#ffffff')
    fg.set(ix + 10 + look, iy + 6, '#ffffff')
  }

  // Confetti over the full graph: three bursts, slowed by the air, fluttering down
  const colors = dark
    ? ['#f4c895', '#d4825d', PAL.purple, PAL.blue, PAL.green, PAL.yellow]
    : ['#a64d2e', '#d4825d', PAL.purple, PAL.blue, '#3fa85a', PAL.gold]
  for (let s = 0; s < 3; s++) {
    const dt = tl - (FULL + 120 + s * 160)
    if (dt < 0) continue
    for (let i = 0; i < 14; i++) {
      const seed = s * 50 + i
      if (dt > 1500 + rand(seed) * 600) continue
      const angle = -Math.PI / 2 + (rand(seed + 1) - 0.5) * 1.8
      const v = 0.08 + rand(seed + 2) * 0.05
      const k = 0.004
      const fall = 0.028
      const slowed = (1 - Math.exp(-k * dt)) / k
      const cx = 34 + s * 30 + Math.cos(angle) * v * slowed + 1.5 * Math.sin(dt / 140 + seed)
      const cy = 31 + fall * dt + (Math.sin(angle) * v - fall) * slowed
      const flat = Math.floor(dt / POSE + seed) % 2
      fg.rect(cx, cy, flat ? 2 : 1, flat ? 1 : 2, colors[i % colors.length]!)
    }
  }
  // Twinkles at the board's corners as it gleams
  twinkle(fg, 15, 35, tl, FULL + 150, '#ffffff', 450)
  twinkle(fg, 112, 79, tl, FULL + 400, PAL.yellow, 450)
  twinkle(fg, 112, 35, tl, FULL + 650, '#ffffff', 450)

  return cells.over(fg)
}

// At rest (reduced motion): the first days lit, "+1"s rising, a block on its way down
export const commits: Hero = { w: W, h: H, period: PERIOD, rest: 5550, still, paint }
