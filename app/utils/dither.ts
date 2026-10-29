// Ordered-dither primitives behind UiDitherCanvas: a Bayer threshold matrix,
// tileable value noise and pixel shape tiles. Pure functions, no DOM:
// app/workers/dither-noise.ts runs the noise off the main thread,
// scripts/dither.test.ts checks them.

/** 4×4 Bayer matrix, thresholds in [0, 1). Index with `((y & 3) << 2) | (x & 3)`. */
export const BAYER_4 = Float32Array.from(
  [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5],
  (v) => v / 16,
)

/** Pixel shapes of a dither field, after codrops' Bayer dithering demo. */
export const DITHER_SHAPES = ['square', 'circle', 'triangle', 'diamond'] as const
export type DitherShape = (typeof DITHER_SHAPES)[number]

/**
 * Smallest cell, in CSS px, at which a shape still reads as that shape: a 4px circle is
 * a blurry dot. Squares keep the original 4px grid.
 */
export const SHAPE_CELL_PX: Record<DitherShape, number> = {
  square: 4,
  circle: 8,
  triangle: 8,
  diamond: 6,
}

/**
 * Coverage of `shape` over one cell, as alpha in [0, 1] for each of `size × size`
 * device pixels (row-major), 4×4 supersampled for smooth edges. The triangle alternates
 * its orientation in a checkerboard, so its tile spans 2×2 cells. Each shape covers
 * about half a cell: the field keeps a visible density without raising its alpha.
 */
export function shapeTile(shape: DitherShape, size: number): { span: number; alpha: Float32Array } {
  const span = shape === 'triangle' ? size * 2 : size
  const alpha = new Float32Array(span * span)
  const inside = (u: number, v: number, flip: boolean): boolean => {
    switch (shape) {
      case 'circle':
        return (u - 0.5) ** 2 + (v - 0.5) ** 2 <= 0.4 ** 2
      case 'diamond':
        return Math.abs(u - 0.5) + Math.abs(v - 0.5) <= 0.5
      case 'triangle':
        return flip ? v >= u : v >= 1 - u
      default:
        return true
    }
  }
  const SS = 4
  for (let py = 0; py < span; py++) {
    for (let px = 0; px < span; px++) {
      const flip = (Math.floor(px / size) + Math.floor(py / size)) % 2 === 1
      let hits = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = ((px % size) + (sx + 0.5) / SS) / size
          const v = ((py % size) + (sy + 0.5) / SS) / size
          if (inside(u, v, flip)) hits++
        }
      }
      alpha[py * span + px] = hits / (SS * SS)
    }
  }
  return { span, alpha }
}

/** Noise texture size in texels. Powers of two, so sampling wraps with `& (size - 1)`. */
export const NOISE_W = 512
export const NOISE_H = 256

const smoothstep = (t: number) => t * t * (3 - 2 * t)

/**
 * Tileable fBm value noise (3 octaves) over NOISE_W × NOISE_H texels. `cellsX`
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

  for (let octave = 0, amplitude = 1; octave < 3; octave++, amplitude /= 2) {
    const cx = cellsX << octave
    const cy = Math.max(1, Math.round((cellsX * NOISE_H) / NOISE_W)) << octave
    const lattice = Float32Array.from({ length: cx * cy }, random)
    // Column terms are the same on every row: compute them once per octave.
    const col0 = new Int32Array(NOISE_W)
    const col1 = new Int32Array(NOISE_W)
    const colT = new Float32Array(NOISE_W)
    for (let x = 0; x < NOISE_W; x++) {
      const fx = (x * cx) / NOISE_W
      col0[x] = Math.floor(fx)
      col1[x] = (col0[x]! + 1) % cx
      colT[x] = smoothstep(fx - col0[x]!)
    }
    for (let y = 0; y < NOISE_H; y++) {
      const fy = (y * cy) / NOISE_H
      const y0 = Math.floor(fy)
      const ty = smoothstep(fy - y0)
      const row0 = y0 * cx
      const row1 = ((y0 + 1) % cy) * cx
      for (let x = 0; x < NOISE_W; x++) {
        const x0 = col0[x]!
        const x1 = col1[x]!
        const tx = colT[x]!
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
