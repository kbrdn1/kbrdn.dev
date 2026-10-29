// The hero's easter egg (HomeWalkout): Kylian's gitfut card revealed like an FC 26 walkout,
// drawn like the pages' hero scenes (../cameos/art): a players' tunnel seen from the front, on
// no background. Its lights run down to the far end, where the mascot steps out of the glow and
// walks up to the mouth; then the reveals hang on the tunnel one after the other (the flag, the
// position on a board, the club's banner), the mascot cheers, a flash, and gitfut's own card
// slams down in front, which the component draws sharp over the pixels (`card`). What the
// guides say of FC 26 is kept: the lines round the position are gold for an 81 to 85, silver
// above, none under. Nothing of EA's. Everything is a function of t, so a skip is a jump.
import type { GitfutCard } from '~~/shared/gitfut'
import {
  burst,
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
  twinkle,
  type Rgb,
  type Tones,
} from '../cameos/art'
import { GROWN, noise } from '../pixelGrow'
import { badgeArt } from './orbit'

type Point = [number, number]

// The orbit's grid (./orbit): two CSS px an art pixel in the hero's box
const W = 168
const H = 112

/** The reveals, in the order they come (Kylian's: country, position, club) */
const ORDER = ['country', 'position', 'club'] as const

// The timeline (ms)
const LIGHTS = [150, 900] as const
const WALK = [450, 2600] as const
const FIRST = 2800
const BEAT = 1300
const CHEER = 500
const FLASH = 450
const SLAM = 260
const SHINE = 450
/** Leaving (ms): the banners roll up, the board lifts off, the card goes back into the tunnel,
 * its lights go out from the far end; then the component folds it all into the mascot */
export const LEAVE = 380

// Where it all stands: the ground's top row, the tunnel's mouth and its far end
const GROUND = 104
const VP: Point = [84, 64]
// The facade, chamfered at the top, and its opening
const FACADE: Point[] = [
  [44, GROUND],
  [44, 38],
  [56, 26],
  [112, 26],
  [124, 38],
  [124, GROUND],
]
const MOUTH: Point[] = [
  [54, GROUND],
  [54, 45],
  [63, 36],
  [105, 36],
  [114, 45],
  [114, GROUND],
]
// The far end's size against the mouth, and the portals between
const FAR = 0.3
const PORTALS = [0.82, 0.64, 0.5, 0.39]
// The banners' cloth (left, top, width, height), the board's box
const FLAG = { x: 18, y: 32, w: 22, h: 34 }
const CLUB = { x: 128, y: 32, w: 22, h: 34 }
const BOARD = { x: 63, y: 5, w: 42, h: 16 }
// gitfut's card, its bottom on the ground in front of the mouth (810 × 1230)
const CARD_H = 72
const CARD_W = (CARD_H * 810) / 1230

/** A shape drawn `s` of the way from the far end's point to its size at the mouth */
const toward = (shape: Point[], s: number): Point[] =>
  shape.map(([x, y]) => [VP[0] + (x - VP[0]) * s, VP[1] + (y - VP[1]) * s])

// ── Colours

interface Palette {
  facade: Tones
  inside: Tones
  floor: Tones
  steel: Tones
  gold: Tones
  dim: Tones
  glow: Tones
}
const palette = (dark: boolean): Palette => ({
  facade: shades(dark ? '#4a4a56' : '#c4c4cc', 0.28, 0.3),
  inside: shades(dark ? '#24242c' : '#33333d', 0.35, 0.25),
  floor: shades(dark ? '#1c1c22' : '#2a2a32', 0.3, 0.25),
  steel: shades('#a8a8b4', 0.35, 0.4),
  gold: [PAL.gold, PAL.yellow, '#fff3c4'],
  dim: shades('#7a6420', 0.3, 0.2),
  glow: ['#ffe9a0', '#fff6d8', '#ffffff'],
})

// The card's light behind it, by gitfut's finish (components/finishTheme.ts there)
const GLOWS: Record<string, Rgb> = {
  totw: '#7fa8ff',
  toty: '#7fa8ff',
  gold: PAL.yellow,
  silver: '#dce4ee',
  bronze: '#e0a46a',
  icon: '#f3d580',
  founder: '#ff6273',
}

// The orbit's badges (./orbit) by language, in its order; any other gets its initials
const BADGE_OF: Record<string, number> = { TypeScript: 0, Rust: 1, Vue: 2, Go: 5 }

// Three by five, the letters a position or a club's initials need
const GLYPHS: Record<string, string[]> = {
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
}
const widthOf = (word: string, k = 1) => Math.max(0, word.length * 4 - 1) * k

/** A word in the font, `k` pixels a dot, each dot lit on its top left over a shadow below
 * right; inside the `sweep` band (art x), all light */
function letters(
  art: Raster,
  word: string,
  x: number,
  y: number,
  k: number,
  tones: Tones,
  sweep = -99,
) {
  const dots: Point[] = []
  ;[...word].forEach((ch, n) =>
    GLYPHS[ch]?.forEach((row, j) =>
      [...row].forEach((p, i) => p === '#' && dots.push([x + (n * 4 + i) * k, y + j * k])),
    ),
  )
  for (const [dx, dy] of dots) art.rect(dx + 1, dy + 1, k, k, tones[0])
  for (const [dx, dy] of dots) {
    const lit = Math.abs(dx - sweep - (dy - y) * 0.5) < k * 1.5
    art.rect(dx, dy, k, k, lit ? tones[2] : tones[1])
    art.set(dx, dy, lit ? '#ffffff' : tones[2])
  }
}

// ── The tunnel

/** The facade round the mouth, the ground in front, the lamps on top: what never moves */
function facade(art: Raster, p: Palette, dark: boolean) {
  // The ground: a slab of pitch-side floor, a gold edge along its front
  const ground = shades(dark ? '#3a3a44' : '#b8b8c2', 0.25, 0.25)
  art.box(28, GROUND, W - 56, 5, ground)
  for (let x = 34; x < W - 30; x += 9) art.set(x, GROUND + 2, ground[0])
  art.rect(28, GROUND + 4, W - 56, 1, PAL.gold)
  // The facade, lit along its top and left edges, shaded along its right
  art.poly(FACADE, p.facade[1])
  art.line(44, GROUND - 1, 44, 38, p.facade[2])
  art.line(44, 38, 56, 26, p.facade[2])
  art.line(56, 26, 112, 26, p.facade[2])
  art.line(112, 26, 124, 38, p.facade[0])
  art.line(124, 38, 124, GROUND - 1, p.facade[0])
  // Its panels: seams down each side, rivets, a gold strip of light round the mouth
  for (const x of [49, 119]) art.line(x, 42, x, GROUND - 2, p.facade[0])
  for (const [x, y] of [
    [47, 44],
    [47, 96],
    [121, 44],
    [121, 96],
  ] as const)
    art.set(x, y, p.facade[2])
  const strip: Point[] = [
    [50, GROUND - 1],
    [50, 43],
    [61, 32],
    [107, 32],
    [118, 43],
    [118, GROUND - 1],
  ]
  for (let i = 1; i < strip.length; i++) art.line(...strip[i - 1]!, ...strip[i]!, PAL.gold)
  // The mouth's reveal: its far side lit, its near sides in shadow, the depth of the wall
  art.poly(MOUTH, p.facade[0])
  art.poly(toward(MOUTH, 0.94), p.inside[1])
  // Two lamps on top, their housings and their glass
  for (const x of [62, 104]) {
    art.box(x - 3, 21, 7, 5, p.steel)
    art.rect(x - 2, 24, 5, 2, '#fff3c4')
  }
}

/** Inside the mouth: its walls, ceiling and floor running to the far end; portals along it,
 * their gold trims and the floor's two strips lit as far as `reach` (0 at the mouth, 1 at the
 * end); the far end all light, the monogram on it */
function corridor(art: Raster, p: Palette, reach: number, breathe: number) {
  const mouth = toward(MOUTH, 0.94)
  const end = toward(MOUTH, FAR)
  // The six faces: walls lit from the far end, the ceiling darker, the floor darkest
  const faces: Tones[number][] = [
    p.inside[1],
    p.inside[1],
    p.inside[0],
    p.inside[2],
    p.inside[2],
    p.floor[1],
  ]
  for (let i = 0; i < mouth.length; i++) {
    const j = (i + 1) % mouth.length
    art.poly([mouth[i]!, mouth[j]!, end[j]!, end[i]!], faces[i]!)
  }
  // The floor's sheen down its middle, from the far end's light
  art.poly(
    [
      [76, GROUND - 1],
      [92, GROUND - 1],
      [end[5]![0] - 6, end[5]![1]],
      [end[0]![0] + 6, end[0]![1]],
    ],
    p.floor[2],
  )
  // The portals, nearest first drawn last; each trim lights once the run has got that far
  ;[...PORTALS].reverse().forEach((s, n) => {
    const depth = 1 - (s - FAR) / (1 - FAR)
    const ring = toward(MOUTH, s * 0.94)
    const lit = reach >= depth
    for (let i = 1; i < ring.length; i++) {
      const [a, b] = [ring[i - 1]!, ring[i]!]
      art.line(...a, ...b, p.inside[0])
      art.line(
        a[0] + (i < 3 ? 1 : i > 3 ? -1 : 0),
        a[1] + 1,
        b[0] + (i < 3 ? 1 : i > 3 ? -1 : 0),
        b[1] + 1,
        lit ? (n % 2 ? PAL.yellow : PAL.gold) : p.dim[0],
      )
    }
  })
  // The floor's strips, from the mouth to the far end, lit as far as the run has got
  for (const side of [-1, 1]) {
    const [x0, y0] = [VP[0] + side * 18, GROUND - 1]
    const [x1, y1] = [VP[0] + side * 18 * FAR, VP[1] + (GROUND - VP[1]) * FAR]
    for (let i = 0; i <= 40; i++) {
      const q = i / 40
      art.set(x0 + (x1 - x0) * q, y0 + (y1 - y0) * q, q <= reach ? PAL.yellow : p.dim[1])
    }
  }
  // The far end: light, breathing a little; the monogram on it (ui/Logo.vue)
  art.poly(end, p.glow[0])
  art.poly(toward(MOUTH, FAR * (0.82 + 0.04 * breathe)), p.glow[1])
  art.poly(toward(MOUTH, FAR * 0.55), p.glow[2])
  const logo = (gx: number, gy: number): Point => [VP[0] - 4 + gx * 0.08, VP[1] - 9 + gy * 0.08]
  art.poly([logo(66, 0), logo(90, 0), logo(7, 90), logo(0, 90), logo(0, 66)], '#2a2a2a')
  art.poly([logo(0, 10), logo(23, 24), logo(0, 41)], PAL.orange)
  art.poly([logo(53, 59), logo(90, 90), logo(66, 96), logo(43, 72)], PAL.orange)
}

// ── The mascot: the hero's monkey, cap on backwards, hoodie, sneakers

type Pose = 'stand' | 'left' | 'right' | 'cheer'

/** The mascot on its own raster, 26 × 30, its feet's middle at (13, 29); `light` 0 (a shape
 * against the glow) to 1 (in full light) */
function mascot(pose: Pose, light: number, dark: boolean) {
  const art = new Raster(26, 30)
  const dim = (c: Rgb) => mix(c, '#121216', 0.9 * (1 - light))
  const tones = (base: Rgb, d = 0.3, l = 0.3): Tones => shades(base, d, l).map(dim) as Tones
  const fur = tones('#e08a52')
  const face = tones('#f6dcc0', 0.18, 0.4)
  const hoodie = tones('#33333d', 0.35, 0.3)
  const jeans = tones('#4a5068', 0.3, 0.25)
  const shoe = tones('#f2f2f2', 0.2, 0.3)
  const ink = dim('#1a1a1a')
  // Legs: one lifted on the walking poses
  const [lift, rift] = pose === 'left' ? [2, 0] : pose === 'right' ? [0, 2] : [0, 0]
  for (const [x, up] of [
    [10, lift],
    [14.5, rift],
  ] as const) {
    art.box(x, 21 - up, 3, 7, jeans)
    art.box(x - 0.5, 27 - up, 4, 2, shoe)
  }
  // Arms, swinging against the legs, up for the cheer
  const reach = pose === 'cheer' ? -9 : pose === 'left' ? 1 : pose === 'right' ? -1 : 0
  for (const [side, swing] of [
    [-1, reach],
    [1, pose === 'cheer' ? -9 : -reach],
  ] as const) {
    const [sx, sy] = [13 + side * 6, 14]
    const [hx, hy] = pose === 'cheer' ? [13 + side * 9, 3] : [13 + side * 7.5, 20 + swing]
    art.stroke(
      [
        [sx, sy],
        [hx, hy],
      ],
      1.3,
      hoodie,
    )
    art.ball(hx, hy, 1.6, 1.6, fur)
  }
  // The hoodie: its body, a pocket, its strings, the monogram's orange on the chest
  art.ball(13, 17.5, 6.5, 5.5, hoodie, 22)
  art.rect(8, 17, 10, 5, hoodie[1])
  art.rect(9, 21, 8, 1, hoodie[0])
  art.rect(10, 19, 6, 1, hoodie[0])
  art.set(11, 13, face[1])
  art.set(15, 13, face[1])
  art.set(16, 16, dim(PAL.orange))
  // The head: fur round a pale face, the ears out on the sides
  for (const side of [-1, 1]) {
    art.ball(13 + side * 7, 8, 2.4, 2.4, fur)
    art.set(13 + side * 7, 8, face[0])
  }
  art.ball(13, 7.5, 6.5, 6, fur)
  art.ball(13, 9, 4.5, 3.6, face)
  // Eyes under a frowning brow, a little smile
  if (light > 0.35) {
    art.set(11, 8, ink)
    art.set(15, 8, ink)
    art.set(10, 7, fur[0])
    art.set(11, 7, fur[0])
    art.set(15, 7, fur[0])
    art.set(16, 7, fur[0])
    art.rect(12, 11, 3, 1, face[0])
  }
  // The cap, on backwards: a dark crown, its orange strap across the brow
  art.ball(13, 4.5, 5.6, 3.4, tones('#26262e'), 5)
  art.rect(9, 4, 8, 1, dim(PAL.orange))
  art.set(13, 2, dim('#5a5a66'))
  art.outline(outlineOf(dark))
  return art
}

// ── The reveals

/** A banner hanging from a rod off the facade, unrolled `drop` of the way (0 to 1), swaying:
 * each row pushed by the wind, lit by how it bends, its point at the bottom; `look(u, v)` its
 * picture */
function banner(
  art: Raster,
  p: Palette,
  box: typeof FLAG,
  side: -1 | 1,
  drop: number,
  t: number,
  look: (u: number, v: number) => Rgb,
) {
  // The rod, from the facade out, on a bracket; a knob at its end
  const [wall, tip] = side < 0 ? [44, box.x - 3] : [124, box.x + box.w + 2]
  art.rect(Math.min(wall, tip), box.y - 2, Math.abs(wall - tip) + 1, 2, p.steel[1])
  art.rect(Math.min(wall, tip), box.y - 2, Math.abs(wall - tip) + 1, 1, p.steel[2])
  art.box(side < 0 ? wall - 2 : wall, box.y - 4, 3, 6, p.steel)
  art.ball(tip + 0.5, box.y - 1, 1.6, 1.6, [PAL.gold, PAL.yellow, '#fff3c4'])
  const shown = Math.round(box.h * drop)
  for (let j = 0; j < shown; j++) {
    const v = j / box.h
    const phase = j * 0.18 - t * 0.006
    const dx = Math.sin(phase) * 1.6 * v
    const bend = Math.cos(phase) * v
    for (let i = 0; i < box.w; i++) {
      // The point: the bottom rows narrow to the middle
      if (v > 0.8 && Math.abs(i + 0.5 - box.w / 2) > (box.w / 2) * ((1 - v) / 0.2)) continue
      const c = look(i / box.w, v)
      art.set(
        box.x + i + dx,
        box.y + j,
        bend > 0.35 ? mix(c, '#ffffff', 0.2) : bend < -0.35 ? mix(c, '#000000', 0.25) : c,
      )
    }
  }
  // Still rolling: the roll at its foot
  if (drop > 0 && drop < 1) art.cylinder(box.x - 1, box.y + shown - 1, box.w + 2, 3, p.steel)
}

/** The flag at (u, v), 0 to 1 across and down; a plain cloth while it has no picture */
const sample = (flag: Raster | undefined, u: number, v: number): Rgb =>
  flag?.at(u * flag.w, v * flag.h) ?? (v < 0.5 ? '#9aa1ad' : '#7d8491')

const badges = new Map<string, Raster>()
/** The club's badge: the orbit's for its languages, else the name's initials on a tile */
function badge(language: string, dark: boolean) {
  const known = BADGE_OF[language]
  if (known !== undefined) return badgeArt(dark)[known]!
  const key = `${language}:${dark}`
  let art = badges.get(key)
  if (!art) {
    art = new Raster(15, 15)
    art.box(1, 1, 13, 13, shades('#55555f', 0.3, 0.3))
    const initials = language
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 2)
      .toUpperCase()
    letters(art, initials, 8 - widthOf(initials) / 2, 5, 1, ['#3a3a44', '#ffffff', '#ffffff'])
    art.outline(outlineOf(dark))
    badges.set(key, art)
  }
  return art
}

/** The rarity's lines round the position: silver for a walkout, gold for a board, none under */
const linesOf = (overall: number): Tones | undefined =>
  overall >= 86
    ? shades('#c9ced6', 0.3, 0.5)
    : overall >= 81
      ? [PAL.gold, PAL.yellow, '#fff3c4']
      : undefined

// ── The scene

export interface WalkoutArt {
  /** The country's flag, any size: it is sampled */
  flag?: Raster
}

export interface CardAt {
  /** Art pixels: its box, before the squash */
  x: number
  y: number
  w: number
  h: number
  /** Squashed by k as it lands (0 none) */
  k: number
  /** The light across it (0 to 1, none outside) */
  shine: number
}

export interface Walkout {
  w: number
  h: number
  /** ms, until it is still */
  duration: number
  /** When the card has landed (ms): the announcement then */
  revealed: number
  /** The frame at t (ms), grown to `level` (0 to GROWN) out of its middle, `leave` ms into
   * leaving (none while negative) */
  paint: (t: number, dark: boolean, assets: WalkoutArt, level?: number, leave?: number) => Raster
  /** Where gitfut's card is at t (and `leave`), drawn over the frame; none before the flash */
  card: (t: number, leave?: number) => CardAt | undefined
}

export function walkout(c: GitfutCard): Walkout {
  const beats = ORDER.filter((beat) =>
    beat === 'country' ? c.country : beat === 'club' ? c.language : true,
  )
  const beatAt = (beat: (typeof ORDER)[number]) => FIRST + beats.indexOf(beat) * BEAT
  const cheerAt = FIRST + beats.length * BEAT
  const flashAt = cheerAt + CHEER
  const slamAt = flashAt + FLASH / 2
  const landAt = slamAt + SLAM
  const shineAt = landAt + 400
  // Still once the last twinkle is out
  const duration = shineAt + SHINE + 500
  const glow = GLOWS[c.finish] ?? PAL.yellow

  const stills = new Map<boolean, Raster>()
  const still = (dark: boolean) => {
    let art = stills.get(dark)
    if (!art) {
      art = new Raster(W, H)
      facade(art, palette(dark), dark)
      stills.set(dark, art)
    }
    return art
  }

  function paint(t: number, dark: boolean, assets: WalkoutArt, level = GROWN, leave = -1) {
    const p = palette(dark)
    const art = still(dark).copy()
    const breathe = Math.sin(t / 260)
    // Leaving, the lights go out from the far end back to the mouth
    corridor(art, p, ease(t, ...LIGHTS) * (1 - smooth(leave, 60, LEAVE)), breathe)

    // The mascot: out of the far end's glow, walking up to the mouth and growing as it nears,
    // a shape against the light until the tunnel's lamps reach it; it waits, cheers, and is
    // gone in the flash
    if (t < flashAt + FLASH / 2) {
      const s = FAR + (1 - FAR) * smooth(t, ...WALK)
      const walking = t > WALK[0] && t < WALK[1]
      const step = Math.floor(t / 130) % 4
      const pose: Pose =
        t >= cheerAt
          ? 'cheer'
          : walking
            ? (['left', 'stand', 'right', 'stand'] as const)[step]!
            : 'stand'
      const bob = walking && step % 2 === 0 ? 1 : 0
      const light = Math.round(clamp((s - 0.45) / 0.5) * 6) / 6
      const up = pose === 'cheer' ? pop(t, cheerAt, 300) : 1
      const [x, y] = [VP[0], VP[1] + (GROUND - VP[1]) * s - bob]
      art.blit(
        mascot(pose, light, dark),
        13,
        29.5,
        x,
        y,
        0,
        s,
        s * (pose === 'cheer' ? 0.92 + 0.08 * up : 1),
      )
    }

    // The flag, hung from its rod and unrolled; the board dropping onto the top of the
    // facade, the position on it between its lines; the club's banner, the other side
    const hang = (
      beat: (typeof ORDER)[number],
      box: typeof FLAG,
      side: -1 | 1,
      look: (u: number, v: number) => Rgb,
    ) => {
      const at = beatAt(beat)
      if (!beats.includes(beat) || t < at) return
      const drop = ease(t, at, at + 520) * (1 - smooth(leave, 0, 300))
      if (drop > 0) banner(art, p, box, side, drop, t, look)
      twinkle(art, box.x + box.w / 2 + side * 6, box.y + 8, t, at + 420, '#ffffff', 420)
    }
    hang('country', FLAG, -1, (u, v) => sample(assets.flag, u, v))
    const mark = c.language ? badge(c.language, dark) : undefined
    hang('club', CLUB, 1, (u, v) => {
      const m = mark?.at(u * CLUB.w - 3.5, v * CLUB.h - 6)
      if (m) return m
      const r = Math.hypot(u - 0.5, v - 1.1) * 7
      return r % 1 < 0.14
        ? ['#7ad0c8', '#5aa0e6', '#a87ee0'][Math.floor(r % 3)]!
        : mix('#18215a', '#2a3488', v)
    })
    const boardAt = beatAt('position')
    if (t >= boardAt) {
      const { x, w, h } = BOARD
      const y = Math.round(BOARD.y - 24 * (1 - pop(t, boardAt, 380)) - 30 * smooth(leave, 40, 330))
      // Two struts down to the facade, moving with it; the board, its frame, the rarity's lines,
      // the letters
      for (const sx of [x + 7, x + w - 8]) art.rect(sx, y + h, 2, 26 - BOARD.y - h, p.steel[0])
      art.box(x, y, w, h, shades('#22222a', 0.3, 0.35))
      art.rect(x + 2, y + 2, w - 4, h - 4, '#14141a')
      const lines = linesOf(c.overall)
      if (lines) {
        const half = Math.round(((w - 8) / 2) * ease(t, boardAt + 200, boardAt + 600))
        for (const ly of [y + 2, y + h - 3]) art.rect(x + w / 2 - half, ly, half * 2, 1, lines[1])
      }
      const k = 2
      const sweep = x - 10 + (w + 20) * smooth(t, boardAt + 500, boardAt + 1100)
      letters(
        art,
        c.position,
        x + w / 2 - widthOf(c.position, k) / 2,
        y + 3,
        k,
        [PAL.rust, PAL.gold, PAL.yellow],
        sweep,
      )
      twinkle(art, x + w - 4, y + 2, t, boardAt + 380, '#ffffff', 420)
    }

    // The flash out of the mascot: rays, then light over the mouth, thinning out
    const f = (t - flashAt) / FLASH
    if (f > 0 && f < 1) {
      const [cx, cy] = [VP[0], GROUND - 14]
      for (let a = 0; a < 12; a++) {
        const angle = (a / 12) * 2 * Math.PI + 0.13
        const [r0, r1] = [5 + 16 * f, 10 + 26 * f]
        art.line(
          cx + Math.cos(angle) * r0,
          cy + Math.sin(angle) * r0,
          cx + Math.cos(angle) * r1,
          cy + Math.sin(angle) * r1,
          a % 2 ? PAL.yellow : '#ffffff',
        )
      }
      const r = 16 * Math.sin(f * Math.PI)
      art.ball(cx, cy, r, r * 1.1, ['#fff3c4', '#ffffff', '#ffffff'])
    }
    // Its light behind the card once it is there: warm dots in the mouth, flickering until
    // it is still
    if (t >= landAt && leave < 120) {
      const shift = t >= duration ? 0 : Math.floor(t / 170) % 2
      for (let y = 30; y < GROUND; y++)
        for (let x = 52; x < 117; x++) {
          const d = Math.hypot((x - VP[0]) / 30, (y - 68) / 40)
          if (d < 1 && (x + y + shift) % 2 === 0 && rand(x * 57 + y * 131) > 0.25 + d * 0.7)
            art.set(x, y, glow)
        }
      burst(art, VP[0], GROUND - 1, t, landAt, [PAL.yellow, PAL.gold, '#ffffff'], {
        n: 16,
        speed: 0.06,
        seed: 5,
      })
      for (const [k, [x, y]] of [
        [0, [VP[0] - 26, 40]],
        [1, [VP[0] + 27, 52]],
        [2, [VP[0] - 22, 90]],
      ] as [number, Point][])
        twinkle(art, x, y, t, shineAt + 100 + k * 130, '#ffffff', 420)
    }

    art.outline(outlineOf(dark))

    // Out of its middle block by block while it grows, back into it as it folds
    if (level < GROWN)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const [bx, by] = [x - (x % 3), y - (y % 3)]
          if (Math.hypot(bx + 1.5 - W / 2, by + 1.5 - H / 2) / 76 + noise(bx, by) * 0.3 >= level)
            art.cells[y * W + x] = undefined
        }
    return art
  }

  function card(t: number, leave = -1): CardAt | undefined {
    // Leaving, it goes back down the tunnel: smaller, up towards the far end, gone there
    const back = smooth(leave, 0, LEAVE)
    if (t < slamAt || back >= 1) return
    // It falls, squashes as it lands, springs back
    const fall = clamp((t - slamAt) / SLAM)
    const since = (t - landAt) / 260
    const k = since > 0 && since < 1 ? 0.12 * Math.cos(since * Math.PI * 1.5) * (1 - since) : 0
    const size = 1 - (1 - FAR * 0.6) * back
    const [w, h] = [CARD_W * size, CARD_H * size]
    const foot = GROUND + (VP[1] + (GROUND - VP[1]) * FAR - GROUND) * back
    return {
      x: VP[0] - w / 2,
      y: foot - h - (1 - fall * fall) * 110,
      w,
      h,
      k,
      shine: (t - shineAt) / SHINE,
    }
  }

  return { w: W, h: H, duration, revealed: landAt, paint, card }
}
