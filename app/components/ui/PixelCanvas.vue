<script setup lang="ts">
// Hover pixels, after hexagoncircle's <pixel-canvas> (codepen.io/hexagoncircle/pen/KwPpdBZ):
// when the pointer enters the parent, or keyboard focus lands in it, cells of the page's
// dither shape appear outward from the entry point (the centre on focus), grow, shimmer,
// then shrink away on leave. Same colour and alpha levels as UiDitherCanvas.
// Decorative: the parent must be `relative isolate overflow-hidden`, the canvas sits
// under its content and takes no pointer events.
const GAP = 8 // css px between cell origins
// Same ceiling as the dither field: text over a cell keeps its contrast.
const ALPHAS = [0.06, 0.12, 0.18]
const FRAME_MS = 1000 / 60

interface Pixel {
  x: number
  y: number
  level: number
  flip: boolean
  size: number // fraction of GAP
  minSize: number
  maxSize: number
  sizeStep: number
  speed: number
  delay: number // px from the entry point
  counter: number
  counterStep: number
  shimmer: boolean
  reverse: boolean
  idle: boolean
}

const canvas = ref<HTMLCanvasElement>()
const reducedMotion = useReducedMotion()
let cleanup: (() => void) | undefined

onMounted(() => {
  const el = canvas.value
  const parent = el?.parentElement
  const ctx = el?.getContext('2d')
  if (!el || !parent || !ctx) return

  const shape = ditherShape()
  let pixels: Pixel[] = []
  let width = 0
  let height = 0
  let dirty = true // size changed since the pixels were laid out
  let frame = 0
  let lastFrame = 0
  let mode: 'appear' | 'disappear' = 'disappear'
  const fills: string[] = []

  function layout(originX: number, originY: number) {
    const rect = parent!.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    width = rect.width
    height = rect.height
    el!.width = Math.round(width * dpr)
    el!.height = Math.round(height * dpr)
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    pixels = []
    const step = Math.random() * 4 + (width + height) * 0.01
    for (let y = 0, j = 0; y < height; y += GAP, j++) {
      for (let x = 0, i = 0; x < width; x += GAP, i++) {
        const minSize = 0.3
        pixels.push({
          x,
          y,
          level: Math.floor(Math.random() * ALPHAS.length),
          flip: (i + j) % 2 === 1,
          size: 0,
          minSize,
          maxSize: minSize + Math.random() * 0.6,
          sizeStep: Math.random() * 0.06,
          speed: (0.1 + Math.random() * 0.8) * 0.02,
          delay: Math.hypot(x + GAP / 2 - originX, y + GAP / 2 - originY),
          counter: 0,
          counterStep: step * (0.5 + Math.random()),
          shimmer: false,
          reverse: false,
          idle: true,
        })
      }
    }
    dirty = false
  }

  // One path per alpha level, every pixel of that level added to it, one fill each.
  function draw() {
    ctx!.clearRect(0, 0, width, height)
    for (let level = 0; level < ALPHAS.length; level++) {
      ctx!.beginPath()
      for (const p of pixels) {
        if (p.level !== level || p.size <= 0) continue
        const s = Math.min(1, p.size) * GAP
        const x0 = p.x + (GAP - s) / 2
        const y0 = p.y + (GAP - s) / 2
        if (shape === 'circle') {
          ctx!.moveTo(x0 + s, y0 + s / 2)
          ctx!.arc(x0 + s / 2, y0 + s / 2, s / 2, 0, Math.PI * 2)
        } else if (shape === 'diamond') {
          ctx!.moveTo(x0 + s / 2, y0)
          ctx!.lineTo(x0 + s, y0 + s / 2)
          ctx!.lineTo(x0 + s / 2, y0 + s)
          ctx!.lineTo(x0, y0 + s / 2)
          ctx!.closePath()
        } else if (shape === 'triangle') {
          ctx!.moveTo(p.flip ? x0 : x0 + s, y0)
          ctx!.lineTo(x0 + s, y0 + s)
          ctx!.lineTo(x0, y0 + s)
          ctx!.closePath()
        } else {
          ctx!.rect(x0, y0, s, s)
        }
      }
      ctx!.fillStyle = fills[level]!
      ctx!.fill()
    }
  }

  function appear(p: Pixel) {
    p.idle = false
    if (p.counter <= p.delay) {
      p.counter += p.counterStep
      return
    }
    if (p.size >= p.maxSize) p.shimmer = true
    if (!p.shimmer) {
      p.size += p.sizeStep
      return
    }
    if (p.size >= p.maxSize) p.reverse = true
    else if (p.size <= p.minSize) p.reverse = false
    p.size += p.reverse ? -p.speed : p.speed
  }

  function disappear(p: Pixel) {
    p.shimmer = false
    p.counter = 0
    p.size = Math.max(0, p.size - 0.04)
    p.idle = p.size === 0
  }

  function tick(now: number) {
    frame = requestAnimationFrame(tick)
    const elapsed = now - lastFrame
    if (elapsed < FRAME_MS) return
    lastFrame = now - (elapsed % FRAME_MS)
    const step = mode === 'appear' ? appear : disappear
    for (const p of pixels) step(p)
    draw()
    if (mode === 'disappear' && pixels.every((p) => p.idle)) stop()
  }

  function stop() {
    cancelAnimationFrame(frame)
    frame = 0
  }

  // Whatever format the CSS colour resolves to, read it back as sRGB from a 1×1 probe
  // (the theme can change between two hovers).
  const probe = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext(
    '2d',
    { willReadFrequently: true },
  )
  function readColors() {
    if (!probe) return
    probe.fillStyle = getComputedStyle(el!).color
    probe.fillRect(0, 0, 1, 1)
    const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data
    ALPHAS.forEach((a, i) => (fills[i] = `rgba(${r}, ${g}, ${b}, ${a})`))
  }

  function start(originX: number, originY: number) {
    readColors()
    // Re-lay out from the new entry point only once everything has faded: entering
    // again mid-fade picks up where the pixels are.
    if (dirty || pixels.every((p) => p.idle)) layout(originX, originY)
    mode = 'appear'
    if (reducedMotion.value) {
      for (const p of pixels) p.size = p.maxSize
      draw()
      return
    }
    if (!frame) {
      lastFrame = 0
      frame = requestAnimationFrame(tick)
    }
  }

  function leave() {
    mode = 'disappear'
    if (reducedMotion.value) {
      for (const p of pixels) Object.assign(p, { size: 0, idle: true })
      draw()
      return
    }
    if (!frame && pixels.some((p) => !p.idle)) frame = requestAnimationFrame(tick)
  }

  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    const rect = parent.getBoundingClientRect()
    start(e.clientX - rect.left, e.clientY - rect.top)
  }
  const onPointerLeave = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') leave()
  }
  // Focus moving between two children of the parent is neither an enter nor a leave.
  const onFocusIn = (e: FocusEvent) => {
    if (parent.contains(e.relatedTarget as Node | null)) return
    const rect = parent.getBoundingClientRect()
    start(rect.width / 2, rect.height / 2)
  }
  const onFocusOut = (e: FocusEvent) => {
    if (!parent.contains(e.relatedTarget as Node | null)) leave()
  }
  const resizeObserver = new ResizeObserver(() => (dirty = true))

  parent.addEventListener('pointerenter', onPointerEnter)
  parent.addEventListener('pointerleave', onPointerLeave)
  parent.addEventListener('focusin', onFocusIn)
  parent.addEventListener('focusout', onFocusOut)
  resizeObserver.observe(parent)

  cleanup = () => {
    stop()
    resizeObserver.disconnect()
    parent.removeEventListener('pointerenter', onPointerEnter)
    parent.removeEventListener('pointerleave', onPointerLeave)
    parent.removeEventListener('focusin', onFocusIn)
    parent.removeEventListener('focusout', onFocusOut)
  }
})

onUnmounted(() => cleanup?.())
</script>

<template>
  <!-- transition-none: same reason as UiDitherCanvas, the colour is read from CSS. -->
  <canvas
    ref="canvas"
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 -z-10 block h-full w-full select-none transition-none"
    style="color: var(--ui-primary)"
  />
</template>
