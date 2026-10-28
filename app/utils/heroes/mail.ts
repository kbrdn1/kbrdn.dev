// /contact: the corner of a house front, a red mailbox on its post by the door. A bluebird
// flies a letter in from far off, growing as it nears, and lets it slide into the slot; the
// flag swings up and hearts float out; the bird lands on the box, hops round, chirps a few
// notes, then flies off shrinking into the distance and the flag swings back down. The lamp
// over the door glows by night; a small sun by day, the moon and a few stars by night.
import {
  heart,
  hop,
  mix,
  outlineOf,
  PAL,
  pop,
  rand,
  Raster,
  shades,
  smooth,
  twinkle,
} from '../cameos/art'
import { type Hero, phase, wave } from './hero'

type Point = [number, number]

const W = 128
const H = 96
const PERIOD = 10000

// The story's beats, ms into the loop
const IN = [300, 3500] as const
const DROP = [3700, 4200] as const
const ASIDE_AT = [4200, 4800] as const
const FLAG_UP = 4250
const HEARTS = [4350, 4550, 4750] as const
const LAND = [5800, 6300] as const
const HOP = 6650
const CHIRP = [7150, 7950] as const
const OFF = [8200, 9400] as const
const FLAG_DOWN = 9450

// The wall: rows of bricks from its top down to the cobbles, a broken edge on its left, the
// house's corner on its right
const WALL = { top: 24, bottom: 84, left: 52, right: 118 }
// The door's slab (its frame, lintel and step around it), the lamp over it, the sun or moon
const DOOR = { x: 74, y: 46, w: 21, h: 36 }
const LAMP: Point = [84, 33]
const SUN: Point = [111, 11]

// The mailbox's front face: its body's left, top, width and height, the arch over it; the box
// recedes DEPTH steps of (1, -0.5) to the top right
const BOX = { x: 28, y: 51, w: 20, h: 12, ry: 7 }
const DEPTH = 5
const SLOT = { x: 32, y: 54, w: 12 }
const PIVOT: Point = [26, 56]

// Where the bird's toes rest (the row under them): far off, over the slot, aside, on the box,
// gone
const START: Point = [62, 13]
const HOVER: Point = [38, 36]
const ASIDE: Point = [18, 30]
const PERCH: Point = [40, 43]
const END: Point = [16, 10]
// Below this scale the bird is a flapping speck
const SPECK = 0.22

// A point along a cubic Bézier
function bez(a: Point, b: Point, c: Point, d: Point, p: number): Point {
  const q = 1 - p
  const f = (i: 0 | 1) =>
    q * q * q * a[i] + 3 * q * q * p * b[i] + 3 * q * p * p * c[i] + p * p * p * d[i]
  return [f(0), f(1)]
}

// A sealed envelope, 10 × 7, its top left at (x, y); nothing at or below `clip` (the slot)
function envelope(art: Raster, x: number, y: number, clip = Infinity) {
  const paper = shades(PAL.paper, 0.16, 0.5)
  const e = new Raster(10, 7)
  e.box(0, 0, 10, 7, paper)
  e.line(0, 0, 4, 3, paper[0])
  e.line(9, 0, 5, 3, paper[0])
  e.rect(4, 3, 2, 2, PAL.red)
  e.set(4, 3, PAL.pink)
  e.cells.forEach((c, i) => {
    const ey = Math.floor(i / 10)
    if (c && y + ey < clip) art.set(x + (i % 10), y + ey, c)
  })
}

// ── The house front

// Bricks in staggered rows, a few lighter or darker; the higher the row, the further right it
// starts, and some bricks are missing along the broken edge and the top. The corner's stones,
// long and short in turn
function wall(art: Raster, dark: boolean) {
  const brick = shades(dark ? '#7a4a3c' : '#c98468', 0.22, 0.2)
  const mortar = dark ? '#4a3a33' : '#e6d2c0'
  const stone = shades(dark ? '#8a8076' : '#e2d6c6', 0.22, 0.3)
  for (let r = 0; WALL.top + r * 4 < WALL.bottom; r++) {
    const y = WALL.top + r * 4
    const from = WALL.left + Math.max(0, 5 - r) * 5
    const corner = WALL.right - (r % 2 ? 6 : 9)
    for (let x = WALL.left - (r % 2) * 4; x < corner; x += 8) {
      if (x < from) continue
      if ((x < from + 8 || (r === 0 && x < 70)) && rand(r * 13 + x) < 0.4) continue
      const w = Math.min(8, corner - x)
      art.rect(x, y, w, 4, mortar)
      const n = rand(r * 7 + x * 3)
      art.rect(x, y, w - 1, 3, n < 0.16 ? brick[2] : n > 0.84 ? brick[0] : brick[1])
    }
    art.box(corner, y, WALL.right - corner, 4, stone)
  }
}

// The door, set back in its stone frame: a lintel over it, a step under it; a gold slab, its
// window (lit from inside by night), two panels, a brass knocker and knob
function door(art: Raster, dark: boolean) {
  const { x, y, w, h } = DOOR
  const stone = shades(dark ? '#8a8076' : '#e2d6c6', 0.22, 0.3)
  art.box(x - 3, y - 2, w + 6, h + 2, stone)
  art.box(x - 4, y - 5, w + 8, 3, stone)
  art.box(x - 4, y + h, w + 8, 2, stone)
  const gold = shades(dark ? '#c4923a' : '#dcaa45', 0.3, 0.3)
  art.rect(x, y, w, h, gold[1])
  // Its shadow along the top and left of the recess
  art.rect(x, y, w, 1, gold[0])
  art.rect(x, y, 1, h, gold[0])
  // The window, its glass and its cross
  const [wx, wy] = [x + 5, y + 3]
  art.rect(wx, wy, 11, 8, gold[0])
  art.rect(wx + 1, wy + 1, 9, 6, dark ? '#ffcf6a' : '#c4e2ee')
  if (dark) art.rect(wx + 2, wy + 2, 7, 4, '#ffe7a6')
  else {
    art.set(wx + 2, wy + 2, '#ffffff')
    art.set(wx + 3, wy + 2, '#ffffff')
    art.set(wx + 2, wy + 3, '#ffffff')
  }
  art.rect(wx + 5, wy + 1, 1, 6, gold[0])
  art.rect(wx + 1, wy + 4, 9, 1, gold[0])
  // Two panels below, sunk: shadow on their top and left, light on their bottom and right
  for (const px of [x + 3, x + 11]) {
    art.rect(px, y + 16, 7, 1, gold[0])
    art.rect(px, y + 16, 1, 17, gold[0])
    art.rect(px, y + 32, 7, 1, gold[2])
    art.rect(px + 6, y + 17, 1, 16, gold[2])
  }
  // The knocker's ring and the knob
  const brass = shades('#e8c25a', 0.35, 0.4)
  art.ball(x + 10.5, y + 13, 1.7, 1.7, brass)
  art.set(x + 10, y + 13, gold[0])
  art.ball(x + 17.5, y + 22, 1.3, 1.3, brass)
}

// The warm light of the lamp on the wall by night, dithered as it fades
function glow(art: Raster) {
  const [cx, cy] = [LAMP[0] + 0.5, LAMP[1] + 0.5]
  const r = 18
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++) {
      const c = art.at(x, y)
      const d = Math.hypot(Math.floor(x) + 0.5 - cx, Math.floor(y) + 0.5 - cy) / r
      if (!c || d >= 1) continue
      const p = d < 0.45 ? 0.34 : d < 0.7 ? 0.2 : (Math.floor(x) + Math.floor(y)) % 2 ? 0.12 : 0
      if (p) art.set(x, y, mix(c, '#ffc46a', p))
    }
}

// The lamp over the door: an iron lantern on a bracket, its glass dim by day, lit by night
function lamp(art: Raster, dark: boolean) {
  const [cx, cy] = LAMP
  const iron = shades(dark ? '#5c5c5c' : '#444444', 0.35, 0.35)
  art.rect(cx - 2, cy - 8, 5, 2, iron[1])
  art.rect(cx, cy - 6, 1, 2, iron[0])
  art.poly(
    [
      [cx - 4, cy - 2],
      [cx + 5, cy - 2],
      [cx + 0.5, cy - 5],
    ],
    iron[1],
  )
  art.rect(cx - 4, cy - 3, 9, 1, iron[0])
  art.rect(cx - 3, cy - 2, 7, 6, dark ? '#ffd36b' : '#ebe4d6')
  if (dark) art.rect(cx - 1, cy - 1, 3, 4, '#fff3c4')
  else art.set(cx - 2, cy - 1, '#ffffff')
  art.rect(cx - 3, cy - 2, 1, 6, iron[2])
  art.rect(cx + 3, cy - 2, 1, 6, iron[0])
  art.rect(cx - 4, cy + 4, 9, 1, iron[0])
  art.set(cx, cy + 5, iron[0])
}

// The cobbles under it all: three rows of rounded stones, staggered, fewer at the ends
function cobbles(art: Raster, dark: boolean) {
  for (let row = 0; row < 3; row++)
    for (let x = 14 + (row % 2) * 3.5 - row; x < 122 - row; x += 7) {
      const end = Math.min(x - 12, 124 - x)
      if (end < 10 && rand(row * 31 + x) < 0.5) continue
      const n = rand(row * 17 + x * 5)
      const base = dark ? (n < 0.3 ? '#5a5650' : '#66615a') : n < 0.3 ? '#b4ada3' : '#c4bdb2'
      art.ball(x, 86 + row * 3, 3.2, 1.6, shades(base, 0.25, 0.3))
    }
}

// The doormat at the door's foot, its border woven darker
function doormat(art: Raster) {
  const coir = shades('#b98a58', 0.3, 0.25)
  art.rect(DOOR.x - 1, 84, DOOR.w + 2, 1, coir[2])
  art.rect(DOOR.x - 2, 85, DOOR.w + 4, 2, coir[1])
  art.rect(DOOR.x - 3, 87, DOOR.w + 6, 1, coir[0])
  art.rect(DOOR.x + 1, 85, DOOR.w - 2, 1, coir[0])
}

// A potted bush by the door: a terracotta pot, round leafy clumps, a few pink buds
function plant(art: Raster, dark: boolean) {
  const leaf = shades(dark ? '#4f9a63' : PAL.green, 0.35, 0.3)
  art.ball(101, 70, 4.5, 4, leaf)
  art.ball(109, 70, 4.5, 4, leaf)
  art.ball(105, 65, 6.5, 6.5, leaf)
  for (const [bx, by] of [
    [102, 62],
    [108, 66],
    [104, 69],
  ] as const)
    art.set(bx, by, PAL.pink)
  const pot = shades(PAL.orange, 0.3, 0.3)
  art.cylinder(100, 75, 10, 9, pot)
  art.box(99, 73, 12, 3, pot)
}

// The mailbox on its post: a red box with a rounded roof, seen a little from the right and
// above, its front face lit at the rim, the slot near its top, a knob below
function mailbox(art: Raster) {
  const wood = shades(PAL.wood, 0.3, 0.3)
  art.cylinder(37, 65, 5, 23, wood)
  art.box(30, 63, 21, 2, wood)
  const red = shades(PAL.red, 0.3, 0.35)
  const cx = BOX.x + BOX.w / 2
  // Its depth, back to front: the roof shaded round, the right side in shadow
  for (let i = DEPTH; i >= 1; i--) {
    const [dx, dy] = [i, -i * 0.5]
    art.rect(BOX.x + dx, BOX.y + dy, BOX.w, BOX.h, red[0])
    art.ball(cx + dx, BOX.y + dy, BOX.w / 2, BOX.ry, red, BOX.y + dy)
  }
  // The front: the arch, lit at its top left, the face, its rim
  art.ball(cx, BOX.y, BOX.w / 2, BOX.ry, [red[1], red[1], red[2]], BOX.y)
  art.rect(BOX.x, BOX.y, BOX.w, BOX.h, red[1])
  art.rect(BOX.x, BOX.y - 1, 1, BOX.h + 1, red[2])
  art.rect(BOX.x, BOX.y + BOX.h - 1, BOX.w, 1, red[0])
  // The slot: dark inside, a lit lip under it; the knob
  art.rect(SLOT.x, SLOT.y, SLOT.w, 2, '#3a1414')
  art.rect(SLOT.x, SLOT.y + 2, SLOT.w, 1, red[2])
  art.ball(BOX.x + BOX.w - 4, BOX.y + 8, 1.4, 1.4, shades('#d8d8d8', 0.3, 0.3))
}

function still(dark: boolean) {
  // Behind: the sun by day, the moon and its craters by night; the wall and its door, the
  // lamp's light on them by night
  const back = new Raster(W, H)
  const [sx, sy] = SUN
  if (dark) {
    back.ball(sx, sy, 4.5, 4.5, ['#9aa0a6', '#d0d4d8', '#f0f2f4'])
    back.ball(sx - 1.5, sy - 1, 1.2, 1.2, ['#b8bec4', '#b8bec4', '#c4c9ce'])
    back.ball(sx + 1.5, sy + 1.5, 0.9, 0.9, ['#b8bec4', '#b8bec4', '#c4c9ce'])
  } else back.ball(sx, sy, 4.5, 4.5, shades(PAL.yellow, 0.15, 0.5))
  wall(back, dark)
  door(back, dark)
  if (dark) glow(back)
  back.outline(outlineOf(dark))

  // In front: the lamp, the cobbles and the doormat, the plant, the mailbox on its post
  const front = new Raster(W, H)
  lamp(front, dark)
  cobbles(front, dark)
  doormat(front)
  plant(front, dark)
  mailbox(front)
  front.outline(outlineOf(dark))
  return back.over(front)
}

// ── The bluebird

type Wing = 'up' | 'mid' | 'down' | 'fold'
const FLAP: Wing[] = ['up', 'mid', 'down', 'mid']
// Its toes' row, the point it is placed by
const FEET: Point = [13, 19]

// The bluebird, side on and facing right on a 30 × 28 raster: a round blue body, a rusty
// breast, a white eye, a gold beak shut or open, the near wing at one of its poses, its legs
// under it or the letter in its claws. Not outlined: it is scaled, then outlined in place
function bird(wing: Wing, chirp: boolean, carry: boolean) {
  const art = new Raster(30, 28)
  const blue = shades(PAL.blue, 0.3, 0.4)
  const deep = shades('#4f88d0', 0.3, 0.35)
  const rust = shades(PAL.orange, 0.22, 0.3)
  const gold = shades('#f2b043', 0.25, 0.35)
  if (carry) envelope(art, FEET[0] - 5, FEET[1])
  // The far wing, raised behind the back
  if (wing === 'up')
    art.poly(
      [
        [13, 8],
        [17, 8],
        [17, 1],
        [14, 0],
      ],
      deep[0],
    )
  // The tail, a short fan behind
  art.poly(
    [
      [8, 9],
      [1, 7],
      [0, 10],
      [2, 13],
      [8, 13],
    ],
    deep[1],
  )
  art.line(1, 12, 7, 13, deep[0])
  // Legs and toes, gripping the letter's edge when it carries it
  const leg = gold[0]
  for (const lx of [11, 15]) {
    art.set(lx, 17, leg)
    art.set(lx, 18, leg)
    art.set(lx - 1, 18, leg)
    art.set(lx + 1, 18, leg)
    if (carry) art.set(lx, 19, leg)
  }
  // The body and the head, one round shape; the breast over its front
  art.ball(13, 12, 7.5, 5.5, blue)
  art.ball(19.5, 8, 4.3, 4.1, blue)
  const breast = new Raster(30, 28)
  breast.ball(18.5, 13, 5, 4.6, rust)
  breast.cells.forEach((c, i) => {
    if (c && art.cells[i] === blue[0]) art.cells[i] = c
    else if (c && art.cells[i] && i % 30 > 15) art.cells[i] = c
  })
  // The eye: white, its pupil looking ahead
  art.rect(20, 6, 2, 2, '#ffffff')
  art.rect(21, 6, 1, 2, '#242424')
  // The beak, shut or open in a chirp
  if (chirp) {
    art.poly(
      [
        [23, 6.5],
        [27.5, 7.5],
        [23, 9],
      ],
      gold[1],
    )
    art.poly(
      [
        [23, 10],
        [26.5, 11.8],
        [23, 11.5],
      ],
      gold[0],
    )
  } else {
    art.poly(
      [
        [23, 7.5],
        [27.5, 9],
        [23, 10.5],
      ],
      gold[1],
    )
    art.line(23, 7, 26, 8, gold[2])
    art.line(23, 10, 26, 9.5, gold[0])
  }
  // The near wing: its covert lit, its tips darker
  const shapes: Record<Wing, Point[]> = {
    fold: [
      [8, 9],
      [15, 9],
      [16, 12],
      [12, 15],
      [4, 14],
    ],
    up: [
      [9, 10],
      [16, 9],
      [13, 3],
      [8, 0],
      [4, 1],
    ],
    mid: [
      [9, 9],
      [16, 9],
      [12, 12],
      [3, 12],
      [0, 9],
    ],
    down: [
      [9, 11],
      [16, 10],
      [12, 21],
      [8, 20],
    ],
  }
  const w = shapes[wing]
  art.poly(w, deep[1])
  art.line(w[0]![0], w[0]![1], w[1]![0] - 1, w[1]![1], deep[2])
  const tip = w[wing === 'fold' || wing === 'mid' ? w.length - 1 : 2]!
  art.line(tip[0], tip[1], (tip[0] + w[0]![0]) / 2, (tip[1] + w[0]![1]) / 2, deep[0])
  return art
}

// Where the bird is at tl: its toes' point, its scale, squash (k > 0) or stretch (k < 0), lean,
// the way it faces (1 right, -1 left), wing, beak, and whether it holds the letter; nothing
// while it is not there
function birdAt(tl: number, u: number) {
  const flap = FLAP[Math.floor(tl / 85) % 4]!
  const bob = wave(u, 25)
  const flying = { k: 0, lean: 0, face: 1, wing: flap, chirp: false, carry: false }
  if (tl < IN[0] || tl >= OFF[1]) return null
  // In from far off: smaller and slower across the screen while far, slowing to a hover
  if (tl < IN[1]) {
    const lin = (tl - IN[0]) / (IN[1] - IN[0])
    const s = 1 / (1 + 6 * (1 - lin) ** 2)
    const [x, y] = bez(START, [44, 8], [14, 14], HOVER, (s - 1 / 7) / (6 / 7))
    return { ...flying, x, y: y + bob * s, s, carry: true }
  }
  // Hovering over the slot, it lets go of the letter
  if (tl < DROP[1]) {
    const lift = tl > DROP[0] ? 2 * smooth(tl, DROP[0], DROP[0] + 200) : 0
    return { ...flying, x: HOVER[0], y: HOVER[1] + bob - lift, s: 1, carry: tl < DROP[0] }
  }
  // Aside while the hearts rise, then down onto the box
  if (tl < LAND[1]) {
    const away = smooth(tl, ASIDE_AT[0], ASIDE_AT[1])
    const land = smooth(tl, LAND[0], LAND[1])
    const hx = HOVER[0] + (ASIDE[0] - HOVER[0]) * away
    const hy = HOVER[1] - 2 + (ASIDE[1] - HOVER[1] + 2) * away
    const x = hx + (PERCH[0] - hx) * land
    const y = hy + (PERCH[1] - hy) * land - Math.sin(land * Math.PI) * 5 + bob * (1 - land)
    return { ...flying, x, y, s: 1 }
  }
  // Perched: a squash as it lands, it breathes, hops round to face the other way (a crouch, a
  // stretch, a squash), chirps; crouches to go
  if (tl < OFF[0]) {
    const since = (tl - LAND[1]) / 300
    const settle = since < 1 ? 0.2 * Math.cos(since * Math.PI * 1.5) * (1 - since) : 0
    const h = hop(tl, HOP, 420)
    const crouch = 0.16 * smooth(tl, OFF[0] - 220, OFF[0])
    const chirp = tl >= CHIRP[0] && tl < CHIRP[1] && Math.floor((tl - CHIRP[0]) / 170) % 2 === 0
    return {
      ...flying,
      x: PERCH[0],
      y: PERCH[1] - h.up * 6,
      s: 1,
      k: settle + h.k + crouch + 0.03 * wave(u, 12),
      face: tl < HOP + 260 ? 1 : -1,
      wing: h.up > 0.05 ? flap : ('fold' as Wing),
      chirp,
    }
  }
  // Off into the distance, up and to the left: it leaps, then shrinks away
  const lin = (tl - OFF[0]) / (OFF[1] - OFF[0])
  const s = 1 / (1 + 6 * lin ** 1.5)
  const [x, y] = bez(PERCH, [34, 24], [22, 10], END, (1 - s) / (6 / 7))
  const k = lin < 0.08 ? -0.14 * (1 - lin / 0.08) : 0
  return { ...flying, x, y, s, k, lean: 0.25 * s, face: -1 }
}

// A note and a pair of beamed notes
const NOTES = [
  ['..#..', '..##.', '..#.#', '..#..', '###..', '###..'],
  ['.#####', '.#...#', '.#...#', '##..##', '##..##'],
]

// A heart on its own raster, outlined
function heartSprite(size: number, dark: boolean) {
  const art = new Raster(13, 13)
  if (size > 0.5) heart(art, 6.5, 5.5, size, shades(PAL.red, 0.3, 0.4))
  art.outline(outlineOf(dark))
  return art
}

// The flag on the box's left side, turned `a` from upright (-pi / 2: down, pointing left): its
// steel arm and its red cloth, on the outer side of the arm
function flag(art: Raster, a: number) {
  const [px, py] = PIVOT
  const at = (along: number, across: number): Point => [
    px + Math.sin(a) * along - Math.cos(a) * across,
    py - Math.cos(a) * along - Math.sin(a) * across,
  ]
  const steel = shades('#a8a8a8', 0.35, 0.4)
  for (let i = 0; i <= 12; i += 0.5) {
    art.set(...at(i, 0), steel[2])
    art.set(...at(i, -1), steel[0])
  }
  const red = shades('#ef4f43', 0.3, 0.35)
  art.poly([at(12.5, 0.5), at(12.5, 6.5), at(7, 6.5), at(7, 0.5)], red[1])
  art.line(...at(12, 1), ...at(12, 6), red[2])
  art.line(...at(7.5, 1), ...at(7.5, 6), red[0])
  art.rect(px, py - 1, 2, 2, steel[0])
}

function paint(t: number, dark: boolean) {
  const art = new Raster(W, H)
  const u = phase(t, PERIOD)
  // The time within the loop: what flaps or steps by it repeats exactly from loop to loop
  const tl = u * PERIOD
  const [sx, sy] = SUN
  // A few stars by night, twinkling, in the open sky only; the sun's rays by day, breathing
  // and turning
  if (dark)
    for (let i = 0; i < 12; i++) {
      const [x, y] = [3 + rand(i) * 120, 2 + rand(i + 40) * 34]
      if ((x > WALL.left - 3 && y > WALL.top - 3) || Math.hypot(x - sx, y - sy) < 9) continue
      if (wave(u, 3 + (i % 3), rand(i + 80)) > 0.2) art.set(x, y, i % 3 ? '#e0e0e0' : '#9a9a9a')
    }
  else
    for (let i = 0; i < 8; i++) {
      const a = ((i + 0.5) / 8) * 2 * Math.PI + u * (Math.PI / 4)
      const reach = 7 + 0.6 * (1 + wave(u, 5, 0.25))
      art.line(
        sx + Math.cos(a) * 6,
        sy + Math.sin(a) * 6,
        sx + Math.cos(a) * reach,
        sy + Math.sin(a) * reach,
        PAL.gold,
      )
    }

  // The flag: down; up with a wobble once the letter is in; back down before the loop ends
  flag(art, -(Math.PI / 2) * (1 - pop(tl, FLAG_UP, 420) + pop(tl, FLAG_DOWN, 420)))

  // The letter, let go over the slot, sliding down into it
  if (tl >= DROP[0] && tl < DROP[1]) {
    const p = ((tl - DROP[0]) / (DROP[1] - DROP[0])) ** 2
    envelope(art, HOVER[0] - 5, HOVER[1] + p * (SLOT.y + 1 - HOVER[1]), SLOT.y)
  }

  // The bird, or a speck far off
  const b = birdAt(tl, u)
  if (b && b.s >= SPECK) {
    const [x, y] = [Math.round(b.x), Math.round(b.y)]
    const [kx, ky] = [b.s * (1 + b.k * 0.6), b.s * (1 - b.k)]
    art.blit(bird(b.wing, b.chirp, b.carry), FEET[0], FEET[1], x, y, b.lean, kx * b.face, ky)
  }

  // Notes from its beak as it chirps, facing the open sky, rising and swaying
  for (let n = 0; n < 3; n++) {
    const age = tl - CHIRP[0] - n * 280
    if (age < 0 || age > 900) continue
    const nx = PERCH[0] - 20 - n * 2 + 2 * Math.sin(age / 150 + n)
    const ny = PERCH[1] - 14 - age * 0.016
    art.sprite(NOTES[n % 2]!, nx, ny, { '#': n % 2 ? PAL.yellow : PAL.purple })
  }
  art.outline(outlineOf(dark))

  // The speck: wings up, wings down
  if (b && b.s < SPECK) {
    const r = b.s < 0.17 ? 1 : 2
    const up = Math.floor(tl / 85) % 2 ? -1 : 1
    const [x, y] = [Math.round(b.x), Math.round(b.y - 4 * b.s)]
    const ink = dark ? PAL.blue : '#3f6fa8'
    art.line(x - r, y + up, x, y, ink)
    art.line(x, y, x + r, y + up, ink)
  }

  // Hearts out of the box, rising and swaying, beating, shrinking away
  HEARTS.forEach((born, i) => {
    const age = tl - born
    if (age < 0 || age > 1300) return
    const size = (2.4 + (i % 2) * 0.6) * (1 - Math.max(0, age - 900) / 400)
    const beat = 1 + 0.2 * Math.max(0, Math.sin(age / 130)) ** 6
    const hx = [41, 46, 37][i]! + age * 0.012 + Math.sin(age / 220 + i * 2) * 2.5
    art.blit(heartSprite(size * beat, dark), 6, 6, hx, 41 - age * 0.026)
  })
  // A sparkle at the slot as the letter goes in
  twinkle(art, SLOT.x - 2, SLOT.y - 2, tl, DROP[1] - 60, dark ? '#ffffff' : PAL.gold, 450)

  // By night the lamp's light flickers round it: sparse warm dots, thinning outwards
  if (dark) {
    const [cx, cy] = [LAMP[0] + 0.5, LAMP[1] + 0.5]
    const reach = 10 + wave(u, 8)
    const shift = Math.floor(tl / 170) % 2
    for (let y = Math.floor(cy - reach); y <= cy + reach; y++)
      for (let x = Math.floor(cx - reach); x <= cx + reach; x++) {
        const d = (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) - 5.5) / (reach - 5.5)
        if (d > 0 && d < 1 && (x + y + shift) % 2 === 0 && rand(x * 57 + y * 131) > 0.35 + d * 0.6)
          if (!art.at(x, y)) art.set(x, y, '#ffcf7a')
      }
  }
  return art
}

// At rest (reduced motion): perched on the box, the flag up, chirping
export const mail: Hero = { w: W, h: H, period: PERIOD, rest: CHIRP[0] + 380, still, paint }
