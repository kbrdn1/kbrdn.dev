// The CV: a printer stands in the card; its light blinks, a sheet comes up out of it line by
// line (the name in orange, then the rest), slides off onto the card beside it, a green tick
// is stamped on it, and it all folds back
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
} from './art'

const PRINT = [500, 2100] as const
const OFF = [2300, 2800] as const
const STAMP = 3000

// The sheet, 16 × 20: a CV, its name in orange, its lines in grey
function sheet(dark: boolean) {
  const art = new Raster(16, 20)
  art.box(0, 0, 16, 20, shades('#ffffff', 0.1, 0))
  art.rect(3, 3, 8, 2, PAL.orange)
  for (const [y, w] of [
    [7, 10],
    [9, 7],
    [12, 10],
    [14, 9],
    [16, 6],
  ] as const)
    art.rect(3, y, w, 1, '#a0a0a0')
  art.outline(outlineOf(dark))
  return art
}

export const printer: Cameo = {
  w: 64,
  h: 46,
  duration: 4200,
  origin: [22, 46],
  spread: 26,
  paint(t, dark) {
    const art = new Raster(64, 46)
    const g = 45
    const body = shades(dark ? '#b8b8b8' : '#d8d8d8', 0.25, 0.4)
    const slot: [number, number] = [22, g - 15]

    // The paper waiting in its tray at the back, the body, the slot, the light
    art.box(13, g - 22, 18, 9, shades(PAL.paper, 0.12, 0.5))
    art.box(6, g - 15, 32, 13, body)
    art.box(8, g - 4, 28, 4, shades(dark ? '#8a8a8a' : '#a8a8a8', 0.3, 0.3))
    art.rect(12, slot[1], 20, 1, '#3a3a3a')
    const printing = t >= PRINT[0] && t < PRINT[1]
    art.ball(
      33,
      g - 10,
      1.4,
      1.4,
      printing && Math.floor(t / 160) % 2
        ? shades(PAL.green, 0.2, 0.4)
        : shades('#6a6a6a', 0.2, 0.3),
    )
    art.outline(outlineOf(dark))

    // The sheet: up out of the slot as it prints, the top first, then off to the right
    const paper = sheet(dark)
    const out = smooth(t, PRINT[0], PRINT[1])
    const off = ease(t, OFF[0], OFF[1])
    if (out > 0 && off === 0) {
      const shown = Math.max(1, Math.round(20 * out))
      const cut = new Raster(16, shown)
      for (let j = 0; j < shown; j++) for (let i = 0; i < 16; i++) cut.set(i, j, paper.at(i, j))
      art.blit(cut, 8, shown, slot[0], slot[1], 0)
    } else if (off > 0) {
      const x = slot[0] + off * 24
      const y = slot[1] - Math.sin(off * Math.PI) * 10 + off * 15
      art.blit(paper, 8, 20, x, y, off * 0.12)
    }

    // The tick, stamped on the sheet once it lies beside the printer
    const tick = pop(t, STAMP, 300)
    if (tick > 0) {
      const mark = new Raster(14, 12)
      mark.stroke(
        [
          [2, 6],
          [5, 9],
          [11, 2],
        ],
        1.5,
        shades(PAL.green, 0.3, 0.35),
      )
      mark.outline(outlineOf(dark))
      art.blit(mark, 7, 6, slot[0] + 24, slot[1] + 5, 0, tick, tick)
    }
    burst(art, slot[0] + 24, slot[1] + 5, t, STAMP, [PAL.green, PAL.yellow], {
      n: 8,
      speed: 0.04,
      life: 400,
      seed: 6,
    })
    twinkle(art, slot[0] + 32, slot[1] - 6, t, STAMP + 250, PAL.yellow, 450)
    return art
  },
}
