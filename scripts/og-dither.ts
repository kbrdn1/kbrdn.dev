// Génère public/images/og/dither.png (et dither-blog.png, avec le bleu du blog) : le champ
// dither du site, figé, pour les images OG (satori ne fait pas tourner de canvas). Même bruit, même matrice de Bayer et mêmes
// niveaux d'alpha que UiDitherCanvas, seed fixe pour que l'image soit reproductible, fondu
// vers le bas comme sous les fiches des bannières des repos (~/.claude/skills/me/_banner-kit).
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
const PRIMARY = [0xd4, 0x82, 0x5d] // --ui-primary
const SKY = [0x38, 0xbd, 0xf8] // the blog's second colour (layouts/blog.vue)

const cols = W / CELL
const rows = Math.ceil(H / CELL)
const noise = noiseTexture(0x51a7e3c9, 3)

// The field, with `alt`'s patches where UiDitherCanvas puts them: the noise again, coarse
function field(file: string, alt?: number[]) {
  const rgba = new Uint8Array(cols * rows * 4)
  for (let y = 0; y < rows; y++) {
    const t = y / (rows - 1)
    // The banners' field: denser than the live one (the image is small and static), fading
    // out towards the bottom, gone at 90%
    const floor = 0.42 + 0.55 * t * t
    const mask = Math.min(1, Math.max(0, (0.9 - t) / 0.35))
    for (let x = 0; x < cols; x++) {
      const value =
        noise[(y & (NOISE_H - 1)) * NOISE_W + (x & (NOISE_W - 1))]! * 0.65 +
        noise[((2 * y) & (NOISE_H - 1)) * NOISE_W + ((2 * x) & (NOISE_W - 1))]! * 0.35
      const u = (value - floor) * 4.2
      const level = u > 0 ? Math.min(3, (u * 3 + BAYER_4[((y & 3) << 2) | (x & 3)]!) | 0) : 0
      const tone =
        alt && noise[((y >> 2) & (NOISE_H - 1)) * NOISE_W + ((x >> 2) & (NOISE_W - 1))]! > 0.6
          ? alt
          : PRIMARY
      rgba.set([...tone, Math.round(ALPHAS[level]! * mask * 255)], (y * cols + x) * 4)
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
    file,
  ])
  console.log(file)
}

field('public/images/og/dither.png')
field('public/images/og/dither-blog.png', SKY)
