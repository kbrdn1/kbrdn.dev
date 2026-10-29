// The activity feed: a bell hangs from its bracket in the header; it rings, swinging, its
// clapper knocking, sound arcs on each side; a red badge pops on it and counts 1, 2, 3; it
// settles, the badge pops away in a sparkle, and it folds back
import { ease, outlineOf, PAL, pop, Raster, shades, text, twinkle, type Cameo } from './art'

const RINGS = [500, 1300, 2100] as const
const RING = 650
const CLEAR = 3200

// The bell, 24 × 24, hanging from its top (12, 1): dome, flared lip, the clapper under it
function bell(dark: boolean, clapper: number) {
  const art = new Raster(24, 26)
  const gold = shades(PAL.gold, 0.3, 0.45)
  art.ball(12, 2, 1.6, 1.6, shades(dark ? '#9a9a9a' : '#7a7a7a', 0.3, 0.3))
  art.ball(12, 11, 7, 8, gold, 15)
  art.cylinder(5, 12, 14, 4, gold)
  art.poly(
    [
      [3, 19],
      [21, 19],
      [19, 15],
      [5, 15],
    ],
    gold[1],
  )
  art.rect(3, 19, 18, 1, gold[0])
  art.ball(12 + clapper * 2, 21.5, 2, 2, shades('#7a5a2a', 0.3, 0.35))
  art.outline(outlineOf(dark))
  return art
}

export const bellCameo: Cameo = {
  w: 48,
  h: 46,
  duration: 4200,
  origin: [24, 46],
  spread: 26,
  paint(t, dark) {
    const art = new Raster(48, 46)
    // The bracket it hangs from
    const steel = shades(dark ? '#8a8a8a' : '#9a9a9a', 0.3, 0.4)
    art.box(18, 8, 12, 2, steel)
    art.rect(23, 10, 2, 3, steel[0])
    art.outline(outlineOf(dark))

    // Each ring: a swing that dies down, the clapper lagging behind
    let angle = 0
    let clapper = 0
    for (const at of RINGS) {
      const dt = t - at
      if (dt < 0 || dt > RING) continue
      const fade = 1 - dt / RING
      angle = 0.45 * Math.sin(dt / 55) * fade
      clapper = -Math.sin(dt / 55 - 0.8) * fade
    }
    art.blit(bell(dark, clapper), 12, 1, 24, 12, angle)

    // Sound arcs on both sides while it rings
    const ringing = RINGS.some((at) => t >= at && t < at + RING * 0.8)
    if (ringing) {
      const arc = dark ? '#9a9a9a' : '#b0b0b0'
      for (const s of [-1, 1])
        for (let k = 0; k < 2; k++) {
          const r = 15 + k * 4 + ((t / 60) % 3)
          for (let a = -0.5; a <= 0.5; a += 0.08)
            art.set(24 + s * Math.cos(a) * r, 25 + Math.sin(a) * r, arc)
        }
    }

    // The badge: pops at the first ring, counts each ring, pops away once it settles
    const shown = pop(t, RINGS[0] + 100, 260) * (1 - ease(t, CLEAR, CLEAR + 200))
    if (shown > 0.2) {
      const count = RINGS.filter((at) => t >= at + 100).length
      const bump = 1 + 0.3 * Math.max(0, 1 - Math.abs(t - RINGS[count - 1]! - 160) / 140)
      const r = 4.2 * shown * bump
      const badge = new Raster(48, 46)
      badge.ball(33, 12, r, r, shades(PAL.red, 0.3, 0.35))
      badge.outline(outlineOf(dark))
      art.over(badge)
      if (shown > 0.8) text(art, String(count), 32, 10, '#ffffff')
    }
    twinkle(art, 33, 12, t, CLEAR + 100, PAL.yellow, 450)
    return art
  },
}
