// A sprite growing out of a point block by block, and folding back into it: Ichigo out of
// the pointer's pixel (UiIchigo), a cameo out of a card's edge (UiCameo). The blocks nearest
// the point come first; a little noise keeps the edge ragged.

/** A stable pseudo-random number per block, so the raggedness does not flicker */
export function noise(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/** How far a growth has gone once the whole sprite is there */
export const GROWN = 1.3

/** Draws the rect [sx, sy, w, h] of `source` at (dx, dy), only the blocks of `block` px whose
 * turn has come at `level` (0: none, GROWN: all), counted from `origin` (in the rect) over
 * `spread` px */
export function drawGrowing(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  [sx, sy, w, h]: [number, number, number, number],
  [dx, dy]: [number, number],
  [ox, oy]: [number, number],
  level: number,
  block: number,
  spread: number,
) {
  if (level >= GROWN) return ctx.drawImage(source, sx, sy, w, h, dx, dy, w, h)
  for (let by = 0; by < h; by += block) {
    for (let bx = 0; bx < w; bx += block) {
      const order =
        Math.hypot(bx + block / 2 - ox, by + block / 2 - oy) / spread + noise(bx, by) * 0.3
      if (order >= level) continue
      const bw = Math.min(block, w - bx)
      const bh = Math.min(block, h - by)
      ctx.drawImage(source, sx + bx, sy + by, bw, bh, dx + bx, dy + by, bw, bh)
    }
  }
}
