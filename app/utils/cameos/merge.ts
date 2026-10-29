// Open source: a git graph grows in the header: main runs along, a purple branch curves off
// it, three commits pop on the branch one after another, the branch curves back and merges
// with a pulsing merge commit; a star pops over it with a "+1", and it all folds back
import { ease, outlineOf, PAL, pop, Raster, shades, smooth, text, twinkle, type Cameo } from './art'

const MAIN = 30
const BRANCH = 18
const OFF = [300, 700] as const
const COMMITS = [900, 1300, 1700] as const
const BACK = [2000, 2400] as const
const MERGE = 2450
const STAR = 2800

// A point of the branch as it curves off main (s from 0 to 1, along x from 10 to 52)
function branchAt(s: number): [number, number] {
  const x = 10 + 42 * s
  // Up from main over the first fifth, along, back down over the last fifth
  const lift = smooth(s, 0, 0.22) * (1 - smooth(s, 0.78, 1))
  return [x, MAIN - (MAIN - BRANCH) * lift]
}

export const merge: Cameo = {
  w: 68,
  h: 44,
  duration: 4600,
  origin: [32, 44],
  spread: 26,
  paint(t, dark) {
    const art = new Raster(68, 44)
    const line = dark ? '#7a7a7a' : '#9a9a9a'
    const purple = shades(PAL.purple, 0.3, 0.35)
    const grey = shades(dark ? '#8a8a8a' : '#b0b0b0', 0.3, 0.35)

    // Main, drawn along from the left, its commits
    art.stroke(
      [
        [4, MAIN],
        [4 + 60 * ease(t, 0, 400), MAIN],
      ],
      0.9,
      shades(line, 0.2, 0.2),
    )
    for (const x of [6, 22, 62]) if (t > (x / 64) * 400) art.ball(x, MAIN, 2.3, 2.3, grey)

    // The branch: out as it grows, along with its commits, back into main
    const grown =
      0.22 * ease(t, OFF[0], OFF[1]) +
      0.56 * smooth(t, COMMITS[0] - 200, COMMITS[2]) +
      0.22 * ease(t, BACK[0], BACK[1])
    if (grown > 0) {
      const points: [number, number][] = []
      for (let s = 0; s <= grown; s += 0.02) points.push(branchAt(s))
      art.stroke(points, 0.9, purple)
    }
    COMMITS.forEach((at, i) => {
      const size = pop(t, at, 240)
      if (size <= 0) return
      const [x, y] = branchAt(0.3 + i * 0.2)
      art.ball(x, y, 2.4 * size, 2.4 * size, purple)
    })
    // The merge commit: a ring on main where the branch comes back, pulsing
    const merged = pop(t, MERGE, 300)
    if (merged > 0) {
      const pulse =
        1 + 0.25 * Math.max(0, Math.sin((t - MERGE) / 90)) * (1 - ease(t, MERGE, MERGE + 900))
      art.ball(52, MAIN, 3.6 * merged * pulse, 3.6 * merged * pulse, purple)
      art.ball(52, MAIN, 1.4 * merged, 1.4 * merged, shades('#ffffff', 0.1, 0))
    }
    art.outline(outlineOf(dark))

    // The star over the merge, popping, a "+1" beside it
    const star = pop(t, STAR, 300)
    if (star > 0) {
      const gold = shades(PAL.yellow, 0.25, 0.5)
      const [cx, cy] = [52, 9 - 2 * ease(t, STAR, STAR + 600)]
      const points = Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        const r = (i % 2 ? 2.4 : 5.5) * star
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as [number, number]
      })
      const piece = new Raster(68, 44)
      piece.poly(points, gold[1])
      for (let y = 0; y < 44; y++)
        for (let x = 0; x < cx; x++) if (piece.at(x, y)) piece.set(x, y, gold[2])
      piece.outline(outlineOf(dark))
      art.over(piece)
      text(art, '+1', cx + 8, cy - 3, PAL.green)
    }
    twinkle(art, 40, 6, t, STAR + 200, '#ffffff', 450)
    twinkle(art, 62, 14, t, STAR + 450, PAL.yellow, 450)
    return art
  },
}
