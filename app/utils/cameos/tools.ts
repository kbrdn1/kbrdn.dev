// Tools: two gears turn slowly, meshed; a wrench pops up, takes the big one's bolt and cranks
// it three times, a spark at each click; the gears take off and spin fast, the wrench is flung
// away twirling into a sparkle; they slow down, the bolt shines, and down
import {
  burst,
  ease,
  outlineOf,
  PAL,
  pop,
  Raster,
  shades,
  smooth,
  twinkle,
  type Cameo,
  type Tones,
} from './art'

const IN = [700, 1200] as const
const CRANKS = [1300, 1750, 2200] as const
const FLING = 2700
const SPIN = [2700, 2950, 3800, 4700] as const

// A gear: its teeth, a sunken ring, lit like a disc; the axle's hole left for the bolt
function gear(
  art: Raster,
  cx: number,
  cy: number,
  r: number,
  teeth: number,
  phase: number,
  tones: Tones,
) {
  const tip = r + 2.6
  for (let y = Math.floor(cy - tip); y < cy + tip; y++)
    for (let x = Math.floor(cx - tip); x < cx + tip; x++) {
      const [dx, dy] = [x + 0.5 - cx, y + 0.5 - cy]
      const d = Math.hypot(dx, dy)
      const tooth = Math.cos(teeth * (Math.atan2(dy, dx) - phase)) > 0.2
      if (d > tip || (d > r && !tooth)) continue
      const [nx, ny] = [dx / tip, dy / tip]
      let light = -0.45 * nx - 0.6 * ny + 0.66 * Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))
      // The sunken ring, and the teeth a little darker than the face
      if (d > r * 0.45 && d < r * 0.72) light -= 0.35
      if (d > r) light -= 0.12
      light += ((x + y) & 1) * 0.08
      art.set(x, y, tones[light > 0.8 ? 2 : light > 0.32 ? 1 : 0])
    }
}

// The bolt: a hexagon turned with its gear
function bolt(art: Raster, cx: number, cy: number, phase: number, tones: Tones) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = phase + (i * Math.PI) / 3
    return [cx + Math.cos(a) * 2.6, cy + Math.sin(a) * 2.6] as [number, number]
  })
  art.poly(points, tones[2])
  art.set(cx, cy, tones[0])
}

// A wrench lying left to right: its open jaw on the left around (4.5, 5), the ring on the right
function wrench(dark: boolean) {
  const art = new Raster(32, 11)
  const steel = shades(dark ? '#b8b8b8' : '#a0a0a0', 0.32, 0.4)
  art.ball(4.5, 5.5, 4.5, 4.5, steel)
  art.box(7, 4, 20, 3, steel)
  art.ball(27, 5.5, 3.6, 3.6, steel)
  // The jaw's mouth, and the ring's hole
  for (let y = 4; y < 7; y++) for (let x = 0; x < 4; x++) art.set(x, y, undefined)
  for (let y = 4; y < 7; y++) for (let x = 26; x < 28; x++) art.set(x, y, undefined)
  art.outline(outlineOf(dark))
  return art
}

// The big gear's turn: slow, a crank's worth at each push, fast after, slowing down again
function turned(t: number) {
  let phase = 0.0006 * t
  for (const at of CRANKS) phase += 0.35 * smooth(t, at + 60, at + 330)
  // The fast spin, added up 20 ms at a time
  for (let s = SPIN[0]; s < Math.min(t, SPIN[3]); s += 20)
    phase += 0.12 * ease(s, SPIN[0], SPIN[1]) * (1 - smooth(s, SPIN[2], SPIN[3]))
  return phase
}

export const tools: Cameo = {
  w: 66,
  h: 56,
  duration: 5600,
  origin: [30, 56],
  spread: 32,
  paint(t, dark) {
    const art = new Raster(66, 56)
    const steel = shades(dark ? '#8a8a8a' : '#9a9a9a', 0.35, 0.45)
    const brass = shades(PAL.gold, 0.3, 0.4)
    const phase = turned(t)
    const big = { x: 24, y: 40, r: 11, teeth: 10 }
    const small = { x: 43, y: 47, r: 6, teeth: 6 }
    gear(
      art,
      small.x,
      small.y,
      small.r,
      small.teeth,
      -phase * (big.teeth / small.teeth) + 0.3,
      brass,
    )
    gear(art, big.x, big.y, big.r, big.teeth, phase, steel)
    bolt(art, big.x, big.y, phase, steel)
    art.outline(outlineOf(dark))

    // The wrench: in from the top right onto the bolt, three pushes, then flung up and away
    // spinning. Its handle points up and right from the bolt.
    let angle = -0.7
    let [x, y] = [big.x, big.y]
    let size = 1
    if (t < IN[1]) {
      // It pops up beside the bolt, swinging onto it
      size = pop(t, IN[0], 300)
      ;[x, y] = [big.x + 6 * (1 - ease(t, IN[0], IN[1])), big.y - 4 * (1 - ease(t, IN[0], IN[1]))]
      angle = -1.3 + 0.6 * ease(t, IN[0], IN[1])
    } else if (t < FLING) {
      for (const at of CRANKS)
        angle += 0.55 * smooth(t, at + 60, at + 330) * (1 - smooth(t, at + 340, at + 420))
    } else {
      // Flung up and right, twirling, smaller and smaller, gone in a sparkle
      const dt = t - FLING
      ;[x, y] = [big.x + dt * 0.035, big.y - dt * 0.05]
      angle = -0.7 + dt * 0.018
      size = 1 - smooth(t, FLING, FLING + 650)
    }
    if (t >= IN[0] && size > 0.12) art.blit(wrench(dark), 4.5, 5.5, x, y, angle, size, size)
    twinkle(art, big.x + 23, big.y - 33, t, FLING + 600, '#ffffff', 450)

    // A spark at each click, the bolt shining once still
    CRANKS.forEach((at, i) =>
      burst(art, big.x + 3, big.y - 4, t, at + 330, [PAL.yellow, PAL.orange, '#ffffff'], {
        n: 8,
        speed: 0.06,
        life: 380,
        seed: i + 3,
      }),
    )
    // Fast: sparks where the teeth meet
    if (t > SPIN[1] && t < SPIN[2])
      burst(
        art,
        35,
        44,
        t,
        SPIN[1] + Math.floor((t - SPIN[1]) / 300) * 300,
        [PAL.yellow, PAL.orange],
        { n: 5, speed: 0.04, life: 300, seed: Math.floor(t / 300) },
      )
    twinkle(art, big.x - 2, big.y - 3, t, 4850, '#ffffff', 450)
    return art
  },
}
