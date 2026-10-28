<script setup lang="ts">
// A page's hero scene redrawn at the cameos' level (utils/heroes), on a canvas the size of its
// box (4:3), in whole screen pixels per art pixel where that keeps it near its size. What never
// moves is painted once per mode; what moves, about 30 times a second, only while on screen
// and the page shown. Under reduced motion it holds its resting frame. Decorative.
import type { Hero } from '~/utils/heroes'

const props = defineProps<{ hero: Hero }>()

const canvas = ref<HTMLCanvasElement>()
const reducedMotion = useReducedMotion()
// Time played, so that a pause picks up where it stopped
let t = 0
let last = 0
let raf = 0
let visible = false
const stills = new Map<boolean, HTMLCanvasElement>()
// What moves, painted at art size before it is drawn up to scale (made once mounted)
let layer: HTMLCanvasElement | undefined

const dark = () => document.documentElement.matches('.dark, .blur')

// A raster onto a canvas of its size, its empty cells see-through
function put(target: HTMLCanvasElement, raster: ReturnType<Hero['paint']>) {
  target.width = raster.w
  target.height = raster.h
  const ctx = target.getContext('2d')!
  const image = ctx.createImageData(raster.w, raster.h)
  raster.cells.forEach((color, i) => {
    if (!color) return
    const n = parseInt(color.slice(1), 16)
    image.data.set([n >> 16, (n >> 8) & 255, n & 255, 255], i * 4)
  })
  ctx.putImageData(image, 0, 0)
}

function draw(at: number) {
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx || !layer) return
  const mode = dark()
  let still = stills.get(mode)
  if (!still) {
    still = document.createElement('canvas')
    put(still, props.hero.still(mode))
    stills.set(mode, still)
  }
  put(layer, props.hero.paint(at, mode))
  // Whole screen pixels per art pixel, unless that shrinks it by more than a fifth
  const exact = el.width / props.hero.w
  const scale =
    Math.floor(exact) >= 1 && Math.floor(exact) / exact >= 0.8 ? Math.floor(exact) : exact
  const [w, h] = [props.hero.w * scale, props.hero.h * scale]
  const [x, y] = [Math.round((el.width - w) / 2), Math.round((el.height - h) / 2)]
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, el.width, el.height)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(still, x, y, w, h)
  ctx.drawImage(layer, x, y, w, h)
}

function frame(now: number) {
  raf = requestAnimationFrame(frame)
  // About 30 frames a second is plenty for pixels, and halves the work
  if (now - last < 32) return
  t += Math.min(100, now - last)
  last = now
  draw(t)
}

function play() {
  cancelAnimationFrame(raf)
  raf = 0
  if (!visible || document.hidden || reducedMotion.value)
    return draw(reducedMotion.value ? props.hero.rest : t)
  last = performance.now()
  raf = requestAnimationFrame(frame)
}

function size() {
  const el = canvas.value
  if (!el) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  el.width = Math.round(el.clientWidth * dpr)
  el.height = Math.round(el.clientHeight * dpr)
  draw(reducedMotion.value ? props.hero.rest : t)
}

let observer: IntersectionObserver | undefined
let resize: ResizeObserver | undefined
let theme: MutationObserver | undefined
onMounted(() => {
  if (!canvas.value) return
  layer = document.createElement('canvas')
  t = props.hero.rest
  // The theme changes the colours: repaint, from the still up
  theme = new MutationObserver(() => {
    stills.clear()
    if (!raf) draw(reducedMotion.value ? props.hero.rest : t)
  })
  resize = new ResizeObserver(size)
  resize.observe(canvas.value)
  observer = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting
    play()
  })
  observer.observe(canvas.value)
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  document.addEventListener('visibilitychange', play)
})
watch(reducedMotion, play)
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  observer?.disconnect()
  resize?.disconnect()
  theme?.disconnect()
  document.removeEventListener('visibilitychange', play)
})
</script>

<template>
  <canvas
    ref="canvas"
    :width="hero.w"
    :height="hero.h"
    class="block aspect-[4/3]"
    aria-hidden="true"
  />
</template>
