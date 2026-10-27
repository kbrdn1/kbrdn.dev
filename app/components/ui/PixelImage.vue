<script setup lang="ts">
// An image seen through a pixel layer, after disarto's LED-matrix photos: a canvas over the
// real <img> redraws it as a grid of the page's pixel shape (ditherShape(), the one of the
// background), each cell the picture's colour there. The <img> keeps the alt text and the
// layout. Everything moves block by block: with `reveal`, hovering clears the layer from the
// pointer outwards down to the crisp picture, and leaving puts it back; a new `src` sweeps
// its blocks in over the old ones.
// Same technique as UiDitherCanvas: the picture shrunk to one texel per cell, scaled back
// up without smoothing, then cut out by a repeating tile of the shape.
import { SHAPE_CELL_PX } from '~/utils/dither'

const props = withDefaults(
  defineProps<{ src: string; alt?: string; reveal?: boolean; loading?: 'lazy' | 'eager' }>(),
  { alt: '', reveal: false, loading: 'lazy' },
)

const BLOCKS_MS = 550
// Random spread added to each block's place in the wave, in cells: a ragged front
const JITTER = 6

const root = ref<HTMLElement>()
const img = ref<HTMLImageElement>()
const canvas = ref<HTMLCanvasElement>()
const reducedMotion = useReducedMotion()
const colorMode = useColorMode()

// The full pixel layer, drawn once per picture and size; the visible canvas copies or
// clears its cells. `cleared` marks the cells showing the crisp <img>.
let layer: HTMLCanvasElement | undefined
let cols = 0
let rows = 0
let cell = 0
let deviceCell = 0
let cleared = new Uint8Array(0)
let frame = 0
let swapPending = false
let observer: ResizeObserver | undefined

function buildLayer(image: HTMLImageElement, width: number, height: number) {
  const shape = ditherShape()
  cell = Math.max(SHAPE_CELL_PX[shape], 6)
  deviceCell = Math.round(cell * Math.min(2, window.devicePixelRatio || 1))
  cols = Math.ceil(width / cell)
  rows = Math.ceil(height / cell)

  // object-fit: cover, as the <img> under it
  const scale = Math.max(cols / image.naturalWidth, rows / image.naturalHeight)
  const sw = cols / scale
  const sh = rows / scale
  const small = Object.assign(document.createElement('canvas'), { width: cols, height: rows })
  small
    .getContext('2d')
    ?.drawImage(
      image,
      (image.naturalWidth - sw) / 2,
      (image.naturalHeight - sh) / 2,
      sw,
      sh,
      0,
      0,
      cols,
      rows,
    )

  const next = Object.assign(document.createElement('canvas'), {
    width: cols * deviceCell,
    height: rows * deviceCell,
  })
  const ctx = next.getContext('2d')
  const pattern = ctx && shapePattern(ctx, shape, deviceCell)
  if (!ctx || !pattern) return
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(small, 0, 0, next.width, next.height)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, next.width, next.height)
  // The gaps between shapes are baked in, page-coloured: a cleared block shows the <img>
  ctx.globalCompositeOperation = 'destination-over'
  ctx.fillStyle = isDarkMode(colorMode.value) ? '#0a0a0a' : '#ffffff'
  ctx.fillRect(0, 0, next.width, next.height)
  return next
}

// Repaint the layer: at once, or, for a new picture on the same grid, swept in block by
// block from left to right over the old one.
function draw(sweep = false) {
  const el = canvas.value
  const image = img.value
  const box = root.value
  if (!el || !box || !image?.complete || !image.naturalWidth) return
  const { width, height } = box.getBoundingClientRect()
  if (!width || !height) return

  const before = [cols, rows, deviceCell].join()
  const next = buildLayer(image, width, height)
  if (!next) return
  const sameGrid = before === [cols, rows, deviceCell].join()
  layer = next
  const ctx = el.getContext('2d')
  if (!ctx) return

  if (sweep && sameGrid) {
    const order = new Float32Array(cols * rows)
    const todo = Array.from(order, (_, i) => {
      order[i] = (i % cols) + Math.random() * JITTER * 2
      return i
    })
    return blocks(todo, order, (i) => paintCell(ctx, i, 0))
  }

  cancelAnimationFrame(frame)
  cleared = new Uint8Array(cols * rows)
  el.width = next.width
  el.height = next.height
  el.style.width = `${cols * cell}px`
  el.style.height = `${rows * cell}px`
  ctx.drawImage(next, 0, 0)
}

// One block: cleared to the crisp <img> (1) or covered by the layer (0)
function paintCell(ctx: CanvasRenderingContext2D, i: number, to: 0 | 1) {
  const x = (i % cols) * deviceCell
  const y = Math.floor(i / cols) * deviceCell
  cleared[i] = to
  if (to) ctx.clearRect(x, y, deviceCell, deviceCell)
  else ctx.drawImage(layer!, x, y, deviceCell, deviceCell, x, y, deviceCell, deviceCell)
}

// Paint `todo` in `order`, spread over BLOCKS_MS; at once under reduced motion
function blocks(todo: number[], order: Float32Array, paint: (i: number) => void) {
  cancelAnimationFrame(frame)
  todo.sort((a, b) => order[a]! - order[b]!)
  if (reducedMotion.value) return todo.forEach(paint)
  const start = performance.now()
  let done = 0
  const step = (now: number) => {
    const target = Math.min(todo.length, Math.ceil((todo.length * (now - start)) / BLOCKS_MS))
    for (; done < target; done++) paint(todo[done]!)
    if (done < todo.length) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

// Clear the blocks still covered (to = 1) or put the cleared ones back (to = 0), nearest
// to the pointer first
function hover(to: 0 | 1, event: PointerEvent) {
  const ctx = canvas.value?.getContext('2d')
  const box = root.value?.getBoundingClientRect()
  if (!ctx || !layer || !box) return
  const px = (event.clientX - box.left) / cell
  const py = (event.clientY - box.top) / cell
  const todo: number[] = []
  const order = new Float32Array(cols * rows)
  for (let i = 0; i < cleared.length; i++) {
    if (cleared[i] === to) continue
    todo.push(i)
    order[i] = Math.hypot((i % cols) - px, Math.floor(i / cols) - py) + Math.random() * JITTER
  }
  blocks(todo, order, (i) => paintCell(ctx, i, to))
}

function onLoad() {
  draw(swapPending)
  swapPending = false
}

onMounted(() => {
  observer = new ResizeObserver(() => draw())
  if (root.value) observer.observe(root.value)
  draw()
})

// A new picture sweeps in once loaded (onLoad); a colour mode change repaints at once
watch(
  () => props.src,
  () => (swapPending = true),
)
watch(
  () => colorMode.value,
  () => nextTick(() => draw()),
)

onUnmounted(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <div
    ref="root"
    class="relative overflow-hidden"
    @pointerenter="reveal && hover(1, $event)"
    @pointerleave="reveal && hover(0, $event)"
  >
    <img
      ref="img"
      :src="src"
      :alt="alt"
      :loading="loading"
      decoding="async"
      class="absolute inset-0 size-full object-cover"
      @load="onLoad"
    />
    <canvas ref="canvas" aria-hidden="true" class="pointer-events-none absolute top-0 left-0" />
  </div>
</template>
