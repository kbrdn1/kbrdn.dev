// What the cameos paint with (utils/cameos): a Raster of art pixels, its volumes shaded as lit
// from the top left and dithered where two tones meet, an outline around them, and the
// timing helpers of a scene. A cameo draws its frame at time t (ms), in light or dark.

export type Rgb = string
/** Shadow, base, light */
export type Tones = [Rgb, Rgb, Rgb]
type Point = [number, number]

export interface Cameo {
  /** Art pixels; the bottom row stands on the card's edge */
  w: number
  h: number
  /** ms */
  duration: number
  /** Where it grows from and folds back into, and over how many art pixels */
  origin: Point
  spread: number
  paint: (t: number, dark: boolean) => Raster
}

/** Pose cadence (ms), Ichigo's */
export const FRAME = 85
/** The growth and the fold (ms), Ichigo's */
export const GROW_MS = 320

// Lit from the top left, a little towards the viewer
const lighting = (nx: number, ny: number, nz: number) => -0.45 * nx - 0.6 * ny + 0.66 * nz
const toneOf = (light: number, x: number, y: number) => {
  const l = light + ((x + y) & 1) * 0.08
  return l > 0.8 ? 2 : l > 0.32 ? 1 : 0
}

export class Raster {
  readonly cells: (Rgb | undefined)[]
  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.cells = Array.from({ length: w * h })
  }

  at(x: number, y: number) {
    ;[x, y] = [Math.floor(x), Math.floor(y)]
    return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.cells[y * this.w + x] : undefined
  }

  set(x: number, y: number, color: Rgb | undefined) {
    ;[x, y] = [Math.floor(x), Math.floor(y)]
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y * this.w + x] = color
  }

  rect(x: number, y: number, w: number, h: number, color: Rgb) {
    ;[x, y] = [Math.round(x), Math.round(y)]
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, color)
  }

  /** Every other pixel of a rect: a see-through veil */
  veil(x: number, y: number, w: number, h: number, color: Rgb, phase = 0) {
    ;[x, y] = [Math.round(x), Math.round(y)]
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++)
        if ((x + i + y + j + phase) % 2 === 0) this.set(x + i, y + j, color)
  }

  /** An ellipse shaded as a ball; nothing below `bottom` (a dome) */
  ball(cx: number, cy: number, rx: number, ry: number, tones: Tones, bottom = Infinity) {
    for (let y = Math.floor(cy - ry); y < cy + ry && y + 0.5 <= bottom; y++)
      for (let x = Math.floor(cx - rx); x < cx + rx; x++) {
        const nx = (x + 0.5 - cx) / rx
        const ny = (y + 0.5 - cy) / ry
        const r = nx * nx + ny * ny
        if (r <= 1) this.set(x, y, tones[toneOf(lighting(nx, ny, Math.sqrt(1 - r)), x, y)])
      }
  }

  /** A box lit on its top and left edges, shaded on its bottom and right ones */
  box(x: number, y: number, w: number, h: number, tones: Tones) {
    ;[x, y, w, h] = [Math.round(x), Math.round(y), Math.round(w), Math.round(h)]
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++)
        this.set(x + i, y + j, tones[j === h - 1 || i === w - 1 ? 0 : j === 0 || i === 0 ? 2 : 1])
  }

  /** An upright cylinder: lit on its left, shaded on its right */
  cylinder(x: number, y: number, w: number, h: number, tones: Tones) {
    ;[x, y, w, h] = [Math.round(x), Math.round(y), Math.round(w), Math.round(h)]
    for (let i = 0; i < w; i++) {
      const nx = ((i + 0.5) / w) * 2 - 1
      for (let j = 0; j < h; j++)
        this.set(x + i, y + j, tones[toneOf(lighting(nx, 0, Math.sqrt(1 - nx * nx)) + 0.1, i, j)])
    }
  }

  /** A polygon, filled flat (pixel centres, even-odd) */
  poly(points: Point[], color: Rgb) {
    const ys = points.map((p) => p[1])
    const xs = points.map((p) => p[0])
    for (let y = Math.floor(Math.min(...ys)); y <= Math.max(...ys); y++)
      for (let x = Math.floor(Math.min(...xs)); x <= Math.max(...xs); x++) {
        const [px, py] = [x + 0.5, y + 0.5]
        let inside = false
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
          const [xi, yi] = points[i]!
          const [xj, yj] = points[j]!
          if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside
        }
        if (inside) this.set(x, y, color)
      }
  }

  line(x0: number, y0: number, x1: number, y1: number, color: Rgb) {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))))
    for (let i = 0; i <= n; i++) this.set(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, color)
  }

  /** A thick rounded stroke along points, shaded like a tube */
  stroke(points: Point[], r: number, tones: Tones) {
    for (let k = 1; k < points.length; k++) {
      const [[x0, y0], [x1, y1]] = [points[k - 1]!, points[k]!]
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2))
      for (let i = 0; i <= n; i++)
        this.ball(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, r, r, tones)
    }
  }

  /** A picture: one character per pixel, a colour per character, `.` empty */
  sprite(rows: string[], x: number, y: number, colors: Record<string, Rgb>, flip = false) {
    rows.forEach((row, j) =>
      [...(flip ? [...row].reverse().join('') : row)].forEach((c, i) => {
        if (colors[c]) this.set(Math.round(x) + i, Math.round(y) + j, colors[c])
      }),
    )
  }

  /** Another raster, its point (sx, sy) put at (dx, dy), turned by `angle` and scaled */
  blit(src: Raster, sx: number, sy: number, dx: number, dy: number, angle = 0, kx = 1, ky = 1) {
    const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
    const reach = Math.hypot(src.w, src.h) * Math.max(Math.abs(kx), Math.abs(ky)) + 1
    for (let y = Math.floor(dy - reach); y < dy + reach; y++)
      for (let x = Math.floor(dx - reach); x < dx + reach; x++) {
        const [rx, ry] = [x + 0.5 - dx, y + 0.5 - dy]
        const color = src.at(sx + (cos * rx + sin * ry) / kx, sy + (-sin * rx + cos * ry) / ky)
        if (color) this.set(x, y, color)
      }
  }

  /** Another raster of the same size laid over this one, where it is painted */
  over(layer: Raster) {
    layer.cells.forEach((color, i) => {
      if (color) this.cells[i] = color
    })
    return this
  }

  /** Its pixels as image data (into `image` when given, else a new one), empty ones clear */
  toImage(ctx: CanvasRenderingContext2D, image = ctx.createImageData(this.w, this.h)) {
    image.data.fill(0)
    this.cells.forEach((color, i) => {
      if (!color) return
      const n = parseInt(color.slice(1), 16)
      image.data.set([n >> 16, (n >> 8) & 255, n & 255, 255], i * 4)
    })
    return image
  }

  /** A copy, to paint over without touching this one */
  copy() {
    const copy = new Raster(this.w, this.h)
    copy.cells.splice(0, copy.cells.length, ...this.cells)
    return copy
  }

  /** A one-pixel outline around everything painted so far */
  outline(color: Rgb) {
    const edge: number[] = []
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++)
        if (
          !this.cells[y * this.w + x] &&
          (this.at(x - 1, y) || this.at(x + 1, y) || this.at(x, y - 1) || this.at(x, y + 1))
        )
          edge.push(y * this.w + x)
    for (const i of edge) this.cells[i] = color
  }
}

// ── Colours

const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0')
/** a towards b, p of the way */
export function mix(a: Rgb, b: Rgb, p: number): Rgb {
  const [x, y] = [parseInt(a.slice(1), 16), parseInt(b.slice(1), 16)]
  const ch = (n: number, s: number) => (n >> s) & 255
  return `#${[16, 8, 0].map((s) => hex(ch(x, s) + (ch(y, s) - ch(x, s)) * p)).join('')}`
}
/** A material's three tones from its base colour */
export const shades = (base: Rgb, dark = 0.3, light = 0.35): Tones => [
  mix(base, '#000000', dark),
  base,
  mix(base, '#ffffff', light),
]

/** The outline, a little lighter on a dark page so it parts from it (the halo does the rest) */
export const outlineOf = (dark: boolean) => (dark ? '#0f0f0f' : '#242424')

// The site's palette (theme.css), what the cameos are made of
export const PAL = {
  orange: '#d4825d',
  rust: '#a64d2e',
  cream: '#f8ddb8',
  red: '#e06060',
  pink: '#ff9aa8',
  yellow: '#ffdf61',
  gold: '#e6c654',
  green: '#6bc97f',
  blue: '#7ab8ff',
  purple: '#c79bff',
  cyan: '#8abfb8',
  steel: '#999999',
  paper: '#f5f5f5',
  wood: '#a0673d',
} as const

// ── Time

export const clamp = (p: number) => Math.min(1, Math.max(0, p))
/** Where t is between a and b (0 to 1), eased out */
export const ease = (t: number, a: number, b: number) => 1 - (1 - clamp((t - a) / (b - a))) ** 3
/** Eased in and out */
export const smooth = (t: number, a: number, b: number) => {
  const p = clamp((t - a) / (b - a))
  return p * p * (3 - 2 * p)
}
/** A pop: 0 before a, overshoots past 1, settles at 1 */
export const pop = (t: number, a: number, d = 260) => {
  const p = clamp((t - a) / d)
  return p === 0 ? 0 : 1 + 2.2 * (p - 1) ** 3 + 1.2 * (p - 1) ** 2
}
/** A pseudo-random number per seed, the same from frame to frame */
export const rand = (seed: number) => {
  const n = Math.sin(seed * 91.7 + 13.1) * 47453.5453
  return n - Math.floor(n)
}
/** A hop from a to a + d: its height (0 to 1 to 0) and its squash (k > 0) or stretch (k < 0),
 * with a crouch before and a squash after */
export function hop(t: number, a: number, d: number) {
  const crouch = d * 0.25
  if (t < a || t > a + d + 260) return { up: 0, k: 0 }
  if (t < a + crouch) return { up: 0, k: 0.14 * ease(t, a, a + crouch) }
  if (t < a + d) {
    const p = (t - a - crouch) / (d - crouch)
    return { up: 4 * p * (1 - p), k: -0.1 * (1 - p) }
  }
  const p = (t - a - d) / 260
  return { up: 0, k: 0.16 * Math.cos(p * Math.PI * 1.5) * (1 - p) }
}

// ── Little things

// Three by five
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
  '+': ['...', '.#.', '###', '.#.', '...'],
  '!': ['.#.', '.#.', '.#.', '...', '.#.'],
}
/** A word in the three by five font, `k` pixels a dot */
export function text(art: Raster, word: string, x: number, y: number, color: Rgb, k = 1) {
  ;[...word].forEach((ch, n) =>
    GLYPHS[ch]?.forEach((row, j) =>
      [...row].forEach((p, i) => {
        if (p === '#') art.rect(x + (n * 4 + i) * k, y + j * k, k, k, color)
      }),
    ),
  )
}

/** A twinkle: a cross that grows and shrinks over `d` ms from a */
export function twinkle(
  art: Raster,
  x: number,
  y: number,
  t: number,
  a: number,
  color: Rgb,
  d = 500,
) {
  if (t < a || t > a + d) return
  const r = Math.round(2.5 * Math.sin(((t - a) / d) * Math.PI))
  for (let i = -r; i <= r; i++) {
    art.set(x + i, y, color)
    art.set(x, y + i, color)
  }
}

/** A heart, about 2s wide, its point at the bottom */
export function heart(art: Raster, cx: number, cy: number, s: number, tones: Tones) {
  art.poly(
    [
      [cx - s * 1.05, cy - s * 0.15],
      [cx + s * 1.05, cy - s * 0.15],
      [cx, cy + s * 1.15],
    ],
    tones[0],
  )
  art.ball(cx - s * 0.52, cy - s * 0.35, s * 0.6, s * 0.6, tones)
  art.ball(cx + s * 0.52, cy - s * 0.35, s * 0.6, s * 0.6, tones)
}

/** Bits flung out from (x, y) at a, falling, gone by `life` ms */
export function burst(
  art: Raster,
  x: number,
  y: number,
  t: number,
  a: number,
  colors: Rgb[],
  { n = 14, speed = 0.05, gravity = 0.00005, life = 650, seed = 1 } = {},
) {
  const dt = t - a
  if (dt < 0 || dt > life) return
  for (let i = 0; i < n; i++) {
    if (rand(seed * 31 + i) * life < dt) continue
    const angle = (i / n) * 2 * Math.PI + rand(seed + i) * 0.5
    const v = speed * (0.6 + rand(seed * 7 + i) * 0.8)
    const size = i % 3 ? 1 : 2
    art.rect(
      x + Math.cos(angle) * v * dt,
      y + Math.sin(angle) * v * dt + gravity * dt * dt,
      size,
      size,
      colors[i % colors.length]!,
    )
  }
}
