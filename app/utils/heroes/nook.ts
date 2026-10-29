// /blog: a writing nook, after Kirokaze's and Waneella's rooms. Rain streaks the window over a
// city whose lights come and go (a soft day sky with drifting clouds in light mode); on the desk
// the laptop types the article line by line, publishes it, and it rises off the screen as a
// paper plane, out through the window, shrinking into the city. The lamp pours its warm glow
// over a steaming mug; a ginger cat sleeps on a pile of books, breathing, its tail tip beating.
import {
  FRAME,
  mix,
  outlineOf,
  PAL,
  pop,
  rand,
  Raster,
  shades,
  smooth,
  twinkle,
  type Rgb,
} from '../cameos/art'
import { type Hero, phase, wave } from './hero'

const W = 128
const H = 96
// A whole number of pose ticks, so the last poses of a loop lead into its first
const PERIOD = FRAME * 144

// The window: its frame, the glass in it, split in four by a mullion and a transom
const WIN = { x: 38, y: 4, w: 58, h: 40 }
const GLASS = { x: 41, y: 7, w: 52, h: 34 }
const GROUND = GLASS.y + GLASS.h
const MULLION = 66
const TRANSOM = 23
const PANES: [number, number][] = [
  [41, 7],
  [68, 7],
  [41, 25],
  [68, 25],
]
const inPane = (x: number, y: number) => {
  ;[x, y] = [Math.floor(x), Math.floor(y)]
  return (
    x >= GLASS.x &&
    x < GLASS.x + GLASS.w &&
    y >= GLASS.y &&
    y < GROUND &&
    x !== MULLION &&
    x !== MULLION + 1 &&
    y !== TRANSOM &&
    y !== TRANSOM + 1
  )
}

// The city, [x in the glass, width, height]: far towers in the haze, nearer blocks in front
const FAR: [number, number, number][] = [
  [0, 7, 18],
  [6, 5, 23],
  [11, 7, 15],
  [18, 6, 20],
  [24, 8, 13],
  [32, 5, 27],
  [37, 7, 18],
  [44, 8, 22],
]
const NEAR: [number, number, number][] = [
  [0, 6, 10],
  [6, 6, 14],
  [12, 5, 8],
  [17, 8, 12],
  [25, 6, 16],
  [31, 7, 9],
  [38, 6, 13],
  [44, 8, 11],
]
// The antenna on the tallest tower, its foot
const ANTENNA: [number, number] = [GLASS.x + 34, GROUND - 27]
// The skyline: per column of the glass, its first row of building (the sky is above it)
const SKYLINE = Array.from({ length: W }, (_, x) => {
  let top = GROUND
  for (const [bx, bw, bh] of [...FAR, ...NEAR])
    if (x >= GLASS.x + bx && x < GLASS.x + bx + bw) top = Math.min(top, GROUND - bh)
  return x === ANTENNA[0] ? ANTENNA[1] - 4 : top
})
// The nearer blocks' windows, every other column, every third row
const LIGHTS: [number, number][] = []
for (const [bx, bw, bh] of NEAR)
  for (let x = GLASS.x + bx + 1; x < GLASS.x + bx + bw - 1; x += 2)
    for (let y = GROUND - bh + 2; y < GROUND - 1; y += 3) if (inPane(x, y)) LIGHTS.push([x, y])

function cityOf(dark: boolean) {
  return dark
    ? {
        sky: ['#121729', '#1a2040', '#29304f'],
        far: '#232a45',
        near: ['#11152a', '#161b2d', '#21283f'] as const,
        lit: ['#ffcf70', '#f3a95b'],
        dim: '#262d47',
        glint: '#2e3858',
      }
    : {
        sky: ['#a6ccec', '#c0daef', '#d9e8f3'],
        far: '#b2c2d3',
        near: ['#7d91a7', '#8ea1b6', '#a4b5c7'] as const,
        lit: ['#dbe7f1', '#c8d8e7'],
        dim: '#74889e',
        glint: '#eef5fb',
      }
}

// The desk: the back and front rows of its top, the front edge under it
const DESK = { x: 3, w: 122, top: 73, front: 78 }
const PLANK = shades(mix(PAL.wood, '#ffffff', 0.22), 0.16, 0.22)
const WOOD = shades(PAL.wood, 0.3, 0.28)

// The laptop's screen, and the article on it: lines of words (their lengths) in a colour, one
// word of the second a link; the title two rows tall, the code indented
const SCREEN = { x: 51, y: 53, w: 27, h: 17 }
const BODY = '#a7b0bd'
const TEXT: { x: number; y: number; h: number; color: Rgb; words: number[]; link?: number }[] = [
  { x: 53, y: 55, h: 2, color: PAL.orange, words: [4, 6, 3] },
  { x: 53, y: 59, h: 1, color: BODY, words: [3, 5, 2, 6, 3], link: 3 },
  { x: 53, y: 61, h: 1, color: BODY, words: [5, 3, 7, 4] },
  { x: 55, y: 63, h: 1, color: PAL.green, words: [3, 4, 5] },
  { x: 53, y: 65, h: 1, color: BODY, words: [4, 6, 2] },
]
// Typing a line ends with a short pause, as long as this many letters
const NEWLINE = 3
const LETTERS = TEXT.reduce(
  (n, line) => n + line.words.reduce((a, b) => a + b + 1, 0) - 1 + NEWLINE,
  0,
)
// The publish button, bottom right of the screen
const BUTTON = { x: 69, y: 65, w: 7, h: 4 }

// The lamp: where its head turns, the way it points, its mouth
const PIVOT: [number, number] = [110, 43]
const AIM: [number, number] = [-0.4, 0.917]
const SIDE: [number, number] = [AIM[1], -AIM[0]]
const MOUTH: [number, number] = [PIVOT[0] + AIM[0] * 8, PIVOT[1] + AIM[1] * 8]
const at = (p: [number, number], d: [number, number], k: number): [number, number] => [
  p[0] + d[0] * k,
  p[1] + d[1] * k,
]

// The story, as fractions of the loop
const TYPE = [0.05, 0.47] as const
const SHOW_BUTTON = 0.485
const PRESS = [0.52, 0.527] as const
const FLY = [0.535, 0.84] as const
const SCROLL = 0.88

// The plane's way: off the screen, up past the lid, out through the window into the city
const ROUTE: [number, number][] = [
  [64, 61],
  [60, 40],
  [60, 28],
  [52, 19],
]
function route(s: number): [number, number] {
  const k = [(1 - s) ** 3, 3 * (1 - s) ** 2 * s, 3 * (1 - s) * s * s, s ** 3]
  return [0, 1].map((c) => ROUTE.reduce((a, p, i) => a + p[c]! * k[i]!, 0)) as [number, number]
}
const PAPER = shades(PAL.paper, 0.18, 0.5)

function still(dark: boolean) {
  const art = new Raster(W, H)
  const city = cityOf(dark)

  // The sky in the glass, deeper at the top, dithered between its bands; by day, the sun
  for (let y = GLASS.y; y < GROUND; y++)
    for (let x = GLASS.x; x < GLASS.x + GLASS.w; x++) {
      const band = Math.floor(((y - GLASS.y) / GLASS.h) * 3 + ((x + y) & 1 ? 0.15 : -0.15))
      art.set(x, y, city.sky[Math.max(0, Math.min(2, band))]!)
    }
  if (!dark) art.ball(84, 13, 4, 4, shades(PAL.yellow, 0.1, 0.55))
  // The far towers in the haze, the antenna on the tallest
  for (const [bx, bw, bh] of FAR) art.rect(GLASS.x + bx, GROUND - bh, bw, bh, city.far)
  art.line(ANTENNA[0], ANTENNA[1] - 4, ANTENNA[0], ANTENNA[1], city.far)
  // The nearer blocks: lit on the left, shaded on the right, their roofs; their windows, some lit
  for (const [bx, bw, bh] of NEAR) {
    const [x, y] = [GLASS.x + bx, GROUND - bh]
    art.rect(x, y, bw, bh, city.near[1])
    art.rect(x + bw - 1, y, 1, bh, city.near[0])
    art.rect(x, y, 1, bh, city.near[2])
    art.rect(x, y, bw, 1, city.near[2])
  }
  LIGHTS.forEach(([x, y], i) => art.set(x, y, rand(i + 7) < 0.45 ? city.lit[i % 2]! : city.dim))
  // The frame's shadow along the top and left of each pane, a glint across the glass
  for (const [x0, y0] of PANES) {
    for (let x = x0; x < x0 + 25; x++) art.set(x, y0, mix(art.at(x, y0)!, '#000000', 0.28))
    for (let y = y0 + 1; y < y0 + 16; y++) art.set(x0, y, mix(art.at(x0, y)!, '#000000', 0.28))
  }
  for (let i = 0; i < 7; i++) {
    if (i % 2 === 0) art.set(44 + i, 15 - i, city.glint)
    art.set(47 + i, 15 - i, city.glint)
  }

  // The frame, painted, its bars lit on top and in shade below; the sill
  const frame = shades(dark ? '#d3c9b8' : '#e4d9c6', 0.25, 0.5)
  art.box(WIN.x, WIN.y, WIN.w, 3, frame)
  art.box(WIN.x, WIN.y + 3, 3, WIN.h - 6, frame)
  art.box(WIN.x + WIN.w - 3, WIN.y + 3, 3, WIN.h - 6, frame)
  art.box(WIN.x, GROUND, WIN.w, 3, frame)
  art.box(GLASS.x, TRANSOM, GLASS.w, 2, frame)
  art.box(MULLION, GLASS.y, 2, GLASS.h, frame)
  art.box(WIN.x - 3, WIN.y + WIN.h, WIN.w + 6, 3, frame)

  desk(art)
  books(art)
  laptop(art)
  mug(art)
  lamp(art)
  art.outline(outlineOf(dark))
  return art
}

// The desk: its legs, a drawer, the top seen from above with its grain, the front edge
function desk(art: Raster) {
  art.box(7, DESK.front + 5, 4, 12, WOOD)
  art.box(117, DESK.front + 5, 4, 12, WOOD)
  art.box(91, DESK.front + 5, 30, 6, WOOD)
  art.rect(103, DESK.front + 7, 5, 1, PAL.gold)
  art.rect(DESK.x, DESK.top, DESK.w, DESK.front - DESK.top, PLANK[1])
  art.rect(DESK.x, DESK.front, DESK.w, 1, PLANK[2])
  for (const [x, y, w] of [
    [8, 74, 9],
    [38, 76, 12],
    [86, 74, 7],
    [100, 76, 10],
  ] as const)
    art.rect(x, y, w, 1, PLANK[0])
  art.box(DESK.x, DESK.front + 1, DESK.w, 4, WOOD)
  art.rect(DESK.x + 1, DESK.front + 3, DESK.w - 2, 1, mix(WOOD[1], '#000000', 0.12))
}

// A pile of four books, the cat's bed: spines, the pages of one, gold bands and titles
function books(art: Raster) {
  const shadow = mix(PLANK[1], '#000000', 0.3)
  art.rect(36, DESK.front - 2, 3, 2, shadow)
  // The bottom one, purple, its spine with two bands and a title
  const purple = shades(PAL.purple, 0.38, 0.3)
  art.box(6, 73, 31, 5, purple)
  art.rect(9, 74, 1, 3, PAL.gold)
  art.rect(33, 74, 1, 3, PAL.gold)
  art.rect(17, 75, 9, 1, PAL.gold)
  // Its pages to us: blue covers, cream leaves
  const blue = shades(PAL.blue, 0.38, 0.3)
  const leaves = shades(PAL.cream, 0.15, 0.4)
  art.box(8, 69, 28, 4, blue)
  art.rect(9, 70, 26, 2, leaves[1])
  for (let x = 9; x < 35; x += 2) art.set(x, 71, leaves[0])
  // Green, a label on its spine
  const green = shades('#4fa865', 0.32, 0.3)
  art.box(7, 65, 27, 4, green)
  art.rect(15, 66, 8, 2, leaves[2])
  // Red, thinner, on top
  const red = shades(PAL.red, 0.32, 0.25)
  art.box(10, 62, 22, 3, red)
  art.rect(13, 63, 1, 1, PAL.gold)
  art.rect(28, 63, 1, 1, PAL.gold)
}

// The laptop facing us: the lid, its screen and camera; the deck in front with its keys
function laptop(art: Raster) {
  const shell = shades('#7a808a', 0.4, 0.4)
  art.rect(84, DESK.front - 2, 3, 2, mix(PLANK[1], '#000000', 0.3))
  art.box(49, 51, 31, 21, shell)
  art.rect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, '#1b2030')
  art.set(64, 52, '#3a3f48')
  // The editor's bar: three dots
  art.rect(SCREEN.x, SCREEN.y, SCREEN.w, 1, '#2b3246')
  art.set(53, SCREEN.y, PAL.red)
  art.set(55, SCREEN.y, PAL.yellow)
  art.set(57, SCREEN.y, PAL.green)
  art.poly(
    [
      [49, 72],
      [80, 72],
      [84, 78],
      [45, 78],
    ],
    shell[1],
  )
  art.rect(46, 77, 38, 1, shell[0])
  art.rect(50, 72, 29, 1, shell[2])
  for (const y of [73, 75])
    for (let x = 50 - (y - 73) / 2; x < 79 + (y - 73) / 2; x++)
      if ((x + y) % 2 === 0) art.set(x, y, '#3a3f48')
  art.rect(60, 76, 9, 1, shell[2])
}

// A mug of coffee, white with an orange band, its handle on the right
function mug(art: Raster) {
  const china = shades(PAL.paper, 0.2, 0.5)
  art.ball(94.5, 73, 2.6, 2.8, china)
  art.set(94, 72, undefined)
  art.set(94, 73, undefined)
  art.set(95, 73, undefined)
  art.cylinder(87, 69, 7, 9, china)
  art.cylinder(87, 72, 7, 2, shades(PAL.orange, 0.3, 0.35))
  art.rect(88, 69, 5, 1, '#5b3420')
}

// The lamp: a domed foot, two arms with their joints, the shade aimed at the desk, its bulb
function lamp(art: Raster) {
  const metal = shades('#5f9e96', 0.38, 0.4)
  const joint = shades(PAL.steel, 0.3, 0.45)
  art.ball(114, DESK.front - 0.5, 8, 4, metal, DESK.front - 0.5)
  art.stroke([[114, 74], [121, 56], PIVOT], 0.9, metal)
  art.ball(121, 56, 1.6, 1.6, joint)
  art.poly(
    [at(PIVOT, SIDE, 2.2), at(PIVOT, SIDE, -2.2), at(MOUTH, SIDE, -5.5), at(MOUTH, SIDE, 5.5)],
    metal[1],
  )
  art.line(...at(PIVOT, SIDE, -1.6), ...at(MOUTH, SIDE, -4.6), metal[2])
  art.line(...at(PIVOT, SIDE, 1.6), ...at(MOUTH, SIDE, 4.6), metal[0])
  art.ball(PIVOT[0], PIVOT[1], 1.6, 1.6, joint)
  // Its mouth: the rim, the dark inside, the bulb hanging in it
  art.line(...at(MOUTH, SIDE, -5.5), ...at(MOUTH, SIDE, 5.5), metal[2])
  art.line(...at(at(MOUTH, AIM, -1), SIDE, -4), ...at(at(MOUTH, AIM, -1), SIDE, 4), metal[0])
  const bulb = at(MOUTH, AIM, 0.4)
  art.ball(bulb[0], bulb[1], 2.4, 2.1, shades('#fff3c4', 0.12, 0.6))
}

// The cat: curled on the books, head on its paws, eyes shut; breathing (0 to 1), its tail tip
// swung by `swing`
function cat(art: Raster, breath: number, swing: number) {
  const fur = shades('#e8964e', 0.28, 0.32)
  const stripe = '#b55e24'
  const white = shades('#f7efe4', 0.12, 0.4)
  const floor = 61.5
  // The tail, down the side of the pile and curled at the end, its darker tip beating
  const tip: [number, number] = [9.5 + Math.cos(swing) * 2.6, 70 - Math.sin(swing) * 2.6]
  art.stroke(
    [
      [11, 59.5],
      [7.5, 60.5],
      [6, 62.5],
      [5.6, 65.5],
      [6.4, 68.6],
      [8.6, 70],
    ],
    1.1,
    fur,
  )
  art.stroke([[8.6, 70], tip], 1.1, shades(stripe, 0.25, 0.3))
  art.set(5, 63, stripe)
  art.set(5, 66, stripe)
  // The body, rising as it breathes, its stripes across the back
  const [cx, cy, rx, ry] = [20, 57, 10.5, 4.8 + breath * 0.7]
  art.ball(cx, cy, rx, ry, fur, floor)
  for (const sx of [12.5, 16, 19.5, 23]) {
    const top = cy - ry * Math.sqrt(1 - ((sx - cx) / rx) ** 2)
    art.set(sx, top + 0.6, stripe)
    art.set(sx, top + 1.6, stripe)
    art.set(sx - 1, top + 2.6, stripe)
  }
  // The head on its paws, parted from the body by a shadow: ears, a striped brow, shut eyes,
  // a pink nose on a white muzzle
  const [hx, hy] = [30.5, 56.5]
  const ear = (s: number) =>
    art.poly(
      [
        [hx + s * 4.9, hy - 1.6],
        [hx + s * 3.6, hy - 8.6],
        [hx + s * 0.4, hy - 3.8],
      ],
      s < 0 ? fur[1] : fur[0],
    )
  ear(-1)
  ear(1)
  art.ball(hx - 0.7, hy + 0.3, 5.2, 4.5, [fur[0], fur[0], fur[0]])
  art.ball(hx, hy, 4.9, 4.2, fur)
  art.set(hx - 3.6, hy - 5.4, PAL.pink)
  art.set(hx + 3, hy - 5.4, PAL.pink)
  for (const [x, y] of [
    [-1.5, -3],
    [-0.5, -3.6],
    [0.5, -3.6],
    [1.5, -3],
  ])
    art.set(hx + x!, hy + y!, stripe)
  const ink = '#3d1d0c'
  for (const ex of [hx - 3, hx + 2]) {
    art.set(ex, hy - 0.2, ink)
    art.set(ex + 1, hy - 0.2, ink)
  }
  art.rect(hx - 1.5, hy + 1.6, 3, 2, white[1])
  art.set(hx - 0.5, hy + 1.5, PAL.pink)
  // The paws in front, white toes
  for (const px of [hx - 3.6, hx + 2.6]) {
    art.ball(px, floor - 0.6, 2, 1.2, fur, floor)
    art.set(px + 0.6, floor - 0.6, white[2])
  }
}

// A z, four or five pixels
const ZS = [
  ['####', '..#.', '.#..', '####'],
  ['#####', '...#.', '..#..', '.#...', '#####'],
]

// The plane, nose to the right, k times the contact cameo's (26 by 12): its wing, the fold
function planeArt(k: number, dark: boolean, outlined: boolean) {
  const art = new Raster(Math.ceil(27 * k) + 3, Math.ceil(12 * k) + 3)
  const p = (x: number, y: number): [number, number] => [1.5 + x * k, 1.5 + y * k]
  art.poly([p(1, 1), p(26, 7), p(1, 6)], PAPER[2])
  art.poly([p(1, 6), p(26, 7), p(8, 11)], PAPER[0])
  art.line(...p(1, 6), ...p(26, 7), PAPER[0])
  if (outlined) art.outline(outlineOf(dark))
  return { art, cx: 1.5 + 13 * k, cy: 1.5 + 6 * k }
}

// The article on the screen, the first `typed` letters of it, `scroll` rows up; where the next
// letter goes
function article(art: Raster, typed: number, scroll: number) {
  let n = 0
  let cursor: [number, number, number] = [TEXT[0]!.x, TEXT[0]!.y, 2]
  for (const line of TEXT) {
    let x = line.x
    line.words.forEach((length, w) => {
      for (let i = 0; i < length; i++, n++, x++) {
        if (n >= typed) continue
        for (let j = 0; j < line.h; j++)
          if (line.y + j - scroll >= SCREEN.y + 2)
            art.set(x, line.y + j - scroll, w === line.link ? PAL.blue : line.color)
        cursor = [x + 1, line.y + line.h - 2, 2]
      }
      if (w < line.words.length - 1) {
        if (n < typed) cursor = [x + 1, line.y + line.h - 2, 2]
        n++
        x++
      }
    })
    n += NEWLINE
  }
  return cursor
}

// A 4 by 4 ordered dither, for light that thins out
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]

// What is out of the window, painted on a layer the size of the glass, laid on the panes only
// (and only on the sky, above the skyline, for what is behind the city)
function throughGlass(art: Raster, layer: Raster, behindCity = false) {
  layer.cells.forEach((c, i) => {
    const [x, y] = [GLASS.x + (i % GLASS.w), GLASS.y + Math.floor(i / GLASS.w)]
    if (c && inPane(x, y) && (!behindCity || y < SKYLINE[x]!)) art.set(x, y, c)
  })
}

const stills = new Map<boolean, Raster>()

function paint(t: number, dark: boolean) {
  const art = new Raster(W, H)
  const u = phase(t, PERIOD)
  // The time within the loop, and on the pose clock (whole ticks of FRAME)
  const tl = u * PERIOD
  const uq = (Math.floor(tl / FRAME) * FRAME) / PERIOD
  const city = cityOf(dark)
  const room = stills.get(dark) ?? stills.set(dark, still(dark)).get(dark)!

  // Out of the window. By day, clouds drift behind the towers; by night the lights in the city
  // come and go and the antenna blinks
  if (!dark) {
    const sky = new Raster(GLASS.w, GLASS.h)
    const cloud = shades('#ffffff', 0.07, 0)
    const span = GLASS.w + 26
    for (const [y, s, laps, x0] of [
      [6, 1, 1, 0.15],
      [13, 0.7, 2, 0.65],
    ] as const) {
      const x = -13 + ((x0 + u * laps) % 1) * span
      sky.ball(x, y, 6 * s, 2.6 * s, cloud)
      sky.ball(x + 5 * s, y + 0.6, 4.5 * s, 2.1 * s, cloud)
      sky.ball(x - 5 * s, y + 0.9, 4 * s, 1.8 * s, cloud)
    }
    throughGlass(art, sky, true)
  } else {
    for (let k = 0; k < 7; k++) {
      const [x, y] = LIGHTS[Math.floor(rand(k + 300) * LIGHTS.length)]!
      art.set(x, y, wave(uq, 1 + (k % 3), rand(k + 400)) > 0.1 ? city.lit[k % 2]! : city.dim)
    }
    if ((uq * 16) % 1 < 0.3) art.set(ANTENNA[0], ANTENNA[1] - 5, PAL.red)
  }

  // The paper plane: it pops off the screen, climbs past the lid and out through the window,
  // smaller and smaller, behind the frame once it is outside, gone in a twinkle
  const fg = new Raster(W, H)
  const f = (u - FLY[0]) / (FLY[1] - FLY[0])
  if (f >= 0 && f < 1) {
    const q = smooth(f, 0.1, 1)
    const s = 1 - (1 - q) ** 1.5
    const [x, y] = route(s)
    const [nx, ny] = route(Math.min(1, s + 0.02))
    const k = 0.62 * pop(tl, FLY[0] * PERIOD, 300) * (1 - 0.92 * q ** 0.8)
    // Nose up no more than a glider would, or it reads as a pointer
    const angle = Math.min(0.45, Math.atan2(y - ny, x - nx)) + 0.1 * wave(u, 24)
    const outside = q > 0.42
    if (27 * k < 5) {
      art.set(x, y, PAPER[2])
      art.set(x + 1, y, dark ? PAPER[0] : '#6f7f92')
    } else {
      const plane = planeArt(k, dark, outside)
      if (outside) {
        const far = new Raster(GLASS.w, GLASS.h)
        far.blit(plane.art, plane.cx, plane.cy, x - GLASS.x, y - GLASS.y, angle, -1, 1)
        throughGlass(art, far)
      } else fg.blit(plane.art, plane.cx, plane.cy, x, y, angle, -1, 1)
    }
  }
  const end = route(1)
  twinkle(art, end[0], end[1], tl, FLY[1] * PERIOD - 60, dark ? '#ffffff' : PAL.gold, 420)

  // The rain, driven to the left, each streak brighter at its head
  if (dark)
    for (let k = 0; k < 20; k++) {
      const s = (rand(k) + u * 36) % 1
      const x0 = GLASS.x + ((rand(k + 50) * GLASS.w + (1 - s) * 14) % GLASS.w)
      const y0 = GLASS.y - 2 + s * (GLASS.h + 4)
      for (let j = 0; j < 4; j++)
        if (inPane(x0 + j * 0.45, y0 - j))
          art.set(x0 + j * 0.45, y0 - j, j ? (j < 3 ? '#56658f' : '#3c4768') : '#93a2cc')
    }

  // The screen: the article typing itself, the cursor blinking while it waits; published, it
  // scrolls away
  const typed = Math.floor(LETTERS * smooth(uq, TYPE[0], TYPE[1]) ** 0.9)
  const scroll = uq >= SCROLL ? Math.floor((uq - SCROLL) * (PERIOD / FRAME)) : 0
  const cursor = article(art, typed, scroll)
  const typing = uq > TYPE[0] && uq < TYPE[1]
  if (scroll === 0 && (typing || Math.floor(tl / (FRAME * 5)) % 2 === 0))
    art.rect(cursor[0], cursor[1], 1, cursor[2], '#e8e8e8')
  // The publish button: it shows, is pressed, and ticks
  if (uq >= SHOW_BUTTON && uq < SCROLL) {
    const pressed = uq >= PRESS[0] && uq < PRESS[1]
    const green = shades(PAL.green, pressed ? 0.45 : 0.3, 0.35)
    art.box(BUTTON.x, BUTTON.y + (pressed ? 1 : 0), BUTTON.w, BUTTON.h - (pressed ? 1 : 0), green)
    const ink = '#ffffff'
    if (uq < PRESS[0]) {
      art.set(BUTTON.x + 3, BUTTON.y + 1, ink)
      art.rect(BUTTON.x + 2, BUTTON.y + 2, 3, 1, ink)
    } else if (!pressed)
      for (const [x, y] of [
        [1, 2],
        [2, 3],
        [3, 2],
        [4, 1],
        [5, 0],
      ])
        art.set(BUTTON.x + x!, BUTTON.y + y!, ink)
  }

  // The cat, asleep: it breathes four times a loop, its tail tip beats
  cat(fg, (wave(uq, 4) + 1) / 2, 0.7 * wave(uq, 10))
  fg.outline(outlineOf(dark))
  art.over(fg)
  // A z now and then, drifting up off its head and growing
  for (const k of [0, 0.5]) {
    const p = (uq * 3 + k) % 1
    if (p < 0.08 || p > 0.8) continue
    art.sprite(ZS[p < 0.45 ? 0 : 1]!, 28 - p * 10 + Math.sin(p * 2 * Math.PI) * 1.5, 45 - p * 14, {
      '#': dark ? '#c9c9c9' : '#8d8a86',
    })
  }

  // The lamp's glow: a sparse dither of warm light in the air, thinning away from the bulb and
  // breathing; a pool of it on the desk
  const glow = dark ? '#e9c46a' : '#eec46a'
  const pool = mix(PLANK[1], '#ffe9a6', 0.5)
  const plank = new Set<Rgb>(PLANK)
  const breathe = 0.6 * wave(u, 3)
  const reach = DESK.front - MOUTH[1]
  for (let y = Math.ceil(MOUTH[1] + 1); y <= DESK.front; y++) {
    const d = y - MOUTH[1]
    const cx = MOUTH[0] + (d * AIM[0]) / AIM[1]
    const hw = 4.5 + d * 0.34 + breathe
    for (let x = Math.ceil(cx - hw); x <= cx + hw; x++) {
      if (art.at(x, y)) continue
      const below = room.at(x, y)
      const light = (1 - Math.abs(x - cx) / hw) ** 0.7 * (1 - (0.65 * d) / reach)
      const bayer = BAYER[(x & 3) + 4 * (y & 3)]! / 16
      if (!below) {
        if (bayer < light * (dark ? 0.34 : 0.22)) art.set(x, y, glow)
      } else if (plank.has(below) && (light > 0.3 || (light > 0.12 && bayer < 0.5)))
        art.set(x, y, pool)
    }
  }

  // Steam off the mug: two wisps, a sway running up them, a break rising through them, thinning
  // out at the top
  const steam = dark ? '#8a8a8a' : '#bdbdbd'
  for (let i = 0; i < 2; i++)
    for (let r = 0; r < 13; r++) {
      const gap = (((r - u * 13 * 16 + i * 6) % 13) + 13) % 13
      if (gap < 2.5 || (r > 8 && (r + i) % 2)) continue
      art.set(89 + i * 3.5 + wave(u, 10, i * 0.3 - r * 0.07) * (0.3 + r * 0.1), 67 - r, steam)
    }
  return art
}

// At rest (reduced motion): the article published, its plane just out through the window
export const nook: Hero = { w: W, h: H, period: PERIOD, rest: FRAME * 96, still, paint }
