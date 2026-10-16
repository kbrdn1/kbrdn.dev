<script lang="ts">
// One noise texture per page load, shared by every canvas. Random seed, so the
// pattern changes on each load; generated in a worker so it never blocks hydration.
let sharedNoise: Promise<Float32Array> | undefined

function ditherNoise(): Promise<Float32Array> {
  return (sharedNoise ??= new Promise((resolve) => {
    const seed = (Math.random() * 0x100000000) >>> 0
    const generateHere = () => resolve(noiseTexture(seed, 3))
    try {
      const worker = new Worker(new URL('../../workers/dither-noise.ts', import.meta.url), {
        type: 'module',
      })
      worker.onmessage = (e: MessageEvent<Float32Array>) => {
        resolve(e.data)
        worker.terminate()
      }
      worker.onerror = () => {
        generateHere()
        worker.terminate()
      }
      worker.postMessage(seed)
    } catch {
      generateHere()
    }
  }))
}
</script>

<script setup lang="ts">
// Animated ordered-dither field: two scrolling noise layers, thresholded and
// quantised through a 4×4 Bayer matrix into a few alpha levels of the element's
// CSS `color` (--ui-primary). Drawn at cell resolution, upscaled by the browser
// with `image-rendering: pixelated`. Decorative only — positioning, size and
// opacity come from the parent's classes.
const props = withDefaults(
  defineProps<{
    /** The pointer leaves a decaying trail that lights up and pushes the noise. */
    interactive?: boolean
    /** Where the field thins out: `down` is dense at the top and gone at the bottom. */
    fade?: 'down' | 'up' | 'none'
  }>(),
  { interactive: false, fade: 'none' },
)

const FRAME_MS = 1000 / 24
const MIN_CELL_PX = 4
// Top level capped at 0.18: at 0.24 the bio (#999 on dark) drops under the 4.5:1 AA
// contrast where a dense cell sits behind it. Light pages also scale the canvas to 44%
// opacity (template): #666 labels on #f0eeeb only hold 4.5:1 up to 0.08.
const ALPHAS = [0, 0.06, 0.12, 0.18]
const GAIN = 4.2
const TRAIL_RADIUS = 9 // cells
const TRAIL_STRENGTH = 0.3
const TRAIL_DECAY = 0.86 // per frame
const TRAIL_GLOW = 0.35
const TRAIL_PUSH = 6 // cells of noise displacement per unit of heat gradient

const canvas = ref<HTMLCanvasElement>()
const reducedMotion = useReducedMotion()
let cleanup: (() => void) | undefined

onMounted(async () => {
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx) return
  let disposed = false
  cleanup = () => (disposed = true)
  const noise = await ditherNoise()
  if (disposed) return

  // Props are fixed for the canvas lifetime; read once, not per cell through the proxy.
  const { interactive, fade } = props
  const palette = new Uint32Array(ALPHAS.length)
  const brushSize = 2 * TRAIL_RADIUS + 1
  const brush = Float32Array.from({ length: brushSize * brushSize }, (_, k) => {
    const dx = (k % brushSize) - TRAIL_RADIUS
    const dy = Math.floor(k / brushSize) - TRAIL_RADIUS
    return Math.exp(-(dx * dx + dy * dy) / (2 * (TRAIL_RADIUS / 2.5) ** 2))
  })

  let cols = 0
  let rows = 0
  let image = new ImageData(1, 1)
  let pixels = new Uint32Array(image.data.buffer)
  let threshold = new Float32Array(0)
  let heat = new Float32Array(0)
  let time = 0
  let frame = 0
  let lastFrame = 0
  let resizeFrame = 0
  let onScreen = true
  // Pointer in client coordinates, and the last cell the trail was stamped at.
  let pointer: { x: number; y: number } | null = null
  let trailEnd: { x: number; y: number } | null = null

  // Let the browser parse whatever colour format the CSS resolves to, on a 1×1
  // probe so the drawing canvas never gets read back.
  const probe = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext(
    '2d',
    { willReadFrequently: true },
  )
  function readColor() {
    if (!probe) return
    probe.fillStyle = getComputedStyle(el!).color
    probe.fillRect(0, 0, 1, 1)
    const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data
    const rgba = new Uint8ClampedArray(4)
    const word = new Uint32Array(rgba.buffer)
    ALPHAS.forEach((alpha, i) => {
      rgba.set([r, g, b, Math.round(alpha * 255)])
      palette[i] = word[0]!
    })
  }

  function resize() {
    const width = el!.clientWidth
    const height = el!.clientHeight
    const cell = Math.max(MIN_CELL_PX, Math.ceil(width / NOISE_W), Math.ceil(height / NOISE_H))
    const nextCols = Math.max(1, Math.ceil(width / cell))
    const nextRows = Math.max(1, Math.ceil(height / cell))
    if (nextCols === cols && nextRows === rows) return
    cols = nextCols
    rows = nextRows
    el!.width = cols
    el!.height = rows
    image = new ImageData(cols, rows)
    pixels = new Uint32Array(image.data.buffer)
    if (interactive) heat = new Float32Array(cols * rows)
    threshold = Float32Array.from({ length: rows }, (_, y) => {
      const t = rows > 1 ? y / (rows - 1) : 0
      const depth = fade === 'down' ? t : fade === 'up' ? 1 - t : 0.25
      return 0.46 + 0.5 * depth * depth
    })
    trailEnd = null
  }

  function stamp(cx: number, cy: number) {
    for (let dy = -TRAIL_RADIUS; dy <= TRAIL_RADIUS; dy++) {
      const y = cy + dy
      if (y < 0 || y >= rows) continue
      for (let dx = -TRAIL_RADIUS; dx <= TRAIL_RADIUS; dx++) {
        const x = cx + dx
        if (x < 0 || x >= cols) continue
        const i = y * cols + x
        const k = (dy + TRAIL_RADIUS) * brushSize + dx + TRAIL_RADIUS
        heat[i] = Math.min(1, heat[i]! + brush[k]! * TRAIL_STRENGTH)
      }
    }
  }

  // Stamp the brush along the segment the pointer travelled since the last frame.
  function followPointer() {
    if (!pointer) return
    const rect = el!.getBoundingClientRect()
    const x = Math.round(((pointer.x - rect.left) / rect.width) * cols)
    const y = Math.round(((pointer.y - rect.top) / rect.height) * rows)
    pointer = null
    const from = trailEnd ?? { x, y }
    const distance = Math.hypot(x - from.x, y - from.y)
    const steps = distance > cols / 2 ? 1 : Math.max(1, Math.ceil(distance / (TRAIL_RADIUS / 3)))
    for (let s = 1; s <= steps; s++) {
      stamp(
        Math.round(from.x + ((x - from.x) * s) / steps),
        Math.round(from.y + ((y - from.y) * s) / steps),
      )
    }
    trailEnd = { x, y }
  }

  function draw() {
    const shiftA = Math.floor(time * 3)
    const shiftB = Math.floor(time * -5)
    const liftB = Math.floor(time * 1.5)
    let i = 0
    for (let y = 0; y < rows; y++) {
      const floor = threshold[y]!
      for (let x = 0; x < cols; x++, i++) {
        let glow = 0
        let dx = 0
        let dy = 0
        if (interactive) {
          glow = heat[i]!
          if (glow > 0.01) {
            dx = ((heat[i + 1] ?? 0) - (heat[i - 1] ?? 0)) * TRAIL_PUSH
            dy = ((heat[i + cols] ?? 0) - (heat[i - cols] ?? 0)) * TRAIL_PUSH
          }
        }
        const ax = ((x + shiftA + dx) | 0) & (NOISE_W - 1)
        const ay = ((y + dy) | 0) & (NOISE_H - 1)
        // Second layer: the same texture at twice the frequency, scrolling the other way.
        const bx = ((2 * x + shiftB + dx) | 0) & (NOISE_W - 1)
        const by = ((2 * y + liftB + dy) | 0) & (NOISE_H - 1)
        const value =
          noise[ay * NOISE_W + ax]! * 0.65 + noise[by * NOISE_W + bx]! * 0.35 + glow * TRAIL_GLOW
        const u = (value - floor) * GAIN
        pixels[i] =
          u > 0 ? palette[Math.min(3, (u * 3 + BAYER_4[((y & 3) << 2) | (x & 3)]!) | 0)]! : 0
      }
    }
    ctx!.putImageData(image, 0, 0)
  }

  function tick(now: number) {
    frame = requestAnimationFrame(tick)
    const elapsed = lastFrame ? now - lastFrame : FRAME_MS
    if (elapsed < FRAME_MS) return
    lastFrame = now - (elapsed % FRAME_MS)
    time += Math.min(elapsed, 250) / 1000
    if (interactive) followPointer()
    draw()
    for (let k = 0; k < heat.length; k++) heat[k] = heat[k]! * TRAIL_DECAY
  }

  function start() {
    if (frame || reducedMotion.value || document.hidden || !onScreen) return
    lastFrame = 0
    frame = requestAnimationFrame(tick)
  }

  function stop() {
    cancelAnimationFrame(frame)
    frame = 0
  }

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') pointer = { x: e.clientX, y: e.clientY }
  }
  // Leaving the window must not draw a line across the field on the way back in.
  const onPointerOut = (e: PointerEvent) => {
    if (!e.relatedTarget) trailEnd = null
  }
  const onVisibility = () => (document.hidden ? stop() : start())

  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame)
    resizeFrame = requestAnimationFrame(() => {
      resize()
      draw()
    })
  })
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry?.isIntersecting ?? true
    if (onScreen) start()
    else stop()
  })
  // Colour follows the theme class on <html>.
  const themeObserver = new MutationObserver(() => {
    readColor()
    draw()
  })
  const stopMotionWatch = watch(reducedMotion, (reduce) => {
    if (reduce) stop()
    else start()
  })

  resize()
  readColor()
  draw()
  start()
  if (!reducedMotion.value) {
    el.animate([{ opacity: 0 }, {}], { duration: 1000, easing: 'ease-out' })
  }

  resizeObserver.observe(el)
  intersectionObserver.observe(el)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  document.addEventListener('visibilitychange', onVisibility)
  if (interactive) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerout', onPointerOut, { passive: true })
  }

  cleanup = () => {
    stop()
    cancelAnimationFrame(resizeFrame)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    themeObserver.disconnect()
    stopMotionWatch()
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerout', onPointerOut)
  }
})

onUnmounted(() => cleanup?.())
</script>

<template>
  <!-- transition-none: opts out of the global colour transition in main.css, which
       would hand readColor() a mid-transition colour on theme change. -->
  <canvas
    ref="canvas"
    aria-hidden="true"
    class="pointer-events-none block select-none transition-none opacity-[0.44] dark:opacity-100"
    style="image-rendering: pixelated; color: var(--ui-primary)"
  />
</template>
