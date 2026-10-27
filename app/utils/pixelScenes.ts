// The pages' hero scenes (UiPixelScene): small pixel-art loops in the theme's palette,
// one per page — a crab climbing a mountain at dusk (/experience), an invader on a monitor
// typing gwm's commands (/apps), an invader filling a contribution graph (/activity), a
// writing nook at night (/blog), a bird posting a letter (/contact).
// A scene is a grid of SCENE_W × SCENE_H cells: what never moves, then what a tick
// (SCENE_TICK ms) draws. No background: the page shows through; the sun by day, the moon
// and stars by night.
import { INVADERS } from './invaders'

export const SCENE_W = 64
export const SCENE_H = 48
export const SCENE_TICK = 110

interface Cell {
  x: number
  y: number
  w?: number
  h?: number
  /** A letter of SCENE_FILL */
  c: string
}
interface Scene {
  still: Cell[]
  /** The scene loops every `ticks` */
  ticks: number
  frame: (tick: number) => Cell[]
}

// The theme's palette (theme.css): the primary and neutral scales, the accents' 500 and 600,
// one letter each. Upper-case letters and symbols change with the mode (sun or moon, clouds,
// stars, glow). The page fills cells with these classes; the OG images (satori, no CSS) with
// sceneColor().
export const SCENE_FILL: Record<string, string> = {
  // Neutrals, dark to light
  '0': 'fill-neutral-950',
  '1': 'fill-neutral-900',
  '2': 'fill-neutral-800',
  '3': 'fill-neutral-700',
  '4': 'fill-neutral-600',
  '5': 'fill-neutral-500',
  '6': 'fill-neutral-400',
  '7': 'fill-neutral-300',
  '8': 'fill-neutral-200',
  '9': 'fill-neutral-50',
  // Primary, dark to light
  a: 'fill-primary-950',
  b: 'fill-primary-900',
  c: 'fill-primary-800',
  d: 'fill-primary-700',
  e: 'fill-primary-600',
  f: 'fill-primary-500',
  g: 'fill-primary-400',
  h: 'fill-primary-300',
  i: 'fill-primary-200',
  j: 'fill-primary-100',
  // Accents
  r: 'fill-red-500',
  s: 'fill-red-600',
  t: 'fill-green-500',
  u: 'fill-green-600',
  v: 'fill-yellow-500',
  w: 'fill-yellow-600',
  x: 'fill-blue-500',
  y: 'fill-blue-600',
  z: 'fill-purple-500',
  k: 'fill-purple-600',
  l: 'fill-cyan-500',
  m: 'fill-cyan-600',
  // Greens in shade
  n: 'fill-green-600/70',
  o: 'fill-green-500/40',
  // Stars: on dark only
  '*': 'fill-transparent dark:fill-neutral-100',
  '+': 'fill-transparent dark:fill-neutral-400',
  // Sun on light, moon on dark
  O: 'fill-yellow-500 dark:fill-neutral-100',
  Q: 'fill-yellow-600 dark:fill-neutral-300',
  // Clouds: white by day, slate by night
  G: 'fill-white dark:fill-neutral-600',
  H: 'fill-neutral-200 dark:fill-neutral-700',
  // The mountain by day and by night: lit face, shadowed face, their strata
  N: 'fill-neutral-300 dark:fill-neutral-500',
  P: 'fill-neutral-500 dark:fill-neutral-700',
  R: 'fill-neutral-400 dark:fill-neutral-600',
  S: 'fill-neutral-600 dark:fill-neutral-800',
  // In the window: the sky (day, night), the city, its lit windows, the rain
  V: 'fill-primary-100 dark:fill-neutral-950',
  W: 'fill-neutral-300 dark:fill-neutral-800',
  X: 'fill-transparent dark:fill-yellow-500',
  Y: 'fill-blue-500/40',
  // Warm light (a candle, a screen's glow)
  K: 'fill-yellow-500/25',
  L: 'fill-yellow-500/12',
}

// The theme's colours the scenes use, as theme.css sets them (scripts/pixel-scenes.test.ts
// keeps the two in step)
export const THEME_HEX: Record<string, string> = {
  'blue-500': '#7ab8ff',
  'blue-600': '#5aa0e6',
  'cyan-500': '#8abfb8',
  'cyan-600': '#6fa39c',
  'green-500': '#86e89a',
  'green-600': '#6bc97f',
  'neutral-50': '#f5f5f5',
  'neutral-100': '#e0e0e0',
  'neutral-200': '#d0d0d0',
  'neutral-300': '#b0b0b0',
  'neutral-400': '#999999',
  'neutral-500': '#666666',
  'neutral-600': '#555555',
  'neutral-700': '#3a3a3a',
  'neutral-800': '#2a2a2a',
  'neutral-900': '#242424',
  'neutral-950': '#1a1a1a',
  'primary-100': '#fcf0e0',
  'primary-200': '#f8ddb8',
  'primary-300': '#f4c895',
  'primary-400': '#e8a573',
  'primary-500': '#d4825d',
  'primary-600': '#c15f3c',
  'primary-700': '#a64d2e',
  'primary-800': '#8b3d24',
  'primary-900': '#5c2f18',
  'primary-950': '#3d1f10',
  'purple-500': '#c79bff',
  'purple-600': '#a87ee0',
  'red-500': '#ff7a7a',
  'red-600': '#e06060',
  'yellow-500': '#ffdf61',
  'yellow-600': '#e6c654',
}

// A cell's colour on the dark theme, the OG images': [hex, opacity], or none
export function sceneColor(letter: string): [string, number] | undefined {
  const fill = SCENE_FILL[letter]
  if (!fill) return undefined
  const dark = fill.split(' ').find((c) => c.startsWith('dark:')) ?? fill.split(' ')[0]!
  const [name, alpha] = dark.replace('dark:', '').replace('fill-', '').split('/') as [
    string,
    string?,
  ]
  if (name === 'transparent') return undefined
  const hex =
    name === 'white' ? '#ffffff' : name.startsWith('[') ? name.slice(1, -1) : THEME_HEX[name]
  return hex ? [hex, alpha ? Number(alpha) / 100 : 1] : undefined
}

// The frame each scene shows in an OG image: its best moment
export const SCENE_OG_TICK: Record<PixelSceneName, number> = {
  climb: 56,
  terminal: 70,
  commits: 40,
  blog: 60,
  mail: 20,
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)
const bayer = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)]!

// Paints cells in order on the grid, the last one wins, then one rect per run of a colour on
// a row: a scene's thousands of cells come down to a few hundred rects. Translucent and
// mode-only cells (glow, stars) stay on top as they are.
function flatten(cells: Cell[]): Cell[] {
  const grid: (string | undefined)[] = Array.from({ length: SCENE_W * SCENE_H })
  const overlays: Cell[] = []
  for (const cell of cells) {
    const fill = SCENE_FILL[cell.c]!
    if (fill.includes('/') || fill.includes('transparent')) {
      overlays.push(cell)
      continue
    }
    const [x0, y0] = [Math.max(0, cell.x), Math.max(0, cell.y)]
    const x1 = Math.min(SCENE_W, cell.x + (cell.w ?? 1))
    const y1 = Math.min(SCENE_H, cell.y + (cell.h ?? 1))
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) grid[y * SCENE_W + x] = cell.c
  }
  const out: Cell[] = []
  for (let y = 0; y < SCENE_H; y++)
    for (let x = 0; x < SCENE_W;) {
      const c = grid[y * SCENE_W + x]
      let w = 1
      while (x + w < SCENE_W && grid[y * SCENE_W + x + w] === c) w++
      if (c) out.push({ x, y, w, h: 1, c })
      x += w
    }
  return [...out, ...overlays]
}

// A picture's cells at (x, y): one letter of SCENE_FILL per cell, `.` empty
function sprite(rows: string[], x: number, y: number, flip = false): Cell[] {
  return rows.flatMap((row, dy) => {
    const line = flip ? [...row].reverse() : [...row]
    return line.flatMap((ch, dx) =>
      SCENE_FILL[ch] ? [{ x: Math.round(x) + dx, y: Math.round(y) + dy, c: ch }] : [],
    )
  })
}
const box = (x: number, y: number, w: number, h: number, ch: string): Cell => ({
  x: Math.round(x),
  y: Math.round(y),
  w,
  h,
  c: ch,
})
// A round glow around (cx, cy), dithered out from `inner` to `outer`
function halo(cx: number, cy: number, r: number, inner: string, outer: string): Cell[] {
  const cells: Cell[] = []
  for (let y = Math.floor(cy - r); y <= cy + r; y++)
    for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const d = Math.hypot(x - cx, (y - cy) * 1.2) / r
      if (d > 1 || d > 0.55 + bayer(x, y) * 0.45) continue
      cells.push(box(x, y, 1, 1, d < 0.45 + bayer(x, y) * 0.2 ? inner : outer))
    }
  return cells
}
// A seeded random, so the still layers are the same on the server and the client
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 2 ** 32
  }
}
const tinted = (rows: string[], ch: string) => rows.map((row) => row.replaceAll('#', ch))
const STARS = (seed: number, n: number, maxY: number) => {
  const rand = seeded(seed)
  return Array.from({ length: n }, () => ({
    x: Math.floor(rand() * SCENE_W),
    y: Math.floor(rand() * maxY),
  }))
}
const CLOUD = ['...GGG......', '..GGGGG.GG..', '.GGGGGGGGGG.', 'GGGGGGGGGGGG', '.HHHHHHHHHH.']

// ── /experience — a crab climbs the trail to the flag at dusk, cheers in confetti on the
// summit, slides down the far side. Pines at the foot, birds crossing, clouds drifting.
const peak = (x: number) =>
  x <= 30 ? Math.round(12 + (30 - x) * 1.05) : Math.round(12 + (x - 30) * 0.95)
const back = (x: number) => Math.round(24 + Math.abs(x - 49) * 1.15)
// A mound of grass from x0 to x1, its top at y, tufts on it
function mound(x0: number, x1: number, y: number): Cell[] {
  const cells = [box(x0 + 1, y, x1 - x0 - 2, 1, 't'), box(x0, y + 1, x1 - x0, SCENE_H - y - 1, 'u')]
  for (let x = x0 + 2; x < x1 - 2; x += 3 + (x % 2))
    cells.push(box(x, y - 1, 1, 1, x % 3 ? 't' : 'u'))
  for (let x = x0 + 1; x < x1 - 1; x += 5) cells.push(box(x, y + 2 + (x % 2), 2, 1, 'n'))
  return cells
}
// The trail up the lit face: x of the crab's centre, its feet on the slope
const TRAIL = Array.from({ length: 22 }, (_, i) => 6 + i)
const CRAB = [
  [
    '.ss.......ss.',
    'srrs.....srrs',
    'sr.s.9.9.s.rs',
    '.ss..0.0..ss.',
    '..s.rrrrr.s..',
    '..rrrrrrrrr..',
    '.rrhrrrrrhrr.',
    '.srrrrrrrrrs.',
    's.s.s...s.s.s',
  ],
  [
    '.ss.......ss.',
    'srrs.....srrs',
    'sr.s.9.9.s.rs',
    '.ss..0.0..ss.',
    '..s.rrrrr.s..',
    '..rrrrrrrrr..',
    '.rrhrrrrrhrr.',
    '.srrrrrrrrrs.',
    '.s.s.s.s.s.s.',
  ],
]
const CHEER = [
  'ss.........ss',
  'rrs.......srr',
  'srs.9...9.srs',
  '.s..0...0..s.',
  '..s.rrrrr.s..',
  '..rrrrrrrrr..',
  '.rrhrrrrrhrr.',
  '.srrrrrrrrrs.',
  's.s.s...s.s.s',
]
const PINE = ['..u..', '.uuu.', '.unu.', 'uuuuu', '.unu.', 'uuunu', '..c..']
const climb: Scene = {
  still: flatten([
    ...sprite(['.OOO.', 'OOOOO', 'OOOQO', 'OOOOO', '.OOO.'], 54, 2),
    // A lower summit behind, on the right, then the mountain
    ...Array.from({ length: 26 }, (_, i) => {
      const x = 37 + i
      const top = back(x)
      return top < 44
        ? [
            box(x, top, 1, 44 - top, x <= 49 ? 'R' : 'S'),
            ...(top < 27 ? [box(x, top, 1, 2, '8')] : []),
          ]
        : []
    }).flat(),
    ...Array.from({ length: SCENE_W }, (_, x) => {
      const top = peak(x)
      if (top >= 44) return []
      const lit = x <= 30
      const cells = [box(x, top, 1, 44 - top, lit ? 'N' : 'P')]
      // Shade along the ridge, strata across the faces
      if (x === 30 || x === 31) cells.push(box(x, top, 1, 44 - top, 'R'))
      for (let y = top + 2; y < 44; y++)
        if ((x * 3 + y * 2) % 11 === 0) cells.push(box(x, y, 2, 1, lit ? 'R' : 'S'))
      // Snow, its shadow on the far face
      const snow = 19 + ((x * 5) % 3)
      if (top < snow) cells.push(box(x, top, 1, snow - top, lit ? '8' : '7'))
      return cells
    }).flat(),
    // The trail, dotted
    ...TRAIL.filter((_, i) => i % 2 === 0).map((x) => box(x + 1, peak(x + 1) + 1, 1, 1, 'h')),
    // Grass and pines at the foot
    ...mound(0, SCENE_W, 44),
    ...[1, 7, 40, 46, 52, 58].flatMap((x, i) => sprite(PINE, x, 37 + (i % 2))),
    box(30, 5, 1, 7, '3'),
  ]),
  ticks: 120,
  frame(tick) {
    const cells: Cell[] = []
    // Stars twinkle (dark), clouds drift, birds cross
    for (const [i, s] of STARS(7, 18, 24).entries())
      if (s.y < peak(s.x) - 1 && s.y < back(s.x) - 1)
        cells.push(box(s.x, s.y, 1, 1, (tick + i * 3) % 12 < 9 ? '*' : '+'))
    cells.push(
      ...sprite(CLOUD, 70 - ((tick >> 1) % 84), 8),
      ...sprite(CLOUD, 70 - (((tick >> 1) + 42) % 84), 17),
    )
    const bx = 66 - ((tick * 0.7) % 90)
    for (const [dx, dy] of [
      [0, 0],
      [4, 2],
      [8, 1],
    ])
      cells.push(...sprite(tick % 4 < 2 ? ['2.2', '.2.'] : ['...', '222'], bx + dx!, 4 + dy!))
    // The flag
    cells.push(
      ...sprite(
        [
          ['ffff', 'fee.'],
          ['fff.', 'feee'],
          ['ffff', '.eee'],
        ][(tick >> 1) % 3]!,
        31,
        5,
      ),
    )
    if (tick < 44) {
      // Up the trail, a cell every two ticks
      const x = TRAIL[Math.min(TRAIL.length - 1, tick >> 1)]!
      cells.push(...sprite(CRAB[tick % 2]!, x - 6, peak(x + 3) - 8))
    } else if (tick < 72) {
      // On the summit: claws up, hops, confetti
      const hop = [0, 1, 2, 1][tick % 4]!
      cells.push(...sprite(tick % 4 < 2 ? CHEER : CRAB[0]!, 24, peak(30) - 9 - hop))
      const rand = seeded(tick >> 2)
      for (let k = 0; k < 10; k++)
        cells.push(
          box(18 + rand() * 26, 2 + ((rand() * 10 + (tick % 4) * 2) % 12), 1, 1, 'rvxzlf'[k % 6]!),
        )
    } else {
      // Down the far side, fast
      const x = 31 + Math.round((tick - 72) * 0.8)
      cells.push(...sprite(CRAB[tick % 2]!, x - 6, peak(x + 3) - 8))
    }
    return cells
  },
}

// ── /apps — an invader sits on the monitor while gwm's commands type themselves, keys
// lighting up; the screen's glow on the desk, gwm's logo on the wall
const SQUID_SHADED = (rows: string[]) => rows.map((r) => r.replaceAll('#', 'z'))
const LINES: [string, number][][] = [
  [
    ['f', 1],
    ['9', 3],
    ['l', 6],
    ['7', 8],
  ],
  [
    ['t', 1],
    ['7', 12],
  ],
  [
    ['f', 1],
    ['9', 3],
    ['l', 4],
    ['x', 9],
  ],
  [
    ['t', 1],
    ['v', 5],
    ['7', 6],
  ],
  [
    ['f', 1],
    ['9', 3],
    ['z', 7],
  ],
  [
    ['t', 1],
    ['t', 3],
    ['7', 10],
  ],
]
const terminal: Scene = {
  still: flatten([
    // gwm's logo, framed
    box(5, 5, 14, 14, 'c'),
    box(6, 6, 12, 12, '9'),
    ...sprite(
      [
        'xx......',
        'xx......',
        '.3......',
        '.3333t..',
        '.3...tt.',
        '.3......',
        '.3333f..',
        '......ff',
      ],
      8,
      8,
    ),
    // The desk
    box(1, 36, 62, 3, 'd'),
    box(1, 36, 62, 1, 'e'),
    box(2, 39, 60, 3, 'c'),
    ...Array.from({ length: 8 }, (_, i) => box(5 + i * 7, 40, 4, 1, 'b')),
    box(4, 42, 3, 6, 'c'),
    box(57, 42, 3, 6, 'c'),
    // The monitor: bezel, screen, stand
    box(22, 8, 38, 24, '3'),
    box(22, 8, 38, 1, '5'),
    box(24, 10, 34, 20, '0'),
    box(38, 32, 6, 3, '4'),
    box(34, 35, 14, 1, '4'),
    // Scanlines
    ...Array.from({ length: 10 }, (_, i) => box(24, 10 + i * 2, 34, 1, '1')),
    // The keyboard
    box(8, 33, 22, 3, '4'),
    ...Array.from({ length: 10 }, (_, i) => box(9 + i * 2, 34, 1, 1, '6')),
    // A mug
    box(52, 31, 4, 5, 'x'),
    box(56, 32, 1, 2, 'x'),
    box(52, 31, 4, 1, 'y'),
  ]),
  ticks: 120,
  frame(tick) {
    const cells: Cell[] = []
    // Lines type a cell a tick, one after the other, then the screen clears
    let left = tick
    LINES.forEach((tokens, row) => {
      let x = 26
      for (const [ch, length] of tokens) {
        if (left <= 0) return
        const shown = Math.min(length, left)
        cells.push(box(x, 12 + row * 3, shown, 1, ch))
        if (shown < length) {
          cells.push(box(x + shown, 12 + row * 3, 1, 1, tick % 4 < 2 ? '9' : '0'))
          left = 0
          return
        }
        left -= length
        x += length + 1
      }
      left -= 4
    })
    if (left > 0 && tick % 6 < 3) cells.push(box(26, 12 + LINES.length * 3, 1, 1, 'f'))
    // A key lights up with each cell typed
    if (left <= 0) cells.push(box(9 + ((tick * 7) % 10) * 2, 34, 1, 1, 'g'))
    // Steam
    cells.push(...sprite(tick % 6 < 3 ? ['.7.', '7..', '.7.'] : ['7..', '.7.', '7..'], 53, 27))
    // The invader on the monitor, its legs swinging, blinking now and then
    const [a, b] = INVADERS[0]!
    const legs = (tick >> 2) % 2 ? b : a
    const squid = SQUID_SHADED(legs)
    if (tick % 40 < 2) squid[3] = squid[3]!.replaceAll('.', 'z')
    cells.push(...sprite(squid, 36, 0))
    return cells
  },
}

// ── /activity — an invader commits: it runs over a contribution graph and drops a block that
// falls and raises a cell a level; a full graph flashes, confetti, and it starts again
const COLS = 13
const ROWS = 5
const LEVEL = ['3', 'n', 'o', 'u', 't'] as const
const START = [
  1, 0, 2, 3, 1, 0, 2, 4, 1, 2, 0, 3, 1, 0, 2, 1, 3, 2, 0, 1, 4, 2, 1, 0, 3, 2, 1, 0, 2, 1, 3, 1, 2,
  0, 1, 2, 4, 1, 0, 2, 1, 3, 2, 1, 0, 2, 1, 0, 3, 2, 1, 2, 0, 1, 3, 1, 2, 0, 1, 2, 2, 1, 0, 3, 1,
]
const cellX = (col: number) => 5 + col * 4
const cellY = (row: number) => 21 + row * 4
const DROPS = (() => {
  const levels = START.slice(0, COLS * ROWS)
  const drops: {
    col: number
    row: number
    from: number
    start: number
    walk: number
    fall: number
  }[] = []
  let at = 6
  let tick = 4
  for (let k = 0; k < 18; k++) {
    let cell = (k * 23 + 7) % (COLS * ROWS)
    while (levels[cell]! >= 4) cell = (cell + 1) % (COLS * ROWS)
    levels[cell]!++
    const col = cell % COLS
    const row = Math.floor(cell / COLS)
    const drop = {
      col,
      row,
      from: at,
      start: tick,
      walk: Math.abs(col - at) * 2,
      fall: Math.ceil((cellY(row) - 15) / 3),
    }
    drops.push(drop)
    tick += drop.walk + drop.fall + 3
    at = col
  }
  return { drops, end: tick }
})()
const commits: Scene = {
  still: flatten([
    // The card
    box(2, 13, 60, 33, '2'),
    box(3, 14, 58, 31, '1'),
    box(3, 14, 58, 1, '3'),
    // Month marks and weekday ticks
    ...Array.from({ length: 4 }, (_, i) => box(6 + i * 14, 17, 4, 1, '5')),
    ...[0, 2, 4].map((r) => box(3, cellY(r) + 1, 1, 1, '5')),
    // The legend: less → more
    ...LEVEL.map((ch, i) => box(38 + i * 4, 42, 3, 1, ch)),
  ]),
  ticks: DROPS.end + 20,
  frame(tick) {
    const levels = START.slice(0, COLS * ROWS)
    let current: (typeof DROPS.drops)[number] | undefined
    let rest = 6
    for (const drop of DROPS.drops) {
      if (tick >= drop.start + drop.walk + drop.fall) levels[drop.row * COLS + drop.col]!++
      if (tick >= drop.start) {
        current = drop
        rest = drop.col
      }
    }
    const done = tick >= DROPS.end
    const cells: Cell[] = []
    levels.forEach((level, i) => {
      const ch = done && (tick + (i % COLS)) % 6 < 2 ? 't' : LEVEL[Math.min(4, level)]!
      cells.push(box(cellX(i % COLS), cellY(Math.floor(i / COLS)), 3, 3, ch))
    })
    let at = rest
    let walking = false
    if (current && !done) {
      const t = tick - current.start
      if (t < current.walk) {
        at = current.from + ((current.col - current.from) * t) / current.walk
        walking = true
      } else if (t < current.walk + current.fall)
        cells.push(box(cellX(current.col), 15 + (t - current.walk) * 3, 3, 3, 't'))
      else {
        // Landed: the cell flashes, +1 rises
        cells.push(box(cellX(current.col), cellY(current.row), 3, 3, '9'))
        const up = t - current.walk - current.fall
        cells.push(
          ...sprite(
            ['.t...t.', 'ttt.tt.', '.t...t.'],
            cellX(current.col) - 2,
            cellY(current.row) - 5 - up,
          ),
        )
      }
    }
    if (done) {
      const rand = seeded(tick >> 1)
      for (let k = 0; k < 14; k++)
        cells.push(box(4 + rand() * 56, 2 + rand() * 40, 1, 1, 'rvxzlft'[k % 7]!))
    }
    const [a, b] = INVADERS[0]!
    const hop = done ? [0, 1, 2, 1][tick % 4]! : 0
    cells.push(...sprite(tinted(walking && tick % 2 ? b : a, 'z'), cellX(at) - 2.5, 3 - hop))
    return cells
  },
}

// ── /blog — a writing nook at night, after Kirokaze's and Waneella's rooms: rain on the
// window over a city with its lights, the laptop typing the article, then publishing it as a
// paper plane out of the window; the lamp's glow, a cat asleep on the books, its tail beating
// A ginger tabby curled up asleep: ears, stripes, closed eyes, white muzzle; it breathes
const CAT = [
  [
    '...........e...e.',
    '..........egg.egg',
    '...eggeggegggggg.',
    '..gggggggggekgekg',
    '.ggegggeggggg99g.',
    '.gggggggggggggg..',
    '..eeeeeeeeeeee...',
  ],
  [
    '...........e...e.',
    '..........egg.egg',
    '..geggeggegggggg.',
    '.ggggggggggekgekg',
    '.ggegggeggggg99g.',
    '.gggggggggggggg..',
    '..eeeeeeeeeeee...',
  ],
]
const TAIL = [
  ['g...', 'g...', '.gg.'],
  ['.g..', 'g...', '.gg.'],
  ['..g.', '.g..', '.gg.'],
]
const PLANE = ['9......', '899....', '.88999.', '..8888.', '...8...']
// The article's lines on the screen: colour, length
const ARTICLE: [string, number][] = [
  ['f', 9],
  ['7', 14],
  ['7', 12],
  ['7', 15],
  ['x', 6],
  ['7', 13],
]
const SKYLINE = [3, 6, 4, 8, 5, 7, 3, 6, 9, 4, 5, 7, 6, 3, 8, 5, 4, 6, 7, 5, 3]
const nook: Scene = {
  still: flatten([
    // The window: its frame, the night (or the day) in it, the city's skyline, the sill
    box(2, 1, 24, 21, 'c'),
    box(4, 3, 20, 17, 'V'),
    ...SKYLINE.slice(0, 20).map((h, i) => box(4 + i, 20 - h, 1, h, 'W')),
    box(13, 3, 2, 17, 'c'),
    box(4, 11, 20, 1, 'c'),
    box(1, 21, 26, 2, 'd'),
    // The desk on its legs
    box(16, 36, 47, 2, 'e'),
    box(17, 38, 45, 3, 'd'),
    box(17, 38, 45, 1, 'c'),
    box(19, 41, 3, 7, 'c'),
    box(57, 41, 3, 7, 'c'),
    // The pile of books under the cat
    box(17, 32, 16, 4, 'y'),
    box(18, 33, 14, 1, '8'),
    box(18, 29, 14, 3, 'z'),
    box(19, 30, 12, 1, '8'),
    // The laptop: lid with its screen, base
    box(34, 21, 18, 13, '3'),
    box(35, 22, 16, 11, '0'),
    box(32, 34, 22, 2, '4'),
    box(32, 34, 22, 1, '6'),
    // The lamp at the end of the desk: base, arm, head
    box(56, 34, 6, 2, '3'),
    box(60, 22, 1, 12, '3'),
    box(57, 20, 4, 1, '3'),
    ...sprite(['.555.', '55555'], 54, 19),
    // A plant on the sill
    ...sprite(['.t.t.', 'tutut', '.utu.', 'eeeee', '.eee.', '.eee.'], 20, 15),
  ]),
  ticks: 120,
  frame(tick) {
    const cells: Cell[] = []
    // Lights come on and off in the city, rain falls across the window
    const rand = seeded(9)
    for (let k = 0; k < 10; k++) {
      const i = Math.floor(rand() * 20)
      const y = 20 - Math.floor(rand() * (SKYLINE[i]! - 1)) - 1
      if ((tick + k * 13) % 40 < 30) cells.push(box(4 + i, y, 1, 1, 'X'))
    }
    for (let k = 0; k < 9; k++) {
      const x = 4 + ((k * 7 + tick) % 20)
      const y = 3 + ((k * 11 + tick * 2) % 16)
      cells.push(box(x, y, 1, 2, 'Y'))
    }
    // The lamp's glow on the desk
    cells.push(...halo(56.5, 30, tick % 13 === 0 ? 6 : 7, 'K', 'L'))
    // The article types itself; done, it goes out of the window as a paper plane
    let left = tick
    ARTICLE.forEach(([ch, length], row) => {
      if (left <= 0) return
      const shown = Math.min(length, left)
      cells.push(box(37, 24 + row * 1.5, shown, 1, ch))
      if (shown < length && tick % 4 < 2) cells.push(box(37 + shown, 24 + row * 1.5, 1, 1, '9'))
      left -= length + 2
    })
    if (left > 0) {
      const t = left
      if (t < 30)
        cells.push(...sprite(PLANE, 40 - t * 1.2, 18 - t * 0.35 - Math.sin(t / 3) * 1.5, true))
    }
    // The cat breathes, its tail beats
    cells.push(...sprite(CAT[(tick >> 3) % 2]!, 16, 22))
    cells.push(...sprite(TAIL[(tick >> 2) % 3]!, 14, 25))
    // A sleepy z now and then
    const z = tick % 40
    if (z < 16) cells.push(...sprite(['777', '.7.', '777'], 31 + (z >> 3), 19 - (z >> 2)))
    return cells
  },
}

// ── /contact — a bird flies a letter over the hills to the mailbox; the flag goes up, hearts
// rise, the bird flies off
const FLY = [
  ['..xx......', '...xx.....', '.yxxxx9v..', 'yxxxxxx0vv', '.yxx99x...', '..yyyy....'],
  ['..........', '..........', '.yxxxx9v..', 'yxxxxxx0vv', '.yxx99x...', '..yxx.....'],
  ['..........', '...yy.....', '.yxxxx9v..', 'yxxxxxx0vv', '.yxx99x...', '...yxx....'],
]
const LETTER = ['7777777777', '7899999987', '7989999897', '7998998997', '7999rr9997', '7777777777']
const HEART = ['r.r', 'rrr', '.r.']
const mail: Scene = {
  still: flatten([
    ...sprite(['.OOO.', 'OOOOO', 'OOOQO', 'OOOOO', '.OOO.'], 6, 3),
    ...mound(24, SCENE_W, 43),
    // Flowers
    ...[27, 33, 52, 58].flatMap((x, i) =>
      sprite([i % 2 ? '.r.' : '.v.', i % 2 ? 'rvr' : 'vrv', '.u.'], x, 40),
    ),
    // The mailbox: post, box with its shading and slot
    box(44, 28, 3, 16, 'd'),
    box(44, 28, 1, 16, 'e'),
    // Its arched top, a highlight along it, the door with its slot and handle
    box(39, 17, 13, 1, 'r'),
    box(38, 18, 15, 10, 's'),
    box(39, 18, 13, 2, 'r'),
    box(40, 18, 6, 1, 'h'),
    box(38, 27, 15, 1, 'd'),
    box(40, 21, 11, 5, 'r'),
    box(41, 22, 9, 1, '1'),
    box(48, 24, 2, 1, '7'),
  ]),
  ticks: 96,
  frame(tick) {
    const cells: Cell[] = []
    for (const [i, s] of STARS(11, 12, 18).entries())
      cells.push(box(s.x, s.y, 1, 1, (tick + i * 5) % 14 < 10 ? '*' : '+'))
    cells.push(...sprite(CLOUD, 72 - ((tick >> 2) % 86), 9))
    const posted = tick >= 40
    // The flag: down, then up once the letter is in
    cells.push(
      ...(posted
        ? [box(54, 12, 1, 8, '3'), box(55, 12, 4, 3, 'v')]
        : [box(53, 21, 7, 1, '3'), box(57, 19, 3, 2, 'v')]),
    )
    const wings = FLY[tick % 3]!
    if (tick < 32) {
      const x = -12 + tick * 1.3
      const y = 12 + Math.sin(tick / 2) * 1.5
      cells.push(...sprite(wings, x, y), ...sprite(LETTER, x, y + 6))
    } else if (tick < 40) {
      const d = tick - 32
      cells.push(...sprite(wings, 30, 13))
      if (d < 6) cells.push(...sprite(LETTER, 30 + d * 1.6, 18 + Math.min(4, d)))
    } else if (tick < 70) {
      const t = tick - 40
      cells.push(...sprite(wings, 30 - t * 1.6, 13 - t * 0.5, true))
      // Hearts rise from the box
      for (let k = 0; k < 3; k++) {
        const up = (t - k * 5) * 0.6
        if (up > 0 && up < 14) cells.push(...sprite(HEART, 42 + k * 4, 16 - up))
      }
    }
    return cells
  },
}

// Each frame flattened as well: what moves comes down to runs too
const flat = (scene: Scene): Scene => ({ ...scene, frame: (tick) => flatten(scene.frame(tick)) })

export const PIXEL_SCENES = {
  climb: flat(climb),
  terminal: flat(terminal),
  commits: flat(commits),
  blog: flat(nook),
  mail: flat(mail),
} satisfies Record<string, Scene>
export type PixelSceneName = keyof typeof PIXEL_SCENES
