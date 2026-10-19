// Génère public/images/og/dither.png : le champ dither du site, figé, pour les images
// OG (satori ne fait pas tourner de canvas). Même bruit, même matrice de Bayer et mêmes
// niveaux d'alpha que UiDitherCanvas, seed fixe pour que l'image soit reproductible,
// fondu vers le bas comme le fond des pages.
//
// usage: bun scripts/og-dither.ts   (puis scripts/og-smoke.sh --update après un build)
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BAYER_4, NOISE_H, NOISE_W, noiseTexture } from '../app/utils/dither'

const W = 1200
const H = 630
const CELL = 4
const ALPHAS = [0, 0.06, 0.12, 0.18]
const [R, G, B] = [0xd4, 0x82, 0x5d] // --ui-primary

const cols = W / CELL
const rows = Math.ceil(H / CELL)
const noise = noiseTexture(0x51a7e3c9, 3)
const rgba = new Uint8Array(cols * rows * 4)

for (let y = 0; y < rows; y++) {
  const t = y / (rows - 1)
  // A notch denser than the live field at the top: the image is small and static.
  const floor = 0.4 + 0.5 * t * t // fade="down"
  // The pages' mask: opaque down to 55%, gone at 85%.
  const mask = Math.min(1, Math.max(0, (0.85 - t) / 0.3))
  for (let x = 0; x < cols; x++) {
    const value =
      noise[(y & (NOISE_H - 1)) * NOISE_W + (x & (NOISE_W - 1))]! * 0.65 +
      noise[((2 * y) & (NOISE_H - 1)) * NOISE_W + ((2 * x) & (NOISE_W - 1))]! * 0.35
    const u = (value - floor) * 4.2
    const level = u > 0 ? Math.min(3, (u * 3 + BAYER_4[((y & 3) << 2) | (x & 3)]!) | 0) : 0
    rgba.set([R, G, B, Math.round(ALPHAS[level]! * mask * 255)], (y * cols + x) * 4)
  }
}

const raw = join(tmpdir(), 'og-dither.rgba')
writeFileSync(raw, rgba)
execFileSync('magick', [
  '-size',
  `${cols}x${rows}`,
  '-depth',
  '8',
  `rgba:${raw}`,
  '-filter',
  'point',
  '-resize',
  `${CELL * 100}%`,
  '-crop',
  `${W}x${H}+0+0`,
  '+repage',
  '-strip',
  'public/images/og/dither.png',
])
console.log('public/images/og/dither.png')
