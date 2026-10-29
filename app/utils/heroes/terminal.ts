// /apps: an invader sits on the monitor swinging its legs while gwm runs in the terminal. A
// command types itself, keys lighting up, a new worktree joins the list, the selection bar
// walks down to it, it turns dirty and clean again; a second command removes it and the bar
// walks back up. Coffee steams by the keyboard, the screen's glow spills on the desk, gwm's
// logo hangs on the wall.
import { INVADERS } from '../invaders'
import {
  ease,
  hop,
  mix,
  outlineOf,
  PAL,
  rand,
  Raster,
  shades,
  smooth,
  type Rgb,
  type Tones,
} from '../cameos/art'
import { type Hero, phase } from './hero'

const W = 128
const H = 96
const PERIOD = 12000

// The monitor's casing, and its screen inside the bezel
const CX = 37
const CY = 16
const CW = 82
const CH = 48
const SX = 42
const SY = 23
const SW = 72
const SH = 36
// The keyboard and the mug, on the desk
const KX = 48
const KY = 73
const MX = 15
const MY = 66
// Where the invader sits: the middle of its feet, on the casing's top
const IX = 100

const LOOK = {
  light: {
    top: shades('#c9996b', 0.2, 0.3),
    front: shades('#9c6b45', 0.25, 0.2),
    leg: shades('#875a3a', 0.25, 0.25),
    casing: shades('#ddd6ca', 0.22, 0.6),
    neck: shades('#b3ab9e', 0.25, 0.3),
    kbd: shades('#55555b', 0.3, 0.3),
    key: shades('#efeae2', 0.14, 0.6),
    mug: shades(PAL.orange, 0.28, 0.35),
    frame: shades('#8f5f3a', 0.3, 0.3),
    glow: '#e2f3ff',
    steam: '#aba297',
    string: '#7d7267',
  },
  dark: {
    top: shades('#7d573b', 0.25, 0.25),
    front: shades('#5b3e2a', 0.25, 0.2),
    leg: shades('#4d3424', 0.25, 0.25),
    casing: shades('#85807a', 0.3, 0.35),
    neck: shades('#5f5b56', 0.3, 0.3),
    kbd: shades('#2e2e33', 0.3, 0.3),
    key: shades('#a19c95', 0.2, 0.35),
    mug: shades(PAL.orange, 0.3, 0.3),
    frame: shades('#6b4830', 0.3, 0.3),
    glow: '#8fc8ff',
    steam: '#767676',
    string: '#8a8178',
  },
}
type Look = (typeof LOOK)['light']

// What the terminal shows, the same by day and by night
const TERM = {
  bg: '#191c21',
  scan: '#1d2127',
  sweep: ['#21262d', '#242a31'],
  text: '#e6e6e6',
  dim: '#5c6370',
  rule: '#2b3038',
  bar: '#373d47',
  tab: '#d9d9d9',
  ink: '#1b1b1b',
  header: '#b9643f',
  headerInk: '#2a140a',
  green: '#86e89a',
  yellow: PAL.yellow,
  purple: PAL.purple,
  coral: '#ff8f7a',
  red: '#ff6b6b',
  blue: PAL.blue,
  orange: PAL.orange,
}

// The keys (x, y, width): the top row and Enter at its end, the bottom row round the space bar
const KEYS: [number, number, number][] = [
  ...Array.from({ length: 12 }, (_, i): [number, number, number] => [KX + 2 + i * 4, KY + 1, 3]),
  [KX + 50, KY + 1, 5],
  ...[2, 6, 10].map((dx): [number, number, number] => [KX + dx, KY + 4, 3]),
  [KX + 14, KY + 4, 24],
  ...[40, 44, 48, 52].map((dx): [number, number, number] => [KX + dx, KY + 4, 3]),
]
const ENTER = 12
const SPACE = 16
// The keys that move the selection down and up
const DOWN_KEY = 7
const UP_KEY = 8
const LETTERS = KEYS.map((_, i) => i).filter((i) => i !== ENTER && i !== SPACE)

// A command: its words, each so many characters of a colour, two art pixels a character; what
// it answers once run; the key pressed for each character
interface Command {
  at: number
  words: [number, Rgb][]
  answer: [number, Rgb][]
  keys: number[]
}
const command = (at: number, words: [number, Rgb][], answer: [number, Rgb][]): Command => {
  const keys: number[] = []
  words.forEach(([k], w) => {
    if (w > 0) keys.push(SPACE)
    for (let i = 0; i < k; i++)
      keys.push(LETTERS[Math.floor(rand(at + keys.length) * LETTERS.length)]!)
  })
  return { at, words, answer, keys }
}
// A key press every 90 ms, then Enter
const KEY_MS = 90
const BRANCH: [number, Rgb][] = [
  [4, TERM.coral],
  [2, TERM.coral],
  [8, TERM.coral],
]
const ANSWER_PATH: [number, Rgb][] = [
  [4, TERM.dim],
  [2, TERM.dim],
  [8, TERM.dim],
]
// gwm create feat 42 webhooks, then gwm rm feat 42 webhooks
const CREATE = command(
  500,
  [[3, TERM.green], [6, TERM.blue], ...BRANCH],
  [[7, TERM.green], ...ANSWER_PATH],
)
const REMOVE = command(
  6500,
  [[3, TERM.green], [2, TERM.red], ...BRANCH],
  [[7, TERM.red], ...ANSWER_PATH],
)
const enterOf = (c: Command) => c.at + c.keys.length * KEY_MS + 220

// The story (ms): the new worktree written in, the selection walking down to it, it turning
// dirty then clean (committed); written out, the selection falling back on the row above and
// walking up to the top
const GROW = enterOf(CREATE) + 200
const DIRTY = 5800
const CLEAN = 6300
const SHRINK = enterOf(REMOVE) + 200
const DOWN = [4300, 4700, 5100, 5500]
const UP = [SHRINK + 450, 9900, 10300, 10700]

// The worktrees: name and branch as words of so many characters, the branch's colour, dirty or
// clean. The last one is the one created and removed
const WORKTREES: { name: number[]; color: Rgb; dirty: boolean }[] = [
  { name: [4, 3], color: TERM.purple, dirty: false },
  { name: [3, 2, 4, 5], color: TERM.purple, dirty: false },
  { name: [4, 2, 7, 3], color: TERM.purple, dirty: false },
  { name: [5, 2, 4, 4], color: TERM.red, dirty: true },
  { name: [4, 2, 8], color: TERM.coral, dirty: false },
]
const rowY = (i: number) => SY + 10 + i * 4

// Words as runs of so many art pixels, a pixel apart, nothing past `until`
function run(art: Raster, x: number, y: number, lengths: number[], color: Rgb, until = Infinity) {
  for (const n of lengths) {
    for (let i = 0; i < n && x + i <= until; i++) art.set(x + i, y, color)
    x += n + 1
  }
}

// Words two art pixels a character, a space between, the first `n` key presses of them;
// returns where the cursor goes
function say(art: Raster, x: number, y: number, words: [number, Rgb][], n = Infinity) {
  words.forEach(([k, color], w) => {
    if (w > 0 && n-- > 0) x += 2
    for (let i = 0; i < k && n > 0; i++, n--, x += 2) art.rect(x, y, 2, 1, color)
  })
  return x
}

// A status dot: a little plus, lit in its middle
function dot(art: Raster, x: number, y: number, color: Rgb) {
  for (const [dx, dy] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as const)
    art.set(x + dx, y + dy, color)
  art.set(x, y, mix(color, '#ffffff', 0.55))
}

// A key cap: lit on its top row
function key(art: Raster, i: number, tones: Tones) {
  const [x, y, w] = KEYS[i]!
  art.rect(x, y, w, 1, tones[2])
  art.rect(x, y + 1, w, 1, tones[1])
  art.set(x + w - 1, y + 1, tones[0])
}

// ── What never moves

function poster(art: Raster, c: Look) {
  // A frame on the wall, a dark canvas in it
  art.box(7, 12, 24, 24, c.frame)
  art.rect(9, 14, 20, 20, '#1f2125')
  art.rect(9, 14, 20, 1, '#16181b')
  art.rect(9, 14, 1, 20, '#16181b')
  // gwm's logo: the trunk from the repository, a branch to each worktree; each node parted
  // from the lines by the canvas, lit on its top left
  const [lx, ly] = [12, 16]
  art.rect(lx + 1, ly + 2, 2, 13, '#e0e0e0')
  art.rect(lx + 1, ly + 7, 12, 2, '#e0e0e0')
  art.rect(lx + 1, ly + 13, 12, 2, '#e0e0e0')
  for (const [x, y, color] of [
    [0, 0, '#7ab8ff'],
    [10, 5, '#86e89a'],
    [10, 11, PAL.orange],
  ] as const) {
    art.rect(lx + x - 1, ly + y - 1, 7, 7, '#1f2125')
    art.box(lx + x, ly + y, 5, 5, shades(color, 0.3, 0.45))
  }
}

function desk(art: Raster, c: Look) {
  // The top, seen a little from above, its grain, its front lip catching the light
  art.rect(2, 70, 124, 12, c.top[1])
  art.rect(2, 70, 124, 1, mix(c.top[1], c.top[0], 0.5))
  for (let k = 0; k < 12; k++)
    art.rect(
      4 + rand(k) * 108,
      72 + Math.floor(rand(k + 20) * 9),
      5 + rand(k + 40) * 12,
      1,
      mix(c.top[1], c.top[0], 0.45),
    )
  art.rect(2, 81, 124, 1, c.top[2])
  // The screen's glow spilled on it, brightest by the monitor, dithered at its edges
  for (let y = 70; y < 81; y++) {
    const half = 25 + (y - 70) * 1.1
    for (let x = 2; x < 126; x++) {
      const d = Math.abs(x + 0.5 - (SX + SW / 2))
      if (d < half || (d < half + 3 && (x + y) % 2 === 0))
        art.set(x, y, mix(art.at(x, y)!, c.glow, 0.32 - (y - 70) * 0.018))
    }
  }
  // The front, in shadow along its bottom, and two legs
  art.rect(2, 82, 124, 4, c.front[1])
  art.rect(2, 85, 124, 1, c.front[0])
  art.box(8, 86, 4, 10, c.leg)
  art.box(116, 86, 4, 10, c.leg)
}

function monitor(art: Raster, c: Look) {
  // The stand: its neck, its foot on the desk
  art.box(74, 64, 10, 4, c.neck)
  art.box(66, 68, 26, 3, c.casing)
  art.set(66, 68, undefined)
  art.set(91, 68, undefined)
  // The casing, lit on its top and left, its corners rounded
  art.box(CX, CY, CW, CH, c.casing)
  for (const [x, y] of [
    [CX, CY],
    [CX + CW - 1, CY],
    [CX, CY + CH - 1],
    [CX + CW - 1, CY + CH - 1],
  ] as const)
    art.set(x, y, undefined)
  // The bezel's inner edge: in shadow on its top and left, lit on its bottom and right
  art.rect(SX - 1, SY - 1, SW + 2, SH + 2, c.casing[2])
  art.rect(SX - 1, SY - 1, SW + 1, 1, c.casing[0])
  art.rect(SX - 1, SY - 1, 1, SH + 1, c.casing[0])
  // The screen, its faint scanlines, its corners rounded
  art.rect(SX, SY, SW, SH, TERM.bg)
  for (let y = SY + 1; y < SY + SH; y += 2) art.rect(SX, y, SW, 1, TERM.scan)
  art.set(SX, SY, c.casing[0])
  art.set(SX + SW - 1, SY, c.casing[0])
  art.set(SX, SY + SH - 1, c.casing[0])
  art.set(SX + SW - 1, SY + SH - 1, c.casing[2])
  // The chin: a maker's mark, the power light
  art.rect(SX + SW / 2 - 3, SY + SH + 2, 6, 1, c.casing[0])
  art.rect(SX + SW - 4, SY + SH + 2, 2, 1, TERM.green)
}

function keyboard(art: Raster, c: Look) {
  art.box(KX, KY, 57, 8, c.kbd)
  KEYS.forEach((_, i) => key(art, i, c.key))
}

function mug(art: Raster, c: Look) {
  // The body, the rim and the coffee in it, a heart on its side
  art.cylinder(MX, MY + 1, 10, 10, c.mug)
  art.rect(MX + 1, MY - 1, 8, 1, c.mug[2])
  art.set(MX, MY, c.mug[2])
  art.rect(MX + 1, MY, 8, 1, '#4a2a1a')
  art.set(MX + 9, MY, c.mug[1])
  art.sprite(['##.##', '#####', '.###.', '..#..'], MX + 2, MY + 3, { '#': PAL.cream })
  // The handle, its hole closed by the outline
  art.rect(MX + 10, MY + 2, 3, 6, c.mug[0])
  art.rect(MX + 11, MY + 2, 2, 1, c.mug[1])
  art.set(MX + 10, MY + 4, undefined)
  art.set(MX + 10, MY + 5, undefined)
}

function still(dark: boolean) {
  const c = LOOK[dark ? 'dark' : 'light']
  const ink = outlineOf(dark)
  const art = new Raster(W, H)
  // Each thing outlined on its own, laid over what is behind it
  for (const draw of [poster, desk, monitor, keyboard, mug]) {
    const layer = new Raster(W, H)
    draw(layer, c)
    layer.outline(ink)
    art.over(layer)
  }
  // The poster's string, over its nail
  art.line(11, 11, 18, 7, c.string)
  art.line(26, 11, 19, 7, c.string)
  art.rect(18, 6, 2, 2, mix(c.string, '#000000', 0.3))
  art.set(18, 6, mix(c.string, '#ffffff', 0.4))
  return art
}

// ── What moves

// The squid of the arcade, two art pixels a block, each block lit on its top left; its eyes
// drawn over, looking (dx, dy) or shut
function squid(frame: number, eyes: [number, number] | 'shut', dark: boolean) {
  const rows = INVADERS[0]![frame]!.map((row, j) => (j === 3 ? '########' : row))
  const art = new Raster(18, 18)
  const purple = shades(PAL.purple, 0.3, 0.35)
  rows.forEach((row, j) =>
    [...row].forEach((ch, i) => {
      if (ch !== '#') return
      art.rect(1 + i * 2, 1 + j * 2, 2, 2, purple[1])
      art.set(1 + i * 2, 1 + j * 2, purple[2])
      art.set(2 + i * 2, 2 + j * 2, purple[0])
    }),
  )
  const ink = outlineOf(dark)
  for (const ex of [5, 11]) {
    if (eyes === 'shut') art.rect(ex, 8, 2, 1, ink)
    else art.rect(ex + eyes[0], 7 + eyes[1], 2, 2, ink)
  }
  art.outline(ink)
  return art
}

// Where it looks: ahead, at the poster, down at the screen while something happens on it, at
// the mug; happy, eyes shut, as it hops; a blink now and then
function eyesAt(tl: number): [number, number] | 'shut' {
  if ([2400, 7400, 11300].some((at) => tl >= at && tl < at + 170)) return 'shut'
  if (tl >= GROW && tl < GROW + 650) return 'shut'
  if (tl >= 900 && tl < 1700) return [-1, 0]
  if ((tl >= 1700 && tl < 9600) || (tl >= 9900 && tl < 10800)) return [0, 1]
  return [0, 0]
}

function screen(art: Raster, tl: number, u: number) {
  // A brighter band rolling down the glass, three times a loop
  const sweep = SY - 3 + Math.floor(((u * 3) % 1) * (SH + 3))
  for (let y = Math.max(SY, sweep); y < Math.min(SY + SH, sweep + 3); y++)
    art.rect(SX + 1, y, SW - 2, 1, TERM.sweep[(y - SY) % 2]!)

  // The title: the repository's tab and path, gwm's version on the right
  art.rect(SX + 2, SY + 2, 12, 3, TERM.tab)
  run(art, SX + 4, SY + 3, [4, 3], TERM.ink)
  run(art, SX + 17, SY + 3, [1, 8, 7], TERM.dim)
  art.rect(SX + 57, SY + 2, 13, 3, TERM.orange)
  run(art, SX + 59, SY + 3, [3, 5], TERM.ink)
  // The worktrees' header
  art.rect(SX + 2, SY + 6, 68, 3, TERM.header)
  run(art, SX + 4, SY + 7, [3, 9, 3], TERM.headerInk)
  run(art, SX + 61, SY + 7, [1, 2, 1], TERM.headerInk)

  // The selection bar, sliding a row at a time
  let pos = 0
  DOWN.forEach((at) => (pos += smooth(tl, at, at + 110)))
  UP.forEach((at) => (pos -= smooth(tl, at, at + 110)))
  const bar = Math.round(rowY(0) + pos * 4)
  art.rect(SX + 1, bar, SW - 2, 3, TERM.bar)
  art.rect(SX + 2, bar, 1, 3, TERM.text)
  art.set(SX + 3, bar + 1, TERM.text)

  // The rows: a status dot, the name, the branch, clean or dirty, the path. The new one is
  // written in left to right, and out right to left
  WORKTREES.forEach((row, i) => {
    let until = Infinity
    let edge: Rgb | undefined
    if (i === 4) {
      if (tl < GROW || tl >= SHRINK + 400) return
      const shown = tl < SHRINK ? ease(tl, GROW, GROW + 400) : 1 - smooth(tl, SHRINK, SHRINK + 400)
      until = SX + 2 + Math.round(shown * 68)
      if (shown < 1) edge = tl < SHRINK ? TERM.green : TERM.red
    }
    const y = rowY(i) + 1
    const dirty = row.dirty || (i === 4 && tl >= DIRTY && tl < CLEAN)
    const state = dirty ? TERM.yellow : TERM.green
    if (until >= SX + 7) dot(art, SX + 6, y, state)
    // The dot rings once as it turns dirty, and once as it turns clean
    if (i === 4 && [DIRTY, CLEAN].some((at) => tl >= at && tl < at + 170))
      for (const [dx, dy] of [
        [-2, -2],
        [2, -2],
        [-2, 2],
        [2, 2],
      ] as const)
        art.set(SX + 6 + dx, y + dy, mix(state, '#ffffff', 0.5))
    run(art, SX + 10, y, row.name, TERM.text, until)
    run(art, SX + 31, y, i === 0 ? [4] : row.name, row.color, until)
    run(art, SX + 53, y, [5], state, until)
    run(art, SX + 60, y, [1, 8], TERM.dim, until)
    if (edge && until < SX + SW - 2) art.rect(until, y - 1, 1, 3, edge)
  })

  // Under a rule, the prompt: a command typing itself, its answer once run, or the cursor
  // blinking
  art.rect(SX + 2, SY + 30, 68, 1, TERM.rule)
  const y = SY + 33
  art.set(SX + 2, y - 1, TERM.orange)
  art.set(SX + 3, y, TERM.orange)
  art.set(SX + 2, y + 1, TERM.orange)
  for (const cmd of [CREATE, REMOVE]) {
    const enter = enterOf(cmd)
    if (tl >= cmd.at && tl < enter + 150) {
      const n = Math.floor((tl - cmd.at) / KEY_MS) + 1
      const x = say(art, SX + 6, y, cmd.words, n)
      art.rect(x, y - 1, 2, 3, TERM.text)
      return
    }
    if (tl >= enter + 150 && tl < enter + 1000) {
      // A tick for created, a cross for removed
      const mark: [number, number][] =
        cmd === CREATE
          ? [
              [0, 0],
              [1, 1],
              [2, 0],
              [3, -1],
            ]
          : [
              [0, -1],
              [2, -1],
              [1, 0],
              [0, 1],
              [2, 1],
            ]
      for (const [dx, dy] of mark) art.set(SX + 6 + dx, y + dy, cmd.answer[0]![1])
      say(art, SX + 12, y, cmd.answer)
      return
    }
  }
  if (Math.floor(tl / 400) % 2 === 0) art.rect(SX + 6, y - 1, 2, 3, TERM.text)
}

// The keys pressed, lit: a letter or the space bar for each character, Enter, the arrows that
// move the selection
function pressed(art: Raster, tl: number) {
  const lit = shades(PAL.orange, 0.2, 0.45)
  for (const cmd of [CREATE, REMOVE]) {
    const n = Math.floor((tl - cmd.at) / KEY_MS)
    if (n >= 0 && n < cmd.keys.length && tl - cmd.at - n * KEY_MS < 70) key(art, cmd.keys[n]!, lit)
    const enter = enterOf(cmd)
    if (tl >= enter && tl < enter + 170) key(art, ENTER, lit)
  }
  if (DOWN.some((at) => tl >= at && tl < at + 85)) key(art, DOWN_KEY, lit)
  if (UP.slice(1).some((at) => tl >= at && tl < at + 85)) key(art, UP_KEY, lit)
}

// Steam off the coffee: three wisps rising, curling, gone
function steam(art: Raster, u: number, color: Rgb) {
  for (let i = 0; i < 3; i++) {
    const f = (u * 6 + i / 3) % 1
    const length = Math.round(6 * Math.sin(f * Math.PI))
    for (let j = 0; j < length; j++) {
      const y = Math.round(MY - 3 - f * 14 - j)
      art.set(MX + 2 + i * 3 + Math.round(1.3 * Math.sin(y * 0.55 + i * 2)), y, color)
    }
  }
}

function paint(t: number, dark: boolean) {
  const c = LOOK[dark ? 'dark' : 'light']
  const art = new Raster(W, H)
  const u = phase(t, PERIOD)
  // The time within the loop: what flaps or steps by it repeats exactly from loop to loop
  const tl = u * PERIOD

  // The invader on the casing's top, its legs over the bezel swinging; a hop for joy as the
  // new worktree comes in, crouching a pixel before it and after
  const joy = hop(tl, GROW + 50, 420)
  const body = squid(Math.floor(tl / 375) % 2, eyesAt(tl), dark)
  const lift = Math.round(joy.up * 4) - (joy.k > 0.06 ? 1 : 0)
  art.blit(body, 9, 11, IX, CY - lift)

  screen(art, tl, u)
  pressed(art, tl)
  steam(art, u, c.steam)
  // The power light flickers while a command runs
  for (const cmd of [CREATE, REMOVE]) {
    const enter = enterOf(cmd)
    if (tl >= enter && tl < enter + 600 && Math.floor((tl - enter) / 85) % 2 === 0)
      art.rect(SX + SW - 4, SY + SH + 2, 2, 1, TERM.yellow)
  }
  return art
}

// At rest (reduced motion): the new worktree selected, its removal half typed
export const terminal: Hero = { w: W, h: H, period: PERIOD, rest: 7600, still, paint }
