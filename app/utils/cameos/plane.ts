// Contact form: a written sheet stands on the card; its top corners fold down to the middle,
// it folds in half, turns on its side into a paper plane, which takes off on a loop with a
// dotted trail and flies away into the distance; a green tick pops where it was: sent
import { mix, outlineOf, PAL, pop, Raster, shades, smooth, twinkle, type Cameo } from './art'

type Point = [number, number]
const CORNERS = [500, 1100] as const
const HALF = [1300, 1900] as const
const TURN = [2050, 2500] as const
const FLY = [2700, 4300] as const
const SENT = 4450

// A crease a shade under the paper's shadow
const mixDark = (paper: [string, string, string]) => mix(paper[0], '#000000', 0.15)
const mixPoint = ([x0, y0]: Point, [x1, y1]: Point, p: number): Point => [
  x0 + (x1 - x0) * p,
  y0 + (y1 - y0) * p,
]

// The sheet, its bottom middle at (0, 0), 20 wide and 24 tall: up is negative. Its corners
// fold down about the lines from (±10, −14) to (0, −24), each landing on (0, −14).
function sheet(
  art: Raster,
  ox: number,
  oy: number,
  corners: number,
  half: number,
  paper: [string, string, string],
) {
  const at = ([x, y]: Point): Point => [ox + x, oy + y]
  // Folding in half: the right half swings over the left, its x times cos
  const fold = Math.cos(half * Math.PI)
  const right = ([x, y]: Point): Point => at([x * fold, y])
  const flap = (s: number, map: (p: Point) => Point) => {
    const corner: Point = [s * 10, -24]
    const middle: Point = [s * 5, -19]
    const c = Math.cos(corners * Math.PI)
    const tip = mixPoint(middle, corner, c)
    art.poly([map([s * 10, -14]), map([0, -24]), map(tip)], c >= 0 ? paper[1] : paper[0])
    // Its creases, so it reads as folded over the front
    art.line(...map([s * 10, -14]), ...map(tip), paper[0])
    art.line(...map([0, -24]), ...map(tip), paper[0])
    art.line(...map([s * 10, -14]), ...map([0, -24]), mixDark(paper))
  }
  // The left half, its flap; the right half over it, its flap
  art.poly([at([-10, 0]), at([-10, -14]), at([0, -24]), at([0, 0])], paper[1])
  art.line(ox + 0, oy - 23, ox + 0, oy, paper[0])
  flap(-1, at)
  art.poly(
    [right([0, 0]), right([0, -24]), right([10, -14]), right([10, 0])],
    fold >= 0 ? paper[1] : paper[0],
  )
  flap(1, right)
  // What is written on it, while its front still shows
  if (half < 0.3 && corners < 0.5)
    for (let y = -20; y < -3; y += 3)
      art.line(ox - 7, oy + y, ox + 7 - (y === -5 ? 6 : 0), oy + y, '#9a9a9a')
}

// The plane, 26 × 12, nose to the right: its wing, the fold along its body
function plane(dark: boolean) {
  const art = new Raster(27, 12)
  const paper = shades(PAL.paper, 0.18, 0.5)
  art.poly(
    [
      [1, 1],
      [26, 7],
      [1, 6],
    ],
    paper[2],
  )
  art.poly(
    [
      [1, 6],
      [26, 7],
      [8, 11],
    ],
    paper[0],
  )
  art.line(1, 6, 26, 7, paper[0])
  art.outline(outlineOf(dark))
  return art
}

// Its flight, s from 0 to 1: off to the right, a loop half way, away up to the right
function path(s: number): Point {
  const loop = smooth(s, 0.3, 0.65) * 2 * Math.PI
  return [8 + 64 * s + 10 * Math.sin(loop), 40 - 26 * s - 10 * (1 - Math.cos(loop))]
}

export const planeCameo: Cameo = {
  w: 84,
  h: 56,
  duration: 5600,
  origin: [18, 56],
  spread: 30,
  paint(t, dark) {
    const art = new Raster(84, 56)
    const g = 55
    const paper = shades(PAL.paper, 0.18, 0.5)

    // Folding: the corners, the half; then it turns on its side into the plane
    const turn = smooth(t, TURN[0], TURN[1])
    if (t < TURN[1]) {
      const fold = new Raster(24, 27)
      sheet(fold, 12, 26, smooth(t, CORNERS[0], CORNERS[1]), smooth(t, HALF[0], HALF[1]), paper)
      fold.outline(outlineOf(dark))
      art.blit(fold, 12, 26, 18, g + 1, turn * (Math.PI / 2))
    }
    // The plane: sitting where the sheet was, a wobble, then off along its path
    if (t >= TURN[1]) {
      const s = smooth(t, FLY[0], FLY[1])
      const [x, y] = path(s)
      const [nx, ny] = path(Math.min(1, s + 0.01))
      const angle = s > 0 && s < 1 ? Math.atan2(ny - y, nx - x) : Math.sin(t / 60) * 0.06
      // Its trail: dots where it went, the oldest gone first
      for (let k = 1; k <= 12; k++) {
        const back = s - k * 0.018
        if (back <= 0 || k > 12 - Math.floor((s * 14) / 3)) continue
        const [tx, ty] = path(back)
        if (k % 2) art.set(tx, ty + 2, dark ? '#777777' : '#b0b0b0')
      }
      // Smaller and smaller over its last stretch, far away, then a star where it went
      const far = 1 - smooth(s, 0.7, 1) * 0.85
      if (s < 1)
        art.blit(plane(dark), 13, 6, s === 0 ? 18 : x, s === 0 ? g - 6 : y, angle, far, far)
      const end = path(1)
      twinkle(art, end[0], end[1], t, FLY[1] - 40, '#ffffff', 450)
    }

    // Sent: a green tick pops where the sheet stood
    const shown = pop(t, SENT, 300)
    if (shown > 0) {
      const tick = new Raster(14, 12)
      const green = shades(PAL.green, 0.3, 0.35)
      tick.stroke(
        [
          [2, 6],
          [5, 9],
          [11, 2],
        ],
        1.6,
        green,
      )
      tick.outline(outlineOf(dark))
      art.blit(tick, 7, 11, 18, g, 0, shown, shown)
      twinkle(art, 28, g - 14, t, SENT + 200, PAL.yellow)
      twinkle(art, 9, g - 12, t, SENT + 450, '#ffffff')
    }
    return art
  },
}
