// The hero's easter egg (HomeWalkout): Kylian's gitfut card revealed like an FC 26 walkout, in
// the cameos' pixels (../cameos/art). The camera dollies down a tunnel of lit portals towards a
// figure against the light at its far end; then the reveals one after the other (the flag
// waving, the position between two lines, the club's banner), a flash, and the stage: the card
// slams down between two pillars, its rating counts up, the portrait grows in. What the guides
// say of FC 26 is kept (the lines are gold for an 81 to 85, silver above, none under); the
// rest is drawn here, nothing of EA's. Everything is a function of t, so a skip is a jump.
import type { GitfutCard } from '~~/shared/gitfut'
import {
  burst,
  clamp,
  ease,
  mix,
  outlineOf,
  pop,
  Raster,
  smooth,
  twinkle,
  type Rgb,
} from '../cameos/art'
import { GROWN, noise } from '../pixelGrow'
import { badgeArt } from './orbit'

const W = 224
const H = 150

/** The reveals, in the order they come (Kylian's: country, position, club) */
const ORDER = ['country', 'position', 'club'] as const
type Beat = (typeof ORDER)[number]

// The timeline (ms): the tunnel, each reveal, the flash, then the stage's moments
const INTRO = 2300
const BEAT = 1500
const FLASH = 450
const SLAM = 280
const COUNT = 900
const PORTRAIT = 420
const SHINE = 450

// ── Palettes

interface Palette {
  wall: Rgb[]
  frame: Rgb[]
  floor: Rgb[]
  gold: Rgb[]
  silver: Rgb[]
  light: Rgb[]
  figure: Rgb
  outline: Rgb
}

const PALETTES: Record<'dark' | 'light', Palette> = {
  dark: {
    wall: ['#060608', '#0c0c10', '#15151b', '#202028', '#2d2d37'],
    frame: ['#0b0b0e', '#1a1a20', '#2b2b34', '#41414c', '#5c5c68'],
    floor: ['#050506', '#0b0b0e', '#141419', '#1f1f26'],
    gold: ['#3d2f0c', '#7a5f18', '#b8922c', '#e6c654', '#ffdf61', '#fff1b8'],
    silver: ['#3a3d44', '#6b7079', '#a3a9b3', '#d5dae2', '#f5f7fa'],
    light: ['#b8922c', '#e6c654', '#ffe9a0', '#fff8e1', '#ffffff'],
    figure: '#030304',
    outline: outlineOf(true),
  },
  // Light: the same tunnel by day, its gold deeper so it holds on the greys
  light: {
    wall: ['#b4b4b4', '#c2c2c2', '#d0d0d0', '#dcdcdc', '#e8e8e8'],
    frame: ['#a2a2a2', '#b6b6b6', '#cacaca', '#dedede', '#f0f0f0'],
    floor: ['#a8a8a8', '#b8b8b8', '#c8c8c8', '#d6d6d6'],
    gold: ['#4a3608', '#6e5210', '#8f6c18', '#b08a24', '#c9a232', '#dcb845'],
    silver: ['#4a4e56', '#767b85', '#a3a9b3', '#c9ced6', '#eef1f5'],
    light: ['#e6c654', '#ffe9a0', '#fff8e1', '#ffffff', '#ffffff'],
    figure: '#1a1a1a',
    outline: outlineOf(false),
  },
}

// The card's colours by gitfut's finish (components/finishTheme.ts there): its ground, from
// shadow to light, and its ink; totw and toty share the navy and gold art, as on gitfut
const FINISHES: Record<string, { ground: Rgb[]; ink: Rgb; glow: Rgb }> = {
  totw: { ground: ['#0a1534', '#13245a', '#1d3375'], ink: '#ebcd5b', glow: '#5a8cff' },
  toty: { ground: ['#0a1534', '#13245a', '#1d3375'], ink: '#ebcd5b', glow: '#5a8cff' },
  gold: { ground: ['#a8862a', '#d9b44a', '#f0d77a'], ink: '#46390c', glow: '#e1b950' },
  silver: { ground: ['#8a9099', '#b9c0c9', '#dde3ea'], ink: '#303536', glow: '#aabcd2' },
  bronze: { ground: ['#6a4527', '#a8703f', '#d6a36e'], ink: '#3a2717', glow: '#be783c' },
  icon: { ground: ['#c9b27a', '#e9dcae', '#f7f0d6'], ink: '#625217', glow: '#f3d580' },
  founder: { ground: ['#7a1020', '#c41e33', '#ff2f45'], ink: '#f6f8fb', glow: '#ff2f45' },
}

// The orbit's badges (./orbit) by language, in its order; any other gets its initials
const BADGE_OF: Record<string, number> = { TypeScript: 0, Rust: 1, Vue: 2, Go: 5 }

// ── Little things

// A 4 × 4 ordered dither: where a tone gives way to the next
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)
const bayer = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)]!

/** A tone of a ramp for a light (0 to 1), dithered between two */
function tone(ramp: Rgb[], light: number, x: number, y: number) {
  const v = clamp(light) * (ramp.length - 1)
  const i = Math.floor(v)
  return ramp[Math.min(ramp.length - 1, i + (v - i > bayer(x, y) ? 1 : 0))]!
}

const mod = (a: number, n: number) => ((a % n) + n) % n

// Three by five, what the card prints
const GLYPHS: Record<string, string[]> = {
  '0': ['###', '#.#', '#.#', '#.#', '###'],
  '1': ['.#.', '##.', '.#.', '.#.', '###'],
  '2': ['###', '..#', '###', '#..', '###'],
  '3': ['###', '..#', '.##', '..#', '###'],
  '4': ['#.#', '#.#', '###', '..#', '..#'],
  '5': ['###', '#..', '###', '..#', '###'],
  '6': ['###', '#..', '###', '#.#', '###'],
  '7': ['###', '..#', '.#.', '.#.', '.#.'],
  '8': ['###', '#.#', '###', '#.#', '###'],
  '9': ['###', '#.#', '###', '..#', '###'],
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'],
  N: ['##.', '#.#', '#.#', '#.#', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'],
  P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'],
  R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  '-': ['...', '...', '###', '...', '...'],
}

/** A word's width in the font, `k` pixels a dot */
const widthOf = (word: string, k = 1) => Math.max(0, word.length * 4 - 1) * k

/** A word in the font, `k` pixels a dot; `paint` colours each dot (its top left) */
function print(
  art: Raster,
  word: string,
  x: number,
  y: number,
  k: number,
  paint: Rgb | ((x: number, y: number) => void),
) {
  ;[...word].forEach((ch, n) =>
    GLYPHS[ch]?.forEach((row, j) =>
      [...row].forEach((p, i) => {
        if (p !== '#') return
        const [px, py] = [Math.round(x + (n * 4 + i) * k), Math.round(y + j * k)]
        if (typeof paint === 'string') art.rect(px, py, k, k, paint)
        else paint(px, py)
      }),
    ),
  )
}

/** Big letters in relief: lit from the top down, their depth below and to the right, outlined;
 * `sweep` a band of light across them (art x), when given */
function relief(
  art: Raster,
  word: string,
  cx: number,
  y: number,
  k: number,
  ramp: Rgb[],
  sweep = -99,
) {
  const x = Math.round(cx - widthOf(word, k) / 2)
  const letters = new Raster(art.w, art.h)
  for (let d = Math.max(1, Math.round(k / 3)); d >= 1; d--)
    print(letters, word, x + d, y + d, k, ramp[0]!)
  print(letters, word, x, y, k, (px, py) => {
    for (let j = 0; j < k; j++)
      for (let i = 0; i < k; i++) {
        const [X, Y] = [px + i, py + j]
        const lit = Math.abs(X - sweep - (Y - y) * 0.6) < k * 1.2 ? 0.35 : 0
        letters.set(X, Y, tone(ramp, 0.92 - ((Y - y) / (5 * k)) * 0.55 + lit, X, Y))
      }
  })
  letters.outline('#0a0a0a')
  art.over(letters)
}

// ── The tunnel, cast once: what each art pixel looks at (floor, ceiling, a wall) and how far

const VP = { x: 112, y: 60 }
const FOCAL = 72
const FLOOR = 1
const CEIL = -0.85
// The walls lean in: 1.2 from the axis at the floor, 0.8 at the ceiling
const LEAN = (1.2 - 0.8) / (FLOOR - CEIL)
const BASE = 1.2 - LEAN * FLOOR
// The portals' spacing along the tunnel
const PORTAL = 1.1
const enum Surface {
  Floor,
  Ceiling,
  Left,
  Right,
}

let rays: { surface: Uint8Array; depth: Float32Array; across: Float32Array } | undefined
function cast() {
  if (rays) return rays
  rays = {
    surface: new Uint8Array(W * H),
    depth: new Float32Array(W * H),
    across: new Float32Array(W * H),
  }
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - VP.x) / FOCAL
      const dy = (y + 0.5 - VP.y) / FOCAL
      // The nearest of the four planes ahead: inside a convex section, the one it leaves by
      const hits: [number, Surface][] = [
        [dy > 0 ? FLOOR / dy : Infinity, Surface.Floor],
        [dy < 0 ? CEIL / dy : Infinity, Surface.Ceiling],
        [-dx - LEAN * dy > 0 ? BASE / (-dx - LEAN * dy) : Infinity, Surface.Left],
        [dx - LEAN * dy > 0 ? BASE / (dx - LEAN * dy) : Infinity, Surface.Right],
      ]
      const [depth, surface] = hits.reduce((a, b) => (b[0] < a[0] ? b : a))
      const i = y * W + x
      rays.surface[i] = surface
      rays.depth[i] = depth
      // Across the surface: x on the floor and the ceiling, the height on a wall
      rays.across[i] = surface <= Surface.Ceiling ? dx * depth : dy * depth
    }
  return rays
}

/** Where a point of the tunnel (X across, Y down, z ahead) is on screen */
const project = (X: number, Y: number, z: number) => ({
  x: VP.x + (X * FOCAL) / z,
  y: VP.y + (Y * FOCAL) / z,
  k: FOCAL / z,
})

// The monogram (ui/Logo.vue) on its 96 grid, corners squared: the bar, then the two pieces
const LOGO: [number, number][][] = [
  [
    [66, 0],
    [87, 0],
    [90, 7],
    [7, 90],
    [0, 87],
    [0, 66],
  ],
  [
    [0, 10],
    [7, 7],
    [23, 24],
    [7, 41],
    [0, 38],
  ],
  [
    [53, 59],
    [59, 59],
    [90, 90],
    [86, 96],
    [66, 96],
    [43, 75],
    [43, 69],
  ],
]

/**
 * The tunnel with the camera `travel` along it and its far end `end` ahead: portals with a gold
 * trim, two gold strips on the floor lit as far as `reach`, slats of light on the ceiling, a gold
 * line along each wall, and the far end all light, the monogram on it
 */
function tunnel(art: Raster, p: Palette, travel: number, end: number, reach: number, dim = 0) {
  const { surface, depth, across } = cast()
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      const z = depth[i]!
      if (z > end) {
        // The far end: light, a little less towards its edges
        const r = Math.hypot((x - VP.x) / FOCAL, (y - VP.y - 4) / FOCAL) * end
        art.cells[i] = tone(p.light, 0.95 - r * 0.45 - dim, x, y)
        continue
      }
      const s = across[i]!
      const along = z + travel
      const u = mod(along, PORTAL)
      // Light: what the camera's lamps reach, then the glow of the far end
      const lit = 0.18 + 0.62 * Math.exp(-z * 0.32) + 0.6 * Math.exp(-(end - z) * 1.1) - dim
      const side = surface[i]!
      let color: Rgb
      if (u < 0.05) color = tone(p.gold, lit + 0.35, x, y)
      else if (u < 0.24) color = tone(p.frame, lit + 0.05, x, y)
      else if (u < 0.3) color = tone(p.wall, lit - 0.35, x, y)
      else if (side === Surface.Floor) {
        const strip = Math.abs(Math.abs(s) - 0.52) < 0.05
        // The floor shines with the far end's light down its middle
        const sheen = Math.abs(s) < 0.4 ? 0.3 * Math.exp(-(end - z) * 0.7) : 0
        color =
          strip && z < reach
            ? tone(p.gold, lit + 0.4, x, y)
            : strip
              ? tone(p.gold, lit - 0.3, x, y)
              : tone(p.floor, lit + sheen - 0.05, x, y)
      } else if (side === Surface.Ceiling) {
        const slat = mod(along, 0.5) < 0.16 && Math.abs(s) < 0.5
        color = slat ? tone(p.gold, lit + 0.15, x, y) : tone(p.wall, lit - 0.2, x, y)
      } else {
        const line = Math.abs(s - 0.62) < 0.035
        color = line ? tone(p.gold, lit + 0.3, x, y) : tone(p.wall, lit, x, y)
      }
      art.cells[i] = color
    }
  // The monogram on the far end, the bar dark against the light, its pieces orange
  const size = 0.48
  LOGO.forEach((shape, n) =>
    art.poly(
      shape.map(([gx, gy]) => {
        const at = project(-size / 2 + (gx / 96) * size, -0.8 + (gy / 96) * size, end)
        return [at.x, at.y] as [number, number]
      }),
      n === 0 ? '#2a2a2a' : '#d4825d',
    ),
  )
}

/** The figure at the far end against the light, walking in from the right then standing:
 * the mascot's shape (cap, round ears, hoodie), a gold rim where the light catches it */
function figure(art: Raster, p: Palette, t: number, end: number) {
  const walk = smooth(t, 500, 1700)
  const X = 0.85 - 0.8 * walk
  const z = end - 0.35
  // Four poses at Ichigo's pace while it walks, a little bob on the passing ones
  const step = t > 500 && t < 1700 ? Math.floor(t / 110) % 4 : -1
  const swing = step === 0 ? 0.11 : step === 2 ? -0.11 : 0
  const bob = step === 1 || step === 3 ? 0.03 : 0
  const at = (dx: number, up: number) => project(X + dx, FLOOR - up - bob, z)
  const draw = (color: Rgb, g: number) => {
    const flat: [Rgb, Rgb, Rgb] = [color, color, color]
    const k = at(0, 0).k
    // Legs and arms, swinging against each other
    for (const [side, s] of [
      [-1, swing],
      [1, -swing],
    ] as const) {
      const [hip, foot] = [at(side * 0.08, 0.48), at(side * 0.08 + s, 0.02)]
      art.stroke(
        [
          [hip.x, hip.y],
          [foot.x, foot.y],
        ],
        k * 0.06 + g,
        flat,
      )
      const [shoulder, hand] = [at(side * 0.22, 0.86), at(side * 0.25 - s * 0.8, 0.5)]
      art.stroke(
        [
          [shoulder.x, shoulder.y],
          [hand.x, hand.y],
        ],
        k * 0.05 + g,
        flat,
      )
    }
    // The hoodie, wider at the shoulders
    const hoodie = [at(-0.24, 0.9), at(0.24, 0.9), at(0.2, 0.42), at(-0.2, 0.42)]
    art.poly(
      hoodie.map(
        (q) =>
          [q.x + Math.sign(q.x - at(0, 0).x) * g, q.y + (q.y < at(0, 0.66).y ? -g : g)] as [
            number,
            number,
          ],
      ),
      color,
    )
    // The head, its round ears, the cap pulled down on it, its peak at the back
    const head = at(0, 1.04)
    art.ball(head.x, head.y, k * 0.19 + g, k * 0.17 + g, flat)
    for (const side of [-1, 1]) {
      const ear = at(side * 0.2, 1.02)
      art.ball(ear.x, ear.y, k * 0.065 + g, k * 0.065 + g, flat)
    }
    const cap = at(0, 1.1)
    art.ball(cap.x, cap.y, k * 0.2 + g, k * 0.13 + g, flat, cap.y)
    const peak = at(0.17, 1.12)
    art.rect(peak.x - g, peak.y - g, k * 0.12 + 2 * g, Math.max(1, k * 0.04) + 2 * g, color)
  }
  draw(p.gold[3]!, 1)
  draw(p.figure, 0)
}

/** A flag on a pole, waving out to the right: each column rides the wave, lit by its slope */
function flag(
  art: Raster,
  p: Palette,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  look: (u: number, v: number) => Rgb,
) {
  // The pole and its knob
  art.cylinder(x - 3, y - 3, 2, h * 2.2, [p.silver[1]!, p.silver[2]!, p.silver[3]!])
  art.ball(x - 2, y - 4, 2, 2, [p.gold[2]!, p.gold[3]!, p.gold[5]!])
  for (let i = 0; i < w; i++) {
    const phase = i * 0.21 - t * 0.009
    const out = i / w
    const dy = Math.sin(phase) * (0.5 + 2.6 * out)
    const slope = Math.cos(phase)
    for (let j = 0; j < h; j++) {
      const c = look(out, j / h)
      art.set(
        x + i,
        y + j + dy,
        slope > 0.55 ? mix(c, '#ffffff', 0.25) : slope < -0.55 ? mix(c, '#000000', 0.3) : c,
      )
    }
  }
}

/** A banner hanging from a bar, its point at the bottom, swaying: each row pushed by the
 * wind, lit by how it bends */
function banner(
  art: Raster,
  p: Palette,
  x: number,
  y: number,
  w: number,
  h: number,
  t: number,
  look: (u: number, v: number) => Rgb,
) {
  art.cylinder(x - 3, y - 3, w + 6, 2, [p.gold[2]!, p.gold[3]!, p.gold[4]!])
  art.rect(x - 4, y - 4, 2, 4, p.gold[4]!)
  art.rect(x + w + 2, y - 4, 2, 4, p.gold[4]!)
  for (let j = 0; j < h; j++) {
    const phase = j * 0.16 - t * 0.007
    const v = j / h
    const dx = Math.sin(phase) * 2.2 * v
    const bend = Math.cos(phase) * v
    for (let i = 0; i < w; i++) {
      // The point: the bottom rows narrow to the middle
      if (v > 0.82 && Math.abs(i + 0.5 - w / 2) > (w / 2) * ((1 - v) / 0.18)) continue
      const c = look(i / w, v)
      art.set(
        x + i + dx,
        y + j,
        bend > 0.4 ? mix(c, '#ffffff', 0.18) : bend < -0.4 ? mix(c, '#000000', 0.28) : c,
      )
    }
  }
}

/** The flag at (u, v), 0 to 1 across and down; a plain cloth while it has no picture */
const sample = (flag: Raster | undefined, u: number, v: number): Rgb =>
  flag?.at(u * flag.w, v * flag.h) ?? (v < 0.5 ? '#9aa1ad' : '#7d8491')

// The card's outline on a 64 × 92 box: a little crest at the top, its point at the bottom
const CARD_W = 64
const CARD_H = 92
const CARD: [number, number][] = [
  [1, 9],
  [22, 4],
  [28, 0],
  [32, 4],
  [36, 0],
  [42, 4],
  [63, 9],
  [63, 72],
  [56, 82],
  [42, 88],
  [32, 92],
  [22, 88],
  [8, 82],
  [1, 72],
]
const inset = (points: [number, number][], d: number) =>
  points.map(([x, y]) => [x + Math.sign(32 - x) * d, y + Math.sign(46 - y) * d] as [number, number])

export interface WalkoutArt {
  /** The portrait, square, as large as the card shows it */
  avatar?: Raster
  /** The flag, any size: it is sampled */
  flag?: Raster
}

/** The card at (x0, y0): its rating shown so far, the portrait grown to `portrait` (0 to
 * GROWN), a shine across it at `shine` (0 to 1, none outside) */
function card(
  art: Raster,
  p: Palette,
  c: GitfutCard,
  assets: WalkoutArt,
  x0: number,
  y0: number,
  rating: number,
  portrait: number,
  shine: number,
  dark: boolean,
) {
  const look = FINISHES[c.finish] ?? FINISHES.gold!
  const ink = look.ink
  const face = new Raster(CARD_W + 2, CARD_H + 2)
  face.poly(CARD, p.gold[3]!)
  face.poly(inset(CARD, 1), p.gold[4]!)
  face.poly(inset(CARD, 2), look.ground[1]!)
  // The finish's art, as on gitfut's in-form card: a band of gold down the middle top, a
  // pattern pressed in it, dithered into the ground at its foot
  for (let y = 3; y < 50; y++)
    for (let x = 22; x < 44; x++)
      if (face.at(x, y) === look.ground[1] && (y < 42 || bayer(x, y) > (y - 42) / 8))
        face.set(x, y, mix(look.ground[1]!, ink, (x * 3 + y * 5) % 11 < 2 ? 0.72 : 0.58))
  // The portrait, grown block by block from its middle
  const avatar = assets.avatar
  if (avatar && portrait > 0)
    for (let y = 0; y < avatar.h; y++)
      for (let x = 0; x < avatar.w; x++) {
        const [bx, by] = [x - (x % 3), y - (y % 3)]
        const order =
          Math.hypot(bx + 1.5 - avatar.w / 2, by + 1.5 - avatar.h / 2) / (avatar.w * 0.55) +
          noise(bx, by) * 0.3
        const color = avatar.at(x, y)
        if (color && (portrait >= GROWN || order < portrait)) face.set(24 + x, 7 + y, color)
      }
  // Down the left: the rating, the position, the flag, the club
  print(face, String(rating), 5, 11, 2, ink)
  print(face, c.position, 11 - widthOf(c.position) / 2, 24, 1, ink)
  if (c.country)
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 12; x++) face.set(5 + x, 31 + y, sample(assets.flag, x / 12, y / 8))
  if (c.language) face.blit(badge(c.language, dark), 7.5, 7.5, 11.5, 48.5)
  // The name, a rule, the stats in two columns either side of a stroke
  const rule = mix(look.ground[1]!, ink, 0.5)
  print(face, c.surname, 33.5 - widthOf(c.surname) / 2, 49, 1, ink)
  face.rect(10, 57, CARD_W - 18, 1, rule)
  Object.entries(c.stats).forEach(([name, value], n) => {
    const [x, y] = [7 + Math.floor(n / 3) * 27, 60 + (n % 3) * 6]
    print(face, String(value), x, y, 1, ink)
    print(face, name.toUpperCase(), x + 9, y, 1, mix(ink, look.ground[1]!, 0.25))
  })
  face.rect(32, 60, 1, 17, rule)
  // The shine: a band of light across, leaning
  if (shine > 0 && shine < 1) {
    const at = -20 + shine * (CARD_W + 40)
    face.cells.forEach((color, i) => {
      const [x, y] = [i % face.w, Math.floor(i / face.w)]
      if (color && Math.abs(x - at + y * 0.5) < 4) face.cells[i] = mix(color, '#ffffff', 0.55)
    })
  }
  face.outline(p.outline)
  art.blit(face, 0, 0, x0, y0)
}

const badges = new Map<string, Raster>()
/** The club's badge: the orbit's for its languages, else the name's initials on a tile */
function badge(language: string, dark: boolean) {
  const known = BADGE_OF[language]
  if (known !== undefined) return badgeArt(dark)[known]!
  const key = `${language}:${dark}`
  let art = badges.get(key)
  if (!art) {
    art = new Raster(15, 15)
    art.box(1, 1, 13, 13, ['#3a3a44', '#55555f', '#7a7a86'])
    const initials = language
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 2)
      .toUpperCase()
    print(art, initials, 8 - widthOf(initials) / 2, 5, 1, '#ffffff')
    art.outline(outlineOf(dark))
    badges.set(key, art)
  }
  return art
}

/** A slab facing the middle, its near edge on the outside: a dark face, gold edges */
function pillar(art: Raster, p: Palette, side: -1 | 1) {
  const [outer, inner] = side < 0 ? [8, 54] : [W - 8, W - 54]
  const shape: [number, number][] = [
    [outer, 30],
    [inner, 40],
    [inner, 124],
    [outer, 134],
  ]
  art.poly(shape, p.frame[1]!)
  for (let y = 30; y < 134; y++)
    for (let x = Math.min(outer, inner); x <= Math.max(outer, inner); x++)
      if (art.at(x, y) === p.frame[1])
        art.set(
          x,
          y,
          tone(p.frame, 0.25 + (0.25 * Math.abs(x - inner)) / 46 - (y - 30) / 400, x, y),
        )
  art.line(outer, 30, inner, 40, p.gold[4]!)
  art.line(outer, 134, inner, 124, p.gold[3]!)
  art.line(inner, 40, inner, 124, p.gold[3]!)
  art.line(outer, 30, outer, 134, p.gold[2]!)
}

/** The rarity's lines around the position: silver for a walkout, gold for a board, none under */
const linesOf = (overall: number, p: Palette) =>
  overall >= 86 ? p.silver : overall >= 81 ? p.gold : undefined

// ── The scene

export interface Walkout {
  w: number
  h: number
  /** ms, until the card is still */
  duration: number
  /** When the card is there (ms): the announcement then */
  revealed: number
  /** The frame at t (ms), grown to `level` (0 to GROWN) out of its middle */
  paint: (t: number, dark: boolean, assets: WalkoutArt, level?: number) => Raster
}

export function walkout(c: GitfutCard): Walkout {
  const beats = ORDER.filter((beat) =>
    beat === 'country' ? c.country : beat === 'club' ? c.language : true,
  )
  const flashAt = INTRO + beats.length * BEAT
  const stageAt = flashAt + FLASH / 2
  const slamAt = flashAt + FLASH
  const countAt = slamAt + SLAM + 120
  const portraitAt = countAt + COUNT
  const shineAt = portraitAt + PORTRAIT + 80
  // Still once the last twinkle (shineAt + 360, 420 ms) is out, or a frozen one stays
  const duration = shineAt + 800
  const from = Math.max(40, c.overall - 16)

  // Vignette: the scene fades into the page at its edges, dithered (a rounded rectangle)
  const edge = new Uint8Array(W * H)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const e = (((x + 0.5) / W) * 2 - 1) ** 6 + (((y + 0.5) / H) * 2 - 1) ** 6
      edge[y * W + x] = e > 0.32 + 0.68 * bayer(x, y) ? 1 : 0
    }

  function reveal(
    art: Raster,
    p: Palette,
    beat: Beat,
    t: number,
    assets: WalkoutArt,
    dark: boolean,
  ) {
    const enter = ease(t, 0, 380)
    const leave = smooth(t, BEAT - 300, BEAT)
    if (beat === 'country') {
      // From the left, waving, then the camera passes it
      const x = Math.round(-60 + 88 * enter - 70 * leave)
      flag(art, p, x, 28, 52, 35, t, (u, v) => sample(assets.flag, u, v))
      // No picture of it: its code on the cloth
      if (!assets.flag)
        print(art, c.country!.toUpperCase(), x + 26 - widthOf('FR', 2) / 2, 41, 2, '#ffffff')
      art.outline(p.outline)
    } else if (beat === 'position') {
      // A dark band across, the letters popping on it between two lines grown out from the middle
      for (let i = 42 * W; i < 85 * W; i++)
        if (art.cells[i]) art.cells[i] = mix(art.cells[i]!, '#000000', 0.72)
      const lines = linesOf(c.overall, p)
      if (lines) {
        const half = 96 * ease(t, 60, 420) * (1 - leave)
        for (const y of [40, 85]) {
          art.rect(VP.x - half, y, half * 2, 2, lines[3]!)
          art.rect(VP.x - half, y, half * 2, 1, lines[4]!)
          art.rect(
            VP.x + half * (2 * smooth(t, 400, 1200) - 1) - 3,
            y,
            6,
            1,
            lines[lines.length - 1]!,
          )
        }
      }
      const k = Math.round(6 * pop(t, 120, 300) * (1 - leave))
      if (k > 0)
        relief(
          art,
          c.position,
          VP.x,
          63 - (5 * k) / 2,
          k,
          p.gold,
          -20 + (W + 40) * smooth(t, 500, 1100),
        )
    } else {
      // From the right, swaying, the club's badge on a deep blue cloth with lines of colour
      const x = Math.round(W + 10 - 84 * enter + 70 * leave)
      const mark = badge(c.language!, dark)
      const look = (u: number, v: number) => {
        const m = mark.at((u * 40 - 5) / 2, (v * 64 - 12) / 2)
        if (m) return m
        const r = Math.hypot(u - 0.5, v - 1.15) * 9 - t * 0.0025
        return mod(r, 1) < 0.12
          ? ['#7ad0c8', '#5aa0e6', '#a87ee0'][Math.floor(mod(r, 3))]!
          : mix('#141d4a', '#2a2f7a', v)
      }
      banner(art, p, x, 16, 40, 64, t, look)
      art.outline(p.outline)
    }
  }

  function stage(art: Raster, p: Palette, t: number, assets: WalkoutArt, dark: boolean) {
    tunnel(art, p, 3.4, 4.2, 99, 0.4)
    const look = FINISHES[c.finish] ?? FINISHES.gold!
    // Two beams from the top corners, and the card's glow behind it
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const cone = (ox: number) => {
          const dx = (x - ox) / (y + 6)
          return Math.abs(dx - (ox < W / 2 ? 0.9 : -0.9)) < 0.28
        }
        const glow = Math.hypot((x - VP.x) / 52, (y - 70) / 60)
        if (glow < 1 && bayer(x, y) > glow * 1.05)
          art.set(x, y, mix(look.glow, '#ffffff', 0.15 * (1 - glow)))
        else if ((cone(0) || cone(W)) && bayer(x, y) < 0.16) art.set(x, y, p.light[1]!)
      }
    pillar(art, p, -1)
    pillar(art, p, 1)
    // The left one says the position, the right one the flag over the club
    relief(art, c.position, 31, 64, 4, p.gold)
    const lines = linesOf(c.overall, p)
    if (lines) for (const y of [56, 90]) art.rect(18, y, 26, 1, lines[3]!)
    if (c.country)
      for (let y = 0; y < 13; y++)
        for (let x = 0; x < 20; x++) art.set(183 + x, 54 + y, sample(assets.flag, x / 20, y / 13))
    if (c.language) art.blit(badge(c.language, dark), 7.5, 7.5, 193, 92, 0, 2, 2)
    art.outline(p.outline)

    // The card falls, squashes as it lands, a little burst of gold at its feet
    const fall = clamp((t - slamAt) / SLAM)
    const drop = (1 - fall * fall) * -120
    const rating = Math.round(from + (c.overall - from) * ease(t, countAt, countAt + COUNT))
    const [x0, y0] = [VP.x - CARD_W / 2, 24 + drop]
    const shine = (t - shineAt) / SHINE
    card(art, p, c, assets, x0, y0, rating, ((t - portraitAt) / PORTRAIT) * GROWN, shine, dark)
    burst(art, VP.x, 116, t, slamAt + SLAM, [p.gold[4]!, p.gold[5]!, '#ffffff'], {
      n: 18,
      speed: 0.07,
      seed: 3,
    })
    // A tick of light on the rating as it climbs
    if (t > countAt && t < countAt + COUNT && Math.floor(t / 70) % 2 === 0)
      art.rect(x0 + 5, y0 + 9, 14, 1, '#ffffff')
    // Three twinkles once it shines: a corner, the right edge, low on the left
    const stars: [number, number][] = [
      [x0 + 4, y0 + 12],
      [x0 + CARD_W - 4, y0 + 30],
      [x0 + 10, y0 + CARD_H - 14],
    ]
    stars.forEach(([x, y], k) => twinkle(art, x, y, t, shineAt + 120 + k * 120, '#ffffff', 420))
  }

  function paint(t: number, dark: boolean, assets: WalkoutArt, level = GROWN) {
    const p = PALETTES[dark ? 'dark' : 'light']
    const art = new Raster(W, H)
    if (t < stageAt) {
      // The dolly: quick down the first stretch, then drifting on through the reveals
      const travel = 3 * ease(t, 0, INTRO) + Math.max(0, t - INTRO) * 0.00022
      const end = 7.2 - travel
      tunnel(art, p, travel, end, 0.6 + 9 * ease(t, 150, 1100), 0)
      if (t < flashAt) figure(art, p, t, end)
      const n = Math.floor((t - INTRO) / BEAT)
      if (n >= 0 && n < beats.length) reveal(art, p, beats[n]!, t - INTRO - n * BEAT, assets, dark)
    } else stage(art, p, t, assets, dark)

    // The flash: light out of the far end, filling it all, then thinning away over the stage
    const f = (t - flashAt) / FLASH
    if (f > 0 && f < 1)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const r = Math.hypot(x - VP.x, (y - VP.y) * 1.3) / 150
          const fill = f < 0.5 ? r < f * 2.4 : bayer(x, y) > (f - 0.5) * 2
          // White at its heart, warmer out to its edge, which a light page still shows
          if (fill) art.set(x, y, r < 0.3 ? '#ffffff' : r < 0.6 ? '#fff8e1' : '#ffe9a0')
        }

    // Into the page at the edges, and out of its middle block by block while it grows
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const i = y * W + x
        if (edge[i]) art.cells[i] = undefined
        else if (level < GROWN) {
          const [bx, by] = [x - (x % 3), y - (y % 3)]
          if (Math.hypot(bx + 1.5 - W / 2, by + 1.5 - H / 2) / 110 + noise(bx, by) * 0.3 >= level)
            art.cells[i] = undefined
        }
      }
    return art
  }

  return { w: W, h: H, duration, revealed: slamAt + SLAM, paint }
}
