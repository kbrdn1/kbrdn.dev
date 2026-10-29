// Now: an hourglass stands on the card, its sand running down in a thin stream; once most of it
// has run, it hops and turns over, lands with a squash, and runs again
import { hop, outlineOf, PAL, Raster, shades, smooth, type Cameo } from './art'

const RUN = [300, 2600] as const
const TURN = [2650, 3450] as const
const AGAIN = [3500, 5400] as const

// The hourglass, 24 × 34: wooden plates and posts, the glass, the sand: `fallen` of it run
// down, the stream on or off
function hourglass(dark: boolean, fallen: number, running: boolean, t: number) {
  const art = new Raster(24, 34)
  const wood = shades(PAL.wood, 0.35, 0.35)
  const sand = shades('#e8c27a', 0.2, 0.35)
  const glass = dark ? '#7f9aa3' : '#a9c6cf'
  // The glass's half width at each row: wide at both ends, a neck in the middle
  const half = (y: number) => 1 + 6.5 * Math.abs(Math.cos((Math.PI * (y - 3)) / 27)) ** 0.7
  for (let y = 3; y <= 30; y++) {
    const w = Math.round(half(y))
    // The sand above the neck: from its surface, which sinks as it runs, down to the neck
    const top = 4 + 11 * fallen
    // The mound below: as high as what has run
    for (let dx = -w + 1; dx < w; dx++) {
      const x = 12 + dx
      const mound = 30 - 13 * fallen * (1 - (dx / 7.5) ** 2 * 0.7)
      if ((y < 16 && y >= top + Math.abs(dx) * 0.15) || (y > 16 && y >= mound))
        art.set(x, y, sand[dx < -w / 3 ? 2 : dx > w / 3 ? 0 : 1])
    }
    art.set(12 - w, y, glass)
    art.set(12 + w, y, glass)
  }
  // The stream, grains running down it
  if (running)
    for (let y = 16; y < 30 - 13 * fallen; y++)
      if ((y + Math.floor(t / 40)) % 3) art.set(12, y, sand[1])
  // A glint on the glass
  art.line(7, 6, 7, 10, '#ffffff')
  art.line(7, 21, 7, 24, '#ffffff')
  // Posts and plates
  art.cylinder(2, 3, 2, 28, wood)
  art.cylinder(20, 3, 2, 28, wood)
  art.box(1, 0, 22, 3, wood)
  art.box(1, 31, 22, 3, wood)
  art.outline(outlineOf(dark))
  return art
}

export const hourglassCameo: Cameo = {
  w: 40,
  h: 56,
  duration: 5800,
  origin: [20, 56],
  spread: 26,
  paint(t, dark) {
    const art = new Raster(40, 56)
    const g = 55
    // Run, turn over (sand stays where it is while it turns), run again from what was left
    const first = 0.12 + 0.72 * smooth(t, RUN[0], RUN[1])
    const turned = t >= TURN[1]
    const fallen = turned ? 1 - first + 0.55 * smooth(t, AGAIN[0], AGAIN[1]) : first
    const running = (t >= RUN[0] && t < RUN[1]) || (t >= AGAIN[0] && t < AGAIN[1])
    const glass = hourglass(dark, Math.min(1, fallen), running, t)
    const leap = hop(t, TURN[0], TURN[1] - TURN[0])
    const angle = turned ? 0 : smooth(t, TURN[0] + 150, TURN[1]) * Math.PI
    // Turned over, its sand is drawn as it now lies: the glass the right way up again
    art.blit(glass, 12, 17, 20, g - 16.5 - leap.up * 10, angle, 1 + leap.k * 0.6, 1 - leap.k)
    return art
  },
}
