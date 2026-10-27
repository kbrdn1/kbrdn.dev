// The pages' hero scenes (UiPixelScene): small pixel-art loops in the theme's palette, one per
// page — a crab climbing a mountain (/experience), an invader on a terminal (/apps), an
// invader filling a contribution graph (/activity), a bird reading (/blog), a bird posting a
// letter (/contact).
// A scene is a grid of SCENE_W × SCENE_H cells: what never moves, then what a tick
// (SCENE_TICK ms) draws.
import { INVADERS } from './invaders'

export const SCENE_W = 48
export const SCENE_H = 36
export const SCENE_TICK = 125

interface Cell {
  x: number
  y: number
  w?: number
  h?: number
  /** A fill class of PALETTE */
  c: string
}
interface Scene {
  still: Cell[]
  /** The scene loops every `ticks` */
  ticks: number
  frame: (tick: number) => Cell[]
}

// The theme's palette (theme.css): its 600 on light, its 500 on dark, greys that read on both
const PALETTE: Record<string, string> = {
  o: 'fill-primary-600 dark:fill-primary-500',
  O: 'fill-primary-300 dark:fill-primary-400',
  W: 'fill-primary-800 dark:fill-primary-700',
  d: 'fill-neutral-700 dark:fill-neutral-500',
  g: 'fill-neutral-400 dark:fill-neutral-600',
  l: 'fill-neutral-300 dark:fill-neutral-700',
  C: 'fill-neutral-200 dark:fill-neutral-800',
  w: 'fill-neutral-50 dark:fill-neutral-200',
  // Paper and snow: still a shade off the page's background on light
  P: 'fill-neutral-200 dark:fill-neutral-200',
  n: 'fill-primary-900 dark:fill-primary-800',
  // Rocks on the mountain's shadowed side
  R: 'fill-neutral-300 dark:fill-neutral-500',
  k: 'fill-neutral-900 dark:fill-neutral-950',
  y: 'fill-yellow-600 dark:fill-yellow-500',
  r: 'fill-red-600 dark:fill-red-500',
  G: 'fill-green-600 dark:fill-green-500',
  b: 'fill-blue-600 dark:fill-blue-500',
  p: 'fill-purple-600 dark:fill-purple-500',
  c: 'fill-cyan-600 dark:fill-cyan-500',
}

// A picture's cells at (x, y): one letter of PALETTE per cell, `.` empty
function sprite(rows: string[], x: number, y: number): Cell[] {
  return rows.flatMap((row, dy) =>
    [...row].flatMap((ch, dx) => (PALETTE[ch] ? [{ x: x + dx, y: y + dy, c: PALETTE[ch]! }] : [])),
  )
}
const box = (x: number, y: number, w: number, h: number, ch: string): Cell => ({
  x,
  y,
  w,
  h,
  c: PALETTE[ch]!,
})
// An invader of utils/invaders in a colour of PALETTE
const tinted = (rows: string[], ch: string) => rows.map((row) => row.replaceAll('#', ch))

// /experience — a crab climbs the mountain to its flag, cheers on the summit, slides down
// the other side. The mountain is lit on its left, a lighter one stands behind.
const ridge = (x0: number, top: number, left: number, right: number) => (x: number) =>
  top + Math.round(x <= x0 ? (x0 - x) * left : (x - x0) * right)
// The summit low enough for the crab to cheer on it, hops included
const main = ridge(20, 12, 1.15, 0.95)
const back = ridge(37, 18, 1.05, 0.9)
const CRAB = [
  [
    '.r.......r.',
    'rrr.....rrr',
    '.r..k.k..r.',
    '..r.r.r.r..',
    '..rrrrrrr..',
    '.rrrrrrrrr.',
    'r.r.r.r.r.r',
  ],
  [
    '.r.......r.',
    'rrr.....rrr',
    '.r..k.k..r.',
    '..r.r.r.r..',
    '..rrrrrrr..',
    '.rrrrrrrrr.',
    '.r.r.r.r.r.',
  ],
]
const CHEER = [
  'rrr.....rrr',
  '.r.......r.',
  '.r..k.k..r.',
  '..r.r.r.r..',
  '..rrrrrrr..',
  '.rrrrrrrrr.',
  'r.r.r.r.r.r',
]
const CLOUD = ['..PPP...', '.PPPPPP.', 'PPPPPPPP']
const FLAG = [
  ['ooo', 'oo.'],
  ['oo.', 'ooo'],
  ['ooo', '.oo'],
]
const climb: Scene = {
  still: [
    ...sprite(['.yy.', 'yyyy', 'yyyy', '.yy.'], 4, 3),
    // Behind: the lighter mountain, its snow
    ...Array.from({ length: SCENE_W }, (_, x) =>
      back(x) < 35
        ? [
            box(x, back(x), 1, 35 - back(x), 'C'),
            ...(back(x) < 17 ? [box(x, back(x), 1, 2, 'P')] : []),
          ]
        : [],
    ).flat(),
    // The mountain: lit and shadowed sides, a jagged snow line, rocks
    ...Array.from({ length: SCENE_W }, (_, x) => {
      const top = main(x)
      if (top >= 35) return []
      const snow = 14 + ((x * 7) % 3)
      const cells = [box(x, top, 1, 35 - top, x <= 20 ? 'l' : 'g')]
      if (top < snow) cells.push(box(x, top, 1, snow - top, 'P'))
      for (let y = Math.max(top, snow) + 1; y < 35; y++)
        if ((x * 13 + y * 7) % 17 === 0) cells.push(box(x, y, 1, 1, x <= 20 ? 'g' : 'R'))
      return cells
    }).flat(),
    box(0, 35, SCENE_W, 1, 'G'),
    box(20, 6, 1, 6, 'd'),
  ],
  ticks: 96,
  frame(tick) {
    const cells = [
      ...sprite(FLAG[(tick >> 1) % 3]!, 21, 6),
      ...sprite(CLOUD, 50 - ((tick >> 1) % 60), 9),
      ...sprite(CLOUD, 50 - (((tick >> 1) + 34) % 60), 16),
      // A bird crossing the sky, flapping
      ...sprite(tick % 4 < 2 ? ['d.d', '.d.'] : ['...', 'ddd'], 48 - (tick % 96) * 0.6, 4),
    ]
    if (tick < 40) {
      // Up the lit side, half a cell a tick
      const x = -6 + Math.floor(tick / 2)
      cells.push(...sprite(CRAB[tick % 2]!, x, main(x + 8) - 6))
    } else if (tick < 64) {
      // On the summit: claws up, hops, sparkles
      const hop = [0, 1, 2, 1][(tick - 40) % 4]!
      cells.push(...sprite(tick % 4 < 2 ? CHEER : CRAB[0]!, 15, main(20) - 7 - hop))
      if (tick % 4 < 2)
        cells.push(...sprite(['.y.', 'y.y', '.y.'], 11, 5), ...sprite(['.y.', 'y.y', '.y.'], 27, 6))
    } else {
      // Down the shadowed side, fast
      const x = 15 + Math.round((tick - 64) * 1.2)
      cells.push(...sprite(CRAB[tick % 2]!, x, main(x + 2) - 6))
    }
    return cells
  },
}

// /apps — an invader sits on a terminal while its lines type themselves
const LINES = [
  ['G', 9],
  ['w', 14],
  ['b', 6],
  ['w', 18],
  ['o', 11],
  ['G', 16],
  ['w', 8],
] as const
const terminal: Scene = {
  still: [box(6, 10, 37, 23, 'd'), box(7, 13, 35, 19, 'k'), ...sprite(['r.y.G'], 8, 11)],
  ticks: 112,
  frame(tick) {
    const cells: Cell[] = []
    // Each line types a cell a tick after the one before it
    let left = tick
    LINES.forEach(([ch, length], i) => {
      if (left <= 0) return
      const shown = Math.min(length, left)
      cells.push(box(9, 15 + i * 2, 1, 1, 'o'), box(11, 15 + i * 2, shown, 1, ch))
      if (shown < length) cells.push(box(11 + shown, 15 + i * 2, 1, 1, 'w'))
      left -= length + 2
    })
    // Done: the cursor blinks on a new prompt until the screen clears
    if (left > 0 && tick % 4 < 2) cells.push(box(9, 15 + LINES.length * 2 - 1, 1, 1, 'o'))
    const [a, b] = INVADERS[0]!
    cells.push(...sprite(tinted((tick >> 2) % 2 ? b : a, 'p'), 30, 2))
    return cells
  },
}

// /activity — an invader commits: it runs over a contribution graph and drops a block into a
// column, which falls and lights the first empty cell; once the graph is full it flashes, the
// invader hops for joy, and it starts again
const COLS = 11
const ROWS = 4
const START = [2, 1, 3, 0, 2, 1, 2, 3, 1, 0, 2]
const cellX = (col: number) => 3 + col * 4
// Row 0 at the bottom
const cellY = (row: number) => 19 + (ROWS - 1 - row) * 4
// The drops, worked out once: the column, where the invader comes from, when it sets off, how
// long it walks (two ticks a column) and how long the block falls (four cells a tick)
const DROPS = (() => {
  const heights = [...START]
  const drops: {
    col: number
    from: number
    start: number
    walk: number
    fall: number
    row: number
  }[] = []
  let at = 0
  let tick = 4
  for (let k = 0; heights.some((h) => h < ROWS); k++) {
    let col = (k * 7 + 3) % COLS
    while (heights[col]! >= ROWS) col = (col + 1) % COLS
    const row = heights[col]!++
    const drop = {
      col,
      from: at,
      start: tick,
      walk: Math.abs(col - at) * 2,
      fall: Math.ceil((cellY(row) - 14) / 4),
      row,
    }
    drops.push(drop)
    tick += drop.walk + drop.fall + 3
    at = col
  }
  return { drops, end: tick }
})()
const commits: Scene = {
  still: [box(1, 35, 46, 1, 'g')],
  ticks: DROPS.end + 16,
  frame(tick) {
    const heights = [...START]
    let current: (typeof DROPS.drops)[number] | undefined
    let rest = 0
    for (const drop of DROPS.drops) {
      if (tick >= drop.start + drop.walk + drop.fall) heights[drop.col]!++
      if (tick >= drop.start) {
        current = drop
        rest = drop.col
      }
    }
    const done = tick >= DROPS.end
    const flash = done && tick % 4 < 2
    const cells: Cell[] = []
    for (let col = 0; col < COLS; col++)
      for (let row = 0; row < ROWS; row++)
        cells.push(
          box(cellX(col), cellY(row), 3, 3, row < heights[col]! ? (flash ? 'P' : 'G') : 'C'),
        )
    // Where the invader stands (in columns), walking or not, and the block on its way down
    let at = rest
    let walking = false
    if (current && !done) {
      const t = tick - current.start
      if (t < current.walk) {
        at = current.from + ((current.col - current.from) * t) / current.walk
        walking = true
      } else if (t < current.walk + current.fall)
        cells.push(box(cellX(current.col), 14 + (t - current.walk) * 4, 3, 3, 'G'))
      else {
        // Just landed: the cell flashes, a sparkle above it
        cells.push(box(cellX(current.col), cellY(current.row), 3, 3, 'P'))
        cells.push(...sprite(['.y.', 'yyy', '.y.'], cellX(current.col), cellY(current.row) - 4))
      }
    }
    const [a, b] = INVADERS[0]!
    const hop = done ? [0, 1, 2, 1][tick % 4]! : 0
    cells.push(
      ...sprite(tinted(walking && tick % 2 ? b : a, 'p'), Math.round(cellX(at) - 2.5), 5 - hop),
    )
    return cells
  },
}

// /blog — a canary in glasses reads in its armchair, line after line, and turns the page;
// the lamp flickers, a pile of books waits on the floor
const CANARY = [
  '....yyyy.....',
  '..yyyyyyy....',
  '.yyyyyyyddd..',
  '.yyyddddPkd..',
  '.yyyyyydPPdoo',
  '.yyyyyyyddd..',
  '.yyyyyyyyy...',
  'yyyOOOOyyy...',
  'yyOOOOOOyy...',
  'yyyOOOOyyy...',
  '.yyyyyyyy....',
  '..yyyyyy.....',
]
const OPEN = [
  'PPPPP.PPPPP',
  'PgggPdPgggP',
  'PPPPPdPPPPP',
  'PggPPdPggPP',
  'PPPPPdPPPPP',
  'rrrrrrrrrrr',
]
const read: Scene = {
  still: [
    box(0, 35, SCENE_W, 1, 'C'),
    // The armchair
    box(5, 12, 3, 1, 'b'),
    box(4, 13, 5, 16, 'b'),
    box(4, 29, 20, 3, 'b'),
    box(9, 26, 13, 3, 'c'),
    box(5, 32, 2, 3, 'n'),
    box(21, 32, 2, 3, 'n'),
    // The lamp
    ...sprite(['...ooo...', '..ooooo..', '.ooooooo.', 'ooooooooo'], 37, 3),
    box(41, 7, 1, 27, 'd'),
    box(38, 34, 7, 1, 'd'),
    // Books on the floor
    box(28, 32, 9, 3, 'G'),
    box(29, 33, 8, 1, 'P'),
    box(29, 29, 8, 3, 'p'),
    box(30, 30, 7, 1, 'P'),
    box(28, 27, 9, 2, 'r'),
    box(29, 27, 8, 1, 'P'),
  ],
  ticks: 64,
  frame(tick) {
    // Its head goes down a line every 8 ticks, back up with the page
    const line = Math.min(3, (tick % 32) >> 3)
    const turning = tick % 32 >= 28
    const cells = [
      ...sprite(CANARY, 9, 13 + (line > 1 ? 1 : 0)),
      // The armrest in front of it
      box(19, 21, 5, 1, 'c'),
      box(19, 22, 5, 7, 'b'),
      ...sprite(OPEN, 21, 15),
      // Its wing holds the book, or turns the page
      ...(turning ? [box(26, 13, 1, 7, 'P'), box(25, 19, 2, 1, 'O')] : [box(19, 19, 3, 2, 'O')]),
    ]
    // The line it reads, marked
    if (!turning) cells.push(box(22 + (tick % 8 < 4 ? 0 : 6), 16 + line, 3, 1, 'o'))
    // The lamp's light, now and then a flicker
    if (tick % 23 !== 0) cells.push(box(38, 7, 7, 1, 'y'))
    return cells
  },
}

// /contact — a bird flies a letter to the mailbox; the flag goes up, the bird flies off
const FLY = [
  ['.bb.......', '..bbcccc..', '.cccccckyy', 'cccccccc..', '.cccccc...'],
  ['..........', '....cccc..', '.cccccckyy', 'ccbbbccc..', '..bbb.....'],
]
const LETTER = ['PPPPPP', 'PgPPgP', 'PPggPP', 'PPPPPP']
const mail: Scene = {
  still: [
    box(36, 22, 2, 13, 'W'),
    box(30, 13, 13, 9, 'r'),
    box(32, 16, 8, 1, 'k'),
    box(0, 35, SCENE_W, 1, 'g'),
  ],
  ticks: 72,
  frame(tick) {
    const wings = FLY[tick % 2]!
    const cells: Cell[] = []
    const posted = tick >= 30
    // The flag: down, then up once the letter is in
    cells.push(
      ...(posted ? [box(43, 9, 1, 6, 'y'), box(44, 9, 2, 2, 'y')] : [box(43, 14, 5, 1, 'y')]),
    )
    if (tick < 24) {
      // In from the left, bobbing, the letter in its feet
      const x = -10 + tick * 1.5
      const y = 10 + (tick % 4 < 2 ? 0 : 1)
      cells.push(...sprite(wings, Math.round(x), y), ...sprite(LETTER, Math.round(x) + 2, y + 5))
    } else if (tick < 30) {
      // The letter slides into the slot
      cells.push(...sprite(wings, 26, 9))
      const drop = tick - 24
      if (drop < 4) cells.push(...sprite(LETTER, 28 + drop, 14 + Math.min(2, drop)))
    } else if (tick < 52) {
      // Off it goes, up and away
      const t = tick - 30
      cells.push(...sprite(wings, 26 - t * 2, 9 - Math.floor(t / 2)))
    }
    return cells
  },
}

export const PIXEL_SCENES = { climb, terminal, commits, read, mail } satisfies Record<string, Scene>
export type PixelSceneName = keyof typeof PIXEL_SCENES
