<script setup lang="ts">
// An image seen through a pixel layer, after disarto's LED-matrix photos: a canvas over the
// real <img> redraws it as a grid of the page's pixel shape (ditherShape(), the one of the
// background), each cell the picture's colour there. The <img> keeps the alt text and the
// layout; with `reveal`, it shows through, crisp, while a parent `group` is hovered.
// Same technique as UiDitherCanvas: the picture shrunk to one texel per cell, scaled back
// up without smoothing, then cut out by a repeating tile of the shape.
import { SHAPE_CELL_PX } from '~/utils/dither'

const props = withDefaults(
  defineProps<{ src: string; alt?: string; reveal?: boolean; loading?: 'lazy' | 'eager' }>(),
  { alt: '', reveal: false, loading: 'lazy' },
)

const img = ref<HTMLImageElement>()
const canvas = ref<HTMLCanvasElement>()
let observer: ResizeObserver | undefined

function draw() {
  const el = canvas.value
  const image = img.value
  const box = el?.parentElement
  if (!el || !box || !image?.complete || !image.naturalWidth) return
  const { width, height } = box.getBoundingClientRect()
  if (!width || !height) return

  const shape = ditherShape()
  const cell = Math.max(SHAPE_CELL_PX[shape], 6)
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const deviceCell = Math.round(cell * dpr)
  const cols = Math.ceil(width / cell)
  const rows = Math.ceil(height / cell)

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

  el.width = cols * deviceCell
  el.height = rows * deviceCell
  el.style.width = `${cols * cell}px`
  el.style.height = `${rows * cell}px`
  const ctx = el.getContext('2d')
  const pattern = ctx && shapePattern(ctx, shape, deviceCell)
  if (!ctx || !pattern) return
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(small, 0, 0, el.width, el.height)
  ctx.globalCompositeOperation = 'destination-in'
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, el.width, el.height)
  ctx.globalCompositeOperation = 'source-over'
}

onMounted(() => {
  observer = new ResizeObserver(() => draw())
  if (canvas.value?.parentElement) observer.observe(canvas.value.parentElement)
  draw()
})

watch(
  () => props.src,
  () => nextTick(draw),
)

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <div class="relative overflow-hidden">
    <img
      ref="img"
      :src="src"
      :alt="alt"
      :loading="loading"
      decoding="async"
      class="absolute inset-0 size-full object-cover"
      @load="draw"
    />
    <!-- transition-opacity: the global colour transition must not replace it -->
    <canvas
      ref="canvas"
      aria-hidden="true"
      :class="[
        'pointer-events-none absolute top-0 left-0 bg-white transition-opacity duration-300 dark:bg-neutral-950',
        reveal && 'group-hover:opacity-0',
      ]"
    />
  </div>
</template>
