// Ordered-dither primitives behind UiDitherCanvas: a Bayer threshold matrix and
// tileable value noise. Pure functions, no DOM — scripts/dither.test.ts runs them.

/** 4×4 Bayer matrix, thresholds in [0, 1). Index with `((y & 3) << 2) | (x & 3)`. */
export const BAYER_4 = Float32Array.from(
  [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5],
  (v) => v / 16,
)

/** Noise texture size in texels. Powers of two, so sampling wraps with `& (size - 1)`. */
export const NOISE_W = 512
export const NOISE_H = 256

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/**
 * Tileable fBm value noise (4 octaves) over NOISE_W × NOISE_H texels. `cellsX`
 * is the base lattice width: lower means bigger blobs. Normalised to mean 0.5
 * and standard deviation 0.15, then clamped to [0, 1], so every seed gives the
 * same density under a fixed threshold.
 */
export function noiseTexture(seed: number, cellsX: number): Float32Array {
  const out = new Float32Array(NOISE_W * NOISE_H)
  let state = seed >>> 0 || 1
  const random = () => {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    return (state >>> 0) / 0x100000000
  }

  for (let octave = 0, amplitude = 1; octave < 4; octave++, amplitude /= 2) {
    const cx = cellsX << octave
    const cy = Math.max(1, Math.round((cellsX * NOISE_H) / NOISE_W)) << octave
    const lattice = Float32Array.from({ length: cx * cy }, random)
    for (let y = 0; y < NOISE_H; y++) {
      const fy = (y * cy) / NOISE_H
      const y0 = Math.floor(fy)
      const ty = smoothstep(fy - y0)
      const row0 = y0 * cx
      const row1 = ((y0 + 1) % cy) * cx
      for (let x = 0; x < NOISE_W; x++) {
        const fx = (x * cx) / NOISE_W
        const x0 = Math.floor(fx)
        const x1 = (x0 + 1) % cx
        const tx = smoothstep(fx - x0)
        const top = lattice[row0 + x0]! + (lattice[row0 + x1]! - lattice[row0 + x0]!) * tx
        const bottom = lattice[row1 + x0]! + (lattice[row1 + x1]! - lattice[row1 + x0]!) * tx
        out[y * NOISE_W + x]! += (top + (bottom - top) * ty) * amplitude
      }
    }
  }

  let mean = 0
  for (const v of out) mean += v
  mean /= out.length
  let variance = 0
  for (const v of out) variance += (v - mean) ** 2
  const scale = 0.15 / (Math.sqrt(variance / out.length) || 1)
  for (let i = 0; i < out.length; i++) {
    out[i] = Math.min(1, Math.max(0, (out[i]! - mean) * scale + 0.5))
  }
  return out
}

let layers: [Float32Array, Float32Array] | undefined

/** The two noise layers every dither canvas samples, generated once per page. */
export function ditherNoise(): [Float32Array, Float32Array] {
  return (layers ??= [noiseTexture(0x5bd1e995, 3), noiseTexture(0x27d4eb2f, 7)])
}
