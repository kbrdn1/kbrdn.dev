<script setup lang="ts">
// The badges of the stack orbiting the mascot (utils/heroes/orbit), on two canvases over its
// box: the far side behind it (-z-10), the near side in front (z-10). One clock for both, about
// 30 frames a second, only while on screen and the page shown; under reduced motion, its
// resting frame. Decorative.
import { ORBIT } from '~/utils/heroes/orbit'

const back = ref<HTMLCanvasElement>()
const front = ref<HTMLCanvasElement>()
const reducedMotion = useReducedMotion()
let t = ORBIT.rest
let last = 0
let raf = 0
let visible = false
// The layers at art size, before they are drawn up to scale (made once mounted)
let art: HTMLCanvasElement | undefined

const dark = () => document.documentElement.matches('.dark, .blur')

function draw(at: number) {
  if (!art) return
  const paint = art.getContext('2d')!
  ORBIT.layers(at, dark()).forEach((layer, i) => {
    const el = [back.value, front.value][i]
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return
    paint.putImageData(layer.toImage(paint), 0, 0)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, el.width, el.height)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(art!, 0, 0, el.width, el.height)
  })
}

function frame(now: number) {
  raf = requestAnimationFrame(frame)
  if (now - last < 32) return
  t += Math.min(100, now - last)
  last = now
  draw(t)
}

function play() {
  cancelAnimationFrame(raf)
  raf = 0
  if (!visible || document.hidden || reducedMotion.value)
    return draw(reducedMotion.value ? ORBIT.rest : t)
  last = performance.now()
  raf = requestAnimationFrame(frame)
}

function size() {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  for (const el of [back.value, front.value]) {
    if (!el) continue
    el.width = Math.round(el.clientWidth * dpr)
    el.height = Math.round(el.clientHeight * dpr)
  }
  draw(reducedMotion.value ? ORBIT.rest : t)
}

let observer: IntersectionObserver | undefined
let resize: ResizeObserver | undefined
let theme: MutationObserver | undefined
onMounted(() => {
  if (!front.value) return
  art = document.createElement('canvas')
  art.width = ORBIT.w
  art.height = ORBIT.h
  resize = new ResizeObserver(size)
  resize.observe(front.value)
  observer = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting
    play()
  })
  observer.observe(front.value)
  theme = new MutationObserver(() => raf || draw(reducedMotion.value ? ORBIT.rest : t))
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
  <!-- No z-index of its own: its canvases go behind and in front of the mascot's pictures -->
  <div class="pointer-events-none absolute inset-0" aria-hidden="true">
    <canvas
      ref="back"
      :width="ORBIT.w"
      :height="ORBIT.h"
      class="absolute top-1/2 left-1/2 -z-10 aspect-[3/2] w-[150%] -translate-x-1/2 -translate-y-1/2"
    />
    <canvas
      ref="front"
      :width="ORBIT.w"
      :height="ORBIT.h"
      class="absolute top-1/2 left-1/2 z-10 aspect-[3/2] w-[150%] -translate-x-1/2 -translate-y-1/2"
    />
  </div>
</template>
