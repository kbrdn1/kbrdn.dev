// Check de app/utils/dither.ts — la matrice de Bayer et le bruit qui pilotent
// UiDitherCanvas. Un bruit mal normalisé change la densité du fond sur toutes les
// pages sans casser ni le typecheck ni le build ; un bruit qui ne boucle pas
// laisse une couture verticale qui défile.
//
// usage: bun scripts/dither.test.ts
import assert from 'node:assert/strict'
import { BAYER_4, NOISE_H, NOISE_W, ditherNoise, noiseTexture } from '../app/utils/dither'

// Bayer : les 16 seuils k/16, chacun une fois.
assert.deepEqual(
  [...BAYER_4].sort((a, b) => a - b),
  Array.from({ length: 16 }, (_, k) => k / 16),
)

for (const [seed, cells] of [
  [0x5bd1e995, 3],
  [0x27d4eb2f, 7],
  [1, 4],
] as const) {
  const noise = noiseTexture(seed, cells)
  assert.equal(noise.length, NOISE_W * NOISE_H)
  assert.deepEqual(noiseTexture(seed, cells), noise, 'même seed, même texture')

  let min = 1
  let max = 0
  let mean = 0
  for (const v of noise) {
    min = Math.min(min, v)
    max = Math.max(max, v)
    mean += v
  }
  mean /= noise.length
  let variance = 0
  for (const v of noise) variance += (v - mean) ** 2
  const std = Math.sqrt(variance / noise.length)
  assert.ok(min >= 0 && max <= 1, `valeurs hors [0, 1] : ${min}..${max}`)
  assert.ok(Math.abs(mean - 0.5) < 0.01, `moyenne ${mean}, attendu 0.5`)
  assert.ok(Math.abs(std - 0.15) < 0.01, `écart-type ${std}, attendu 0.15`)

  // Tileable : le saut entre la dernière et la première colonne (ou ligne) ne
  // doit pas dépasser les sauts entre voisins à l'intérieur de la texture.
  let interior = 0
  let seamX = 0
  let seamY = 0
  for (let y = 0; y < NOISE_H; y++) {
    for (let x = 0; x < NOISE_W - 1; x++) {
      interior = Math.max(interior, Math.abs(noise[y * NOISE_W + x + 1]! - noise[y * NOISE_W + x]!))
    }
    seamX = Math.max(seamX, Math.abs(noise[y * NOISE_W]! - noise[y * NOISE_W + NOISE_W - 1]!))
  }
  for (let x = 0; x < NOISE_W; x++) {
    seamY = Math.max(seamY, Math.abs(noise[x]! - noise[(NOISE_H - 1) * NOISE_W + x]!))
  }
  assert.ok(seamX <= interior * 1.5, `couture verticale ${seamX} > ${interior}`)
  assert.ok(seamY <= interior * 3, `couture horizontale ${seamY} > ${interior}`)
}

assert.equal(ditherNoise(), ditherNoise(), 'les deux couches sont générées une seule fois')

console.log('dither: ok')
