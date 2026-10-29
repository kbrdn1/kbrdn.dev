// About: an instant camera grows out of the card, focuses (its lens comes out, the iris
// blinks), crouches, flashes; the picture slides out of its top, flies off, lands leaning
// against it and develops, from black to the site's K; a sparkle, a happy hop, and down
import { ease, hop, mix, outlineOf, PAL, Raster, shades, smooth, twinkle, type Cameo } from './art'

const FOCUS = [450, 900] as const
const IRIS = 1000
const SHOOT = 1250
const FLASH = 1400
const EJECT = [1550, 2150] as const
const FLY = [2150, 2650] as const
const DEVELOP = [2700, 4200] as const
const HOP = 4400

// The camera, 28 × 22: cream body, a rainbow stripe, the flash and the viewfinder on top, the
// lens out by `zoom` (0 to 1), its iris shut by `iris`
function camera(dark: boolean, zoom: number, iris: number, flash: boolean) {
  const art = new Raster(38, 30)
  const body = shades(PAL.paper, 0.14, 0.5)
  const black = dark ? shades('#3a3a3a', 0.35, 0.45) : shades('#2a2a2a', 0.4, 0.35)
  // The slot on top the picture comes out of, the body, its darker base
  art.box(10, 2, 18, 3, black)
  art.box(1, 5, 36, 24, body)
  art.rect(2, 25, 34, 3, body[0])
  // The stripe
  ;[PAL.red, PAL.orange, PAL.yellow, PAL.green, PAL.blue].forEach((c, i) =>
    art.rect(4 + i, 8, 1, 16, c),
  )
  // Flash and viewfinder
  art.box(27, 8, 7, 5, flash ? shades('#ffffff', 0, 0) : shades('#d8e6f0', 0.2, 0.4))
  art.box(13, 8, 5, 4, black)
  // The lens: its barrel, out as it focuses, the glass, the iris, two glints
  const r = 7 + 1.5 * zoom
  art.ball(21, 18, r + 2, r + 2, black)
  art.ball(21, 18, r, r, shades(PAL.blue, 0.55, 0.3))
  art.ball(21, 18, r * 0.45, r * 0.45, shades('#1e3a5f', 0.3, 0.2))
  if (iris > 0) art.ball(21, 18, r * iris, r * iris, black)
  art.rect(18, 14, 2, 1, '#ffffff')
  art.set(17, 15, '#ffffff')
  // The shutter button
  art.box(29, 2, 5, 3, shades(PAL.red, 0.3, 0.35))
  art.outline(outlineOf(dark))
  return art
}

// The picture: a white frame, the image from black to the K (the site's logo, its bar and its
// two orange pieces) as `develop` goes from 0 to 1
function picture(dark: boolean, develop: number) {
  const art = new Raster(18, 21)
  art.box(0, 0, 18, 21, shades('#ffffff', 0.12, 0))
  const s = 14 / 96
  const [x0, y0] = [2, 2]
  const at = (x: number, y: number): [number, number] => [x0 + x * s, y0 + y * s]
  const film = '#1f1f1f'
  art.rect(x0, y0, 14, 14, mix(film, '#f0e8dc', develop))
  art.poly([at(64, 0), at(96, 0), at(0, 96), at(0, 64)], mix(film, '#242424', develop))
  const orange = mix(film, PAL.orange, develop)
  art.poly([at(0, 0), at(24, 24), at(0, 48)], orange)
  art.poly([at(56, 56), at(96, 96), at(64, 96), at(40, 72)], orange)
  art.outline(outlineOf(dark))
  return art
}

export const cameraCameo: Cameo = {
  w: 66,
  h: 56,
  duration: 5400,
  origin: [20, 56],
  spread: 30,
  paint(t, dark) {
    const art = new Raster(66, 56)
    const zoom = ease(t, FOCUS[0], FOCUS[1]) * (1 - ease(t, 3600, 4000))
    const iris =
      Math.max(0, Math.sin(((t - IRIS) / 200) * Math.PI)) * (t >= IRIS && t < IRIS + 200 ? 1 : 0)
    const flash = t >= FLASH && t < FLASH + 120
    // A crouch before the shot and a kick after it, a hop at the end
    const crouch =
      t >= SHOOT && t < FLASH
        ? 0.12 * ease(t, SHOOT, FLASH)
        : t >= FLASH && t < FLASH + 200
          ? -0.08
          : 0
    const happy = hop(t, HOP, 420)
    const k = crouch + happy.k
    const cam = camera(dark, zoom, iris, flash)
    const [cx, base] = [20, 55 - Math.round(happy.up * 7)]
    art.blit(cam, 19, 29, cx, base + 0.5, 0, 1 + k * 0.6, 1 - k)

    // The picture: out of the slot, flung up and right, landing against the camera's side,
    // developing
    if (t >= EJECT[0]) {
      const out = ease(t, EJECT[0], EJECT[1])
      const fly = smooth(t, FLY[0], FLY[1])
      // Its bottom edge's middle: from the slot to the ground against the camera's right side
      const x = cx + fly * 28
      const y = base - 27 + fly * 27 - Math.sin(fly * Math.PI) * 12
      const angle = -0.22 * fly + Math.sin(fly * Math.PI) * 0.6
      const develop = smooth(t, DEVELOP[0], DEVELOP[1])
      // Behind the camera's top while it comes out
      const pic = picture(dark, develop)
      if (fly === 0) {
        const cut = new Raster(pic.w, Math.max(1, Math.round(pic.h * out)))
        for (let j = 0; j < cut.h; j++) for (let i = 0; i < pic.w; i++) cut.set(i, j, pic.at(i, j))
        art.blit(cut, 9, cut.h, x, base - 27, 0)
      } else art.blit(pic, 9, 21, x, y, angle)
    }

    // The flash: rays from the flash window, a white star
    if (t >= FLASH && t < FLASH + 260) {
      const p = (t - FLASH) / 260
      const [fx, fy] = [cx + 11, base - 19]
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * 2 * Math.PI
        const [r0, r1] = [3 + p * 6, 6 + p * 12]
        art.line(
          fx + Math.cos(a) * r0,
          fy + Math.sin(a) * r0,
          fx + Math.cos(a) * r1,
          fy + Math.sin(a) * r1,
          i % 2 ? PAL.yellow : '#ffffff',
        )
      }
    }
    twinkle(art, cx + 36, base - 26, t, 4250, PAL.yellow, 500)
    twinkle(art, cx + 22, base - 24, t, 4500, '#ffffff', 450)
    return art
  },
}
