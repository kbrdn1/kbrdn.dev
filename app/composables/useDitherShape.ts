import { DITHER_SHAPES, shapeTile, type DitherShape } from '~/utils/dither'

let picked: DitherShape | undefined

/**
 * Pixel shape of every dither field on this page load: picked at random once, client
 * side, so the background, footer, banners and hover pixels all agree.
 * `localStorage['dither-shape'] = 'circle'` (or square, triangle, diamond) pins one,
 * to review a shape without reloading at random.
 */
export function ditherShape(): DitherShape {
  if (picked) return picked
  let pinned: string | null = null
  try {
    pinned = localStorage.getItem('dither-shape')
  } catch {
    // storage blocked (private mode, sandboxed preview): random it is
  }
  picked = DITHER_SHAPES.find((shape) => shape === pinned)
  return (picked ??= DITHER_SHAPES[Math.floor(Math.random() * DITHER_SHAPES.length)]!)
}

/** A repeating canvas pattern of `shape`, one cell of `size` device px per repeat. */
export function shapePattern(
  ctx: CanvasRenderingContext2D,
  shape: DitherShape,
  size: number,
): CanvasPattern | null {
  const { span, alpha } = shapeTile(shape, size)
  const tile = Object.assign(document.createElement('canvas'), { width: span, height: span })
  const image = new ImageData(span, span)
  for (let i = 0; i < alpha.length; i++) {
    image.data.set([255, 255, 255, Math.round(alpha[i]! * 255)], i * 4)
  }
  tile.getContext('2d')?.putImageData(image, 0, 0)
  return ctx.createPattern(tile, 'repeat')
}
