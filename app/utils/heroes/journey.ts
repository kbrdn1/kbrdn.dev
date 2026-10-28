// /parcours: a career drawn as a metro map. Four lines in the site's colours cross at
// interchanges, a year by the stops that matter. A little train runs the orange line from 2020,
// braking into each stop as its ring lights up, to the terminus, 2026, where it sparkles; the
// driver changes ends and it runs back express, the lights going out behind it one by one.
// A smaller train shuttles up and down the blue line.
import {
  mix,
  outlineOf,
  PAL,
  Raster,
  shades,
  smooth,
  text,
  twinkle,
  type Rgb,
  type Tones,
} from '../cameos/art'
import { type Hero, phase } from './hero'

const W = 128
const H = 96
// A multiple of the pose cadence (85 ms), so what steps by it steps the same across the loop
const PERIOD = 13600

type Pt = [number, number]
interface Line {
  points: Pt[]
  /** How far along each point is */
  at: number[]
  length: number
}

// A line through its corners, every turn rounded off over r px
function line(corners: Pt[], r = 5): Line {
  const points: Pt[] = [corners[0]!]
  for (let i = 1; i < corners.length - 1; i++) {
    const [p, c, n] = [corners[i - 1]!, corners[i]!, corners[i + 1]!]
    const [d1, d2] = [Math.hypot(c[0] - p[0], c[1] - p[1]), Math.hypot(n[0] - c[0], n[1] - c[1])]
    const a: Pt = [c[0] - ((c[0] - p[0]) / d1) * r, c[1] - ((c[1] - p[1]) / d1) * r]
    const b: Pt = [c[0] + ((n[0] - c[0]) / d2) * r, c[1] + ((n[1] - c[1]) / d2) * r]
    for (let k = 0; k <= 6; k++) {
      const f = k / 6
      const g = [(1 - f) ** 2, 2 * (1 - f) * f, f * f] as const
      points.push([
        g[0] * a[0] + g[1] * c[0] + g[2] * b[0],
        g[0] * a[1] + g[1] * c[1] + g[2] * b[1],
      ])
    }
  }
  points.push(corners.at(-1)!)
  const at = [0]
  for (let i = 1; i < points.length; i++)
    at.push(
      at[i - 1]! + Math.hypot(points[i]![0] - points[i - 1]![0], points[i]![1] - points[i - 1]![1]),
    )
  return { points, at, length: at.at(-1)! }
}

// The point s px along a line, held at its ends
function along(l: Line, s: number): Pt {
  s = Math.min(l.length, Math.max(0, s))
  let i = 1
  while (i < l.points.length - 1 && l.at[i]! < s) i++
  const [a, b] = [l.points[i - 1]!, l.points[i]!]
  const f = (s - l.at[i - 1]!) / (l.at[i]! - l.at[i - 1]! || 1)
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
}

// How far along a line the point nearest p is
function where(l: Line, p: Pt) {
  let best = 0
  for (let s = 0; s <= l.length; s += 0.25) {
    const q = along(l, s)
    const b = along(l, best)
    if (Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(b[0] - p[0], b[1] - p[1])) best = s
  }
  return best
}

// The map. Orange, the career, climbs from the bottom left to the top right; purple ends where
// it starts, blue crosses it in 2022, green in 2023
const ORANGE = line([
  [12, 84],
  [30, 84],
  [46, 68],
  [76, 68],
  [94, 50],
  [94, 34],
  [106, 22],
  [116, 22],
])
const BLUE = line([
  [14, 16],
  [34, 16],
  [52, 34],
  [52, 90],
])
const GREEN = line([
  [66, 42],
  [108, 42],
  [120, 54],
  [120, 78],
])
const PURPLE = line([
  [34, 52],
  [20, 52],
  [12, 60],
  [12, 84],
])
const LINES: [Line, Rgb][] = [
  [PURPLE, PAL.purple],
  [GREEN, PAL.green],
  [BLUE, PAL.blue],
  [ORANGE, PAL.orange],
]

// The orange line's stops, their years and where the year is written
const STOPS: { p: Pt; year: string; label: Pt; big: boolean }[] = [
  { p: [12, 84], year: '2020', label: [18, 89], big: true },
  { p: [52, 68], year: '2022', label: [57, 74], big: true },
  { p: [94, 42], year: '2023', label: [74, 32], big: true },
  { p: [116, 22], year: '2026', label: [105, 29], big: false },
]
// The other lines' ends
const ENDS: Pt[] = [
  [14, 16],
  [52, 90],
  [66, 42],
  [120, 78],
  [34, 52],
]
const S = STOPS.map((stop) => where(ORANGE, stop.p))

// A train: cars this far apart, centre to centre, each 8 px long
const CAR = 9
// How far short of a line's end a car stops, so it stays on the line
const END = 5

// Where a run is at x (0 to 1) of its time: it pulls away, cruises, brakes into the stop
function run(x: number) {
  const [a, d] = [0.3, 0.45]
  const v = 1 / (1 - a / 2 - d / 2)
  if (x <= 0) return 0
  if (x >= 1) return 1
  if (x < a) return (v * x * x) / (2 * a)
  if (x < 1 - d) return v * (a / 2 + x - a)
  return 1 - (v * (1 - x) ** 2) / (2 * d)
}

// The orange train's timetable: [ms, where its first car is]. It waits at 2020 with its last car
// on the stop, stops with its first car on each stop out, waits at the terminus just short of
// its ring, so it is seen lighting up, and runs back without stopping
const HOME = 2 * CAR + END
const TERMINUS = S[3]! - 9
const RUN: Pt[] = [[400, HOME]]
{
  let t = 400
  const to = (s: number, pace: number, dwell: number) => {
    t += 450 + Math.abs(s - RUN.at(-1)![1]) * pace
    RUN.push([t, s])
    t += dwell
    RUN.push([t, s])
  }
  to(S[1]!, 34, 1000)
  to(S[2]!, 34, 1000)
  to(TERMINUS, 34, 2100)
  to(HOME, 19, 0)
}
// When it gets back to 2020
const BACK = RUN.at(-1)![0]

// Where the orange train's first car is at tl, and which way it faces (+1 out, -1 back)
function orange(tl: number): [number, number] {
  if (tl < RUN[0]![0] || tl >= BACK) {
    // Home at 2020: the driver walks to the other end halfway through the wait
    const waited = (tl - BACK + PERIOD) % PERIOD
    return [HOME, waited < (PERIOD - BACK + RUN[0]![0]) / 2 ? -1 : 1]
  }
  let k = 1
  while (RUN[k]![0] <= tl) k++
  const [[t0, s0], [t1, s1]] = [RUN[k - 1]!, RUN[k]!]
  if (s0 !== s1) return [s0 + (s1 - s0) * run((tl - t0) / (t1 - t0)), Math.sign(s1 - s0)]
  // Waiting at a stop: out, but at the terminus it changes ends halfway
  return [s0, s0 === TERMINUS && tl > (t0 + t1) / 2 ? -1 : 1]
}

// When each stop lights up (the train's first car on it, out; 2020 when it is back) and when it
// goes out (the whole train gone by on its way back; 2020 stays lit, it is where it all starts)
const LIT = [BACK, RUN[1]![0], RUN[3]![0], RUN[5]![0]]
const OUT = S.map((s, i) => {
  if (i === 0) return Infinity
  for (let tl = RUN[6]![0]; tl < BACK; tl += 10) if (orange(tl)[0] < s - 5) return tl
  return BACK
})
// How lit a stop is at tl (0 to 1)
const lit = (i: number, tl: number) =>
  i === 0 ? 1 : tl < LIT[i]! ? 0 : 1 - smooth(tl, OUT[i]!, OUT[i]! + 450)

// The blue train's timetable, from its own start (ms): down, a wait, up, a wait. Offset so it
// is never by 2022 (crossing it, or waiting at the end just below) while the orange train is
const SHUTTLE = { offset: 1800, down: 3600, up: [7200, 10800] as const }
function blue(tl: number): [number, number] {
  const local = (tl - SHUTTLE.offset + PERIOD) % PERIOD
  const [lo, hi] = [CAR + END, BLUE.length - END]
  if (local < SHUTTLE.down) return [lo + (hi - lo) * run(local / SHUTTLE.down), 1]
  if (local < SHUTTLE.up[0]) return [hi, local < (SHUTTLE.down + SHUTTLE.up[0]) / 2 ? 1 : -1]
  if (local < SHUTTLE.up[1])
    return [hi - (hi - lo) * run((local - SHUTTLE.up[0]) / (SHUTTLE.up[1] - SHUTTLE.up[0])), -1]
  return [lo, local < (SHUTTLE.up[1] + PERIOD) / 2 ? -1 : 1]
}

// ── Colours

const RING = shades('#f6f4f0', 0.16, 0.6)
const LAMP_OFF = shades('#57534e', 0.3, 0.3)
const LAMP_ON: Tones = [PAL.gold, PAL.yellow, '#fff6c8']
const BODY = { light: shades('#dfe3e8', 0.22, 0.6), dark: shades('#b4bcc6', 0.3, 0.45) }
const ink = (dark: boolean, on: boolean) =>
  dark ? (on ? '#e2e2e2' : '#666666') : on ? '#2e2e2e' : '#a8a39c'

// A year in the three by five font, which has no 6: that one drawn here
const SIX = ['###', '#..', '###', '#.#', '###']
function year(art: Raster, word: string, x: number, y: number, color: Rgb) {
  ;[...word].forEach((ch, n) => {
    if (ch === '6') art.sprite(SIX, x + n * 4, y, { '#': color })
    else text(art, ch, x + n * 4, y, color)
  })
}

// A compass rose in the empty corner: four points, each lit on its top left half, north in red
function compass(art: Raster, x: number, y: number) {
  const steel = shades('#d6d1ca', 0.32, 0.5)
  for (const [dx, dy, reach] of [
    [0, -1, 9],
    [1, 0, 6],
    [0, 1, 9],
    [-1, 0, 6],
  ] as const) {
    const tones = dy < 0 ? shades(PAL.red, 0.3, 0.35) : steel
    const tip: Pt = [x + dx * reach, y + dy * reach]
    for (const side of [1, -1]) {
      const [sx, sy] = [-dy * 2.5 * side, dx * 2.5 * side]
      art.poly([[x, y], tip, [x + sx, y + sy]], tones[sx + sy < 0 ? 2 : 0])
    }
  }
  art.ball(x, y, 1.5, 1.5, steel)
}

// A stop: a white ring, big where lines meet, round its lamp
const lampRadius = (big: boolean) => (big ? 3 : 2)
function ring(art: Raster, [x, y]: Pt, big: boolean) {
  const r = big ? 5 : 4
  art.ball(x, y, r, r, RING)
  art.ball(x, y, lampRadius(big), lampRadius(big), LAMP_OFF)
}

function still(dark: boolean) {
  const art = new Raster(W, H)
  // Each line on its own and outlined, so where they cross the one on top keeps its edge
  for (const [l, color] of LINES) {
    const layer = new Raster(W, H)
    layer.stroke(l.points, 2, shades(color, 0.22, 0.38))
    layer.outline(outlineOf(dark))
    art.over(layer)
  }
  const stops = new Raster(W, H)
  for (const p of ENDS) ring(stops, p, false)
  for (const stop of STOPS) ring(stops, stop.p, stop.big)
  compass(stops, 95, 83)
  stops.outline(outlineOf(dark))
  art.over(stops)
  for (const stop of STOPS) year(art, stop.year, stop.label[0], stop.label[1], ink(dark, false))
  return art
}

// A car: a box 8 × 6 turned along the line at (x, y), (tx, ty) its way, lit on its top left
// side, its corners cut. Two windows down the middle, a stripe of its line's colour under them;
// at one end (head: +1 or -1 along tx, ty) a windscreen and two headlights, at the other (tail)
// two red lamps
function car(
  art: Raster,
  [x, y]: Pt,
  [tx, ty]: Pt,
  livery: Rgb,
  head: number,
  tail: number,
  dark: boolean,
) {
  const glass = dark ? '#ffd98a' : '#3a4d63'
  // Across the car, pointing down and right, the side in shadow
  const [nx, ny] = -ty + tx < 0 ? [ty, -tx] : [-ty, tx]
  for (let py = Math.floor(y - 5); py < y + 5; py++)
    for (let px = Math.floor(x - 5); px < x + 5; px++) {
      const [dx, dy] = [px + 0.5 - x, py + 0.5 - y]
      const a = dx * tx + dy * ty
      const p = dx * nx + dy * ny
      if (Math.abs(a) > 4 || Math.abs(p) > 3 || (Math.abs(a) > 3 && Math.abs(p) > 2)) continue
      const n = p / 3
      const light =
        -0.45 * nx * n - 0.6 * ny * n + 0.66 * Math.sqrt(1 - n * n) + ((px + py) & 1) * 0.08
      let color = BODY[dark ? 'dark' : 'light'][light > 0.8 ? 2 : light > 0.32 ? 1 : 0]
      const lamp = Math.abs(a) > 3 && Math.abs(p) > 1 && Math.abs(p) < 2
      if (head && a * head > 3 && lamp) color = '#fff3b0'
      else if (tail && a * tail > 3 && lamp) color = PAL.red
      else if (head && a * head > 2 && a * head <= 3 && Math.abs(p) < 2) color = glass
      else if (Math.abs(p) < 1 && Math.abs(a) > 1 && Math.abs(a) < 3) color = glass
      else if (p > 1 && p < 2) color = livery
      art.set(px, py, color)
    }
}

// A train of `cars` on a line, its first car's centre s along it, facing +1 (towards the line's
// end) or -1: the cars follow the line round its turns, the headlights at the front
function train(
  art: Raster,
  l: Line,
  s: number,
  cars: number,
  facing: number,
  livery: Rgb,
  dark: boolean,
) {
  for (let k = 0; k < cars; k++) {
    const c = s - k * CAR
    const [p, q] = [along(l, c - 1), along(l, c + 1)]
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1
    const centre: Pt = [Math.round((p[0] + q[0]) / 2), Math.round((p[1] + q[1]) / 2)]
    // Facing out the first car leads, facing back the last
    const [first, last] = [k === 0, k === cars - 1]
    const head = facing > 0 ? (first ? 1 : 0) : last ? -1 : 0
    const tail = facing > 0 ? (last ? -1 : 0) : first ? 1 : 0
    car(art, centre, [(q[0] - p[0]) / len, (q[1] - p[1]) / len], livery, head, tail, dark)
  }
}

// The light ahead of a moving train, a see-through cone
function beam(art: Raster, l: Line, s: number, facing: number, cars: number, dark: boolean) {
  const tip = facing > 0 ? s + 4 : s - (cars - 1) * CAR - 4
  const color = dark ? '#fff3b0' : '#ffd54a'
  for (let d = 1; d <= 6; d++) {
    const [x, y] = along(l, tip + d * facing)
    const [x2, y2] = along(l, tip + (d + 0.5) * facing)
    const len = Math.hypot(x2 - x, y2 - y) || 1
    const [nx, ny] = [-(y2 - y) / len, (x2 - x) / len]
    const half = Math.floor((d + 1) / 2)
    for (let o = -half; o < half; o++) {
      const [px, py] = [Math.floor(x + nx * (o + 0.5)), Math.floor(y + ny * (o + 0.5))]
      if ((px + py + d) % 2 === 0) art.set(px, py, color)
    }
  }
}

// A ring of light going out from a stop as it lights up
function pulse(art: Raster, [x, y]: Pt, e: number, dark: boolean) {
  if (e < 0 || e > 600) return
  const r = 6 + (e / 600) * 5
  const color = dark ? PAL.yellow : '#e8a33a'
  const steps = Math.ceil(r * 7)
  for (let i = 0; i < steps; i++) {
    if (e > 300 && i % 2) continue
    const a = (i / steps) * 2 * Math.PI
    art.set(x + Math.cos(a) * r, y + Math.sin(a) * r, color)
  }
}

// A firework: a spark rises from `from` to `to` in 300 ms, bursts into a ring of sparks in the
// lines' colours that slow, sag and twinkle out; e ms since it went up
function firework(art: Raster, from: Pt, to: Pt, e: number, dark: boolean) {
  if (e < 0 || e > 1100) return
  if (e < 300) {
    const p = 1 - (1 - e / 300) ** 2
    const [x, y] = [from[0] + (to[0] - from[0]) * p, from[1] + (to[1] - from[1]) * p]
    art.set(x, y, dark ? '#ffffff' : PAL.gold)
    art.set(x - (to[0] - from[0]) * 0.08, y - (to[1] - from[1]) * 0.08, PAL.yellow)
    return
  }
  const p = (e - 300) / 800
  const reach = 2 + 7 * (1 - (1 - p) ** 3)
  const sag = 3 * p * p
  const colors = [PAL.yellow, PAL.orange, PAL.blue, PAL.green, PAL.purple]
  for (let i = 0; i < 10; i++) {
    // Going out in the last third, every other spark at a time
    if (p > 0.65 && (i + Math.floor(e / 85)) % 2) continue
    const [c, s] = [Math.cos((i / 10) * 2 * Math.PI), Math.sin((i / 10) * 2 * Math.PI)]
    const color = colors[i % colors.length]!
    art.set(to[0] + c * reach, to[1] + s * reach + sag, color)
    if (p < 0.5) art.set(to[0] + c * (reach - 1.5), to[1] + s * (reach - 1.5) + sag, color)
  }
  // The flash where it bursts
  if (p < 0.15) twinkle(art, to[0], to[1], e, 300, dark ? '#ffffff' : PAL.gold, 120)
}

function paint(t: number, dark: boolean) {
  const art = new Raster(W, H)
  const u = phase(t, PERIOD)
  // The time within the loop: what flaps or steps by it repeats exactly from loop to loop
  const tl = u * PERIOD

  // The lamps of the stops it has reached, white hot at first; under the trains
  STOPS.forEach((stop, i) => {
    const on = lit(i, tl)
    if (on <= 0) return
    const r = lampRadius(stop.big)
    const fresh = tl >= LIT[i]! && tl < LIT[i]! + 170
    const tones: Tones = fresh
      ? ['#fff6c8', '#ffffff', '#ffffff']
      : on > 0.66
        ? LAMP_ON
        : on > 0.33
          ? [mix(LAMP_OFF[0], PAL.gold, 0.5), mix(LAMP_OFF[1], PAL.gold, 0.6), PAL.gold]
          : [LAMP_OFF[0], mix(LAMP_OFF[1], PAL.gold, 0.3), mix(LAMP_OFF[2], PAL.gold, 0.4)]
    art.ball(stop.p[0], stop.p[1], r, r, tones)
  })

  // The trains: blue under orange
  const [sb, fb] = blue(tl)
  const [so, fo] = orange(tl)
  const moving = new Raster(W, H)
  train(moving, BLUE, sb, 2, fb, PAL.blue, dark)
  train(moving, ORANGE, so, 3, fo, PAL.orange, dark)
  moving.outline(outlineOf(dark))
  art.over(moving)

  // Light ahead of them while they run
  if (Math.abs(blue(tl + 40)[0] - sb) > 0.15) beam(art, BLUE, sb, fb, 2, dark)
  if (Math.abs(orange(tl + 40)[0] - so) > 0.15) beam(art, ORANGE, so, fo, 3, dark)

  // Each stop's ring of light as it lights up, its year in full ink while lit
  STOPS.forEach((stop, i) => pulse(art, stop.p, tl - LIT[i]!, dark))
  STOPS.forEach((stop, i) => {
    if (lit(i, tl) > 0.5) year(art, stop.year, stop.label[0], stop.label[1], ink(dark, true))
  })

  // The terminus: two fireworks go up from it into the empty sky, sparkles round it
  const [x, y] = STOPS[3]!.p
  const a = LIT[3]!
  const spark = dark ? '#ffffff' : PAL.gold
  firework(art, [x, y - 4], [104, 10], tl - a - 100, dark)
  firework(art, [x, y - 4], [89, 12], tl - a - 650, dark)
  twinkle(art, x + 7, y - 6, tl, a + 300, spark, 520)
  twinkle(art, x + 6, y + 8, tl, a + 1300, PAL.yellow, 520)
  return art
}

// At rest (reduced motion): at the terminus, every stop lit, a firework over it
export const journey: Hero = {
  w: W,
  h: H,
  period: PERIOD,
  rest: LIT[3]! + 1200,
  still,
  paint,
}
