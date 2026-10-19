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
// CSS `color` (--ui-primary). Each cell is drawn as the page's pixel shape
// (ditherShape()): squares at cell resolution, upscaled by the browser with
// `image-rendering: pixelated`; other shapes at device resolution, the cell map
// scaled up then cut out by a repeating tile of the shape. Decorative only —
// positioning, size and opacity come from the parent's classes.
const props = withDefaults(
  defineProps<{
    /** The pointer ripples the field like water, as on safzan.dev's hero. */
    interactive?: boolean
    /** Where the field thins out: `down` is dense at the top and gone at the bottom. */
    fade?: 'down' | 'up' | 'none'
  }>(),
  { interactive: false, fade: 'none' },
)

const FRAME_MS = 1000 / 24
const MIN_CELL_PX = 4
// Top level capped at 0.18: at 0.24 the bio (#999 on dark) drops under the 4.5:1 AA
// contrast where a dense cell sits behind it. In light, small #666 labels on #f0eeeb
// fall to ~4.0:1 under a dense cell (4.5:1 needs <= 0.08): accepted for a visible field.
const ALPHAS = [0, 0.06, 0.12, 0.18]
const GAIN = 4.2
// Cursor ripples, after the CursorRipples filter of safzan.dev's hero (shaders.com, set to
// intensity 4, decay 6, radius 0.6): a damped 2D wave field 128 columns wide, splashed
// where the pointer moves, harder the faster it goes. Its gradient displaces the noise,
// so the pattern ripples like water under the cursor, and its crests light up: a wake
// that trails the pointer and spreads out in rings.
const SIM_COLS = 128
const WAVE_STEPS = 2 // per frame: waves travel ~2 sim cells per frame
const WAVE_DAMPING = 0.955 // per step
const SPLASH_RADIUS = 3.6 // sim cells
const SPLASH_MAX = 2 // pointer speed cap, in sim cells per frame
const RIPPLE_INTENSITY = 16 // noise texels of displacement per unit of wave slope
const RIPPLE_GLOW = 0.3 // brightness added per unit of crest height

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
  const shape = ditherShape()
  const shaped = shape !== 'square'
  // Shaped fields: the cell map goes to this canvas, then scaled up into `el`.
  const levels = shaped ? document.createElement('canvas') : undefined
  const levelsCtx = levels?.getContext('2d')
  let pattern: CanvasPattern | null = null

  let cols = 0
  let rows = 0
  let deviceCell = 1 // cell size in backing px (shaped fields)
  // Noise texels per cell: 1 on a 4px grid, more when the shape needs bigger cells,
  // so the blobs, the scroll speed and the trail keep their size on screen.
  let stride = 1
  let image = new ImageData(1, 1)
  let pixels = new Uint32Array(image.data.buffer)
  let threshold = new Float32Array(0)
  let time = 0
  let frame = 0
  let lastFrame = 0
  let resizeFrame = 0
  let onScreen = true
  // Wave field: heights now and one step back; each field cell reads the sim cell above it.
  let simCols = 0
  let simRows = 0
  let wave = new Float32Array(0)
  let wavePrev = new Float32Array(0)
  let simX = new Int32Array(0)
  let simY = new Int32Array(0)
  let rippling = false
  // Last pointer event in client coordinates, then the previous position in sim cells.
  let pointer: { x: number; y: number } | null = null
  let last: { x: number; y: number } | null = null

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
    const base = Math.max(MIN_CELL_PX, Math.ceil(width / NOISE_W), Math.ceil(height / NOISE_H))
    const cell = Math.max(SHAPE_CELL_PX[shape], base)
    const nextCols = Math.max(1, Math.ceil(width / cell))
    const nextRows = Math.max(1, Math.ceil(height / cell))
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const backingW = shaped ? Math.round(width * dpr) : nextCols
    const backingH = shaped ? Math.round(height * dpr) : nextRows
    if (
      nextCols === cols &&
      nextRows === rows &&
      backingW === el!.width &&
      backingH === el!.height
    ) {
      return
    }
    cols = nextCols
    rows = nextRows
    stride = cell / base
    el!.width = backingW
    el!.height = backingH
    if (levels) {
      levels.width = cols
      levels.height = rows
      const nextDeviceCell = Math.max(1, Math.round(cell * dpr))
      if (nextDeviceCell !== deviceCell || !pattern) {
        deviceCell = nextDeviceCell
        pattern = shapePattern(ctx!, shape, deviceCell)
      }
    }
    image = new ImageData(cols, rows)
    pixels = new Uint32Array(image.data.buffer)
    if (interactive) {
      simCols = SIM_COLS
      simRows = Math.max(3, Math.round((SIM_COLS * height) / Math.max(1, width)))
      wave = new Float32Array(simCols * simRows)
      wavePrev = new Float32Array(simCols * simRows)
      const toSim = (i: number, n: number, sim: number) =>
        Math.min(sim - 2, Math.max(1, Math.floor(((i + 0.5) / n) * sim)))
      simX = Int32Array.from({ length: cols }, (_, x) => toSim(x, cols, simCols))
      simY = Int32Array.from({ length: rows }, (_, y) => toSim(y, rows, simRows))
      rippling = false
    }
    threshold = Float32Array.from({ length: rows }, (_, y) => {
      const t = rows > 1 ? y / (rows - 1) : 0
      const depth = fade === 'down' ? t : fade === 'up' ? 1 - t : 0.25
      return 0.46 + 0.5 * depth * depth
    })
    last = null
  }

  // Add a gaussian bump of height `amount` to the wave field around (cx, cy).
  function splash(cx: number, cy: number, amount: number) {
    const reach = Math.ceil(SPLASH_RADIUS)
    const sigma2 = 2 * (SPLASH_RADIUS / 2) ** 2
    for (
      let y = Math.max(1, Math.round(cy) - reach);
      y <= Math.min(simRows - 2, Math.round(cy) + reach);
      y++
    ) {
      for (
        let x = Math.max(1, Math.round(cx) - reach);
        x <= Math.min(simCols - 2, Math.round(cx) + reach);
        x++
      ) {
        wave[y * simCols + x]! += amount * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / sigma2)
      }
    }
  }

  // Splash along the segment the pointer travelled since the last frame. A jump (first
  // move, back into the window) is not a stroke: it only sets where the next one starts.
  function applyPointer() {
    if (!pointer) return
    const rect = el!.getBoundingClientRect()
    const at = {
      x: ((pointer.x - rect.left) / rect.width) * simCols,
      y: ((pointer.y - rect.top) / rect.height) * simRows,
    }
    pointer = null
    const from = last
    last = at
    if (!from) return
    const distance = Math.hypot(at.x - from.x, at.y - from.y)
    if (distance < 0.05 || distance > simCols / 4) return
    const steps = Math.ceil(distance / (SPLASH_RADIUS / 2))
    const amount = Math.min(SPLASH_MAX, distance) / steps
    for (let s = 1; s <= steps; s++) {
      splash(from.x + ((at.x - from.x) * s) / steps, from.y + ((at.y - from.y) * s) / steps, amount)
    }
    rippling = true
  }

  // Damped wave equation, written into the older buffer, then the buffers swap.
  function stepWave() {
    let energy = 0
    for (let step = 0; step < WAVE_STEPS; step++) {
      for (let y = 1; y < simRows - 1; y++) {
        for (let x = 1, i = y * simCols + 1; x < simCols - 1; x++, i++) {
          const next =
            ((wave[i - 1]! + wave[i + 1]! + wave[i - simCols]! + wave[i + simCols]!) * 0.5 -
              wavePrev[i]!) *
            WAVE_DAMPING
          wavePrev[i] = next
          energy = Math.max(energy, Math.abs(next))
        }
      }
      ;[wave, wavePrev] = [wavePrev, wave]
    }
    // Settled: skip the field and the per-cell displacement until the next splash.
    rippling = energy > 1e-3
  }

  function draw() {
    const shiftA = Math.floor(time * 3)
    const shiftB = Math.floor(time * -5)
    const liftB = Math.floor(time * 1.5)
    let i = 0
    for (let y = 0; y < rows; y++) {
      const floor = threshold[y]!
      const simRow = rippling ? simY[y]! * simCols : 0
      for (let x = 0; x < cols; x++, i++) {
        let dx = 0
        let dy = 0
        let glow = 0
        if (rippling) {
          const si = simRow + simX[x]!
          dx = (wave[si + 1]! - wave[si - 1]!) * RIPPLE_INTENSITY
          dy = (wave[si + simCols]! - wave[si - simCols]!) * RIPPLE_INTENSITY
          glow = Math.max(0, wave[si]!) * RIPPLE_GLOW
        }
        const tx = x * stride
        const ty = y * stride
        const ax = ((tx + shiftA + dx) | 0) & (NOISE_W - 1)
        const ay = ((ty + dy) | 0) & (NOISE_H - 1)
        // Second layer: the same texture at twice the frequency, scrolling the other way.
        const bx = ((2 * tx + shiftB + dx) | 0) & (NOISE_W - 1)
        const by = ((2 * ty + liftB + dy) | 0) & (NOISE_H - 1)
        const value = noise[ay * NOISE_W + ax]! * 0.65 + noise[by * NOISE_W + bx]! * 0.35 + glow
        const u = (value - floor) * GAIN
        pixels[i] =
          u > 0 ? palette[Math.min(3, (u * 3 + BAYER_4[((y & 3) << 2) | (x & 3)]!) | 0)]! : 0
      }
    }
    if (!levels || !levelsCtx || !pattern) {
      ctx!.putImageData(image, 0, 0)
      return
    }
    // Two draws whatever the cell count: the cell map scaled up by an integer factor
    // without smoothing, then its alpha multiplied by the shape tile.
    levelsCtx.putImageData(image, 0, 0)
    ctx!.clearRect(0, 0, el!.width, el!.height)
    ctx!.imageSmoothingEnabled = false
    ctx!.drawImage(levels, 0, 0, cols * deviceCell, rows * deviceCell)
    ctx!.globalCompositeOperation = 'destination-in'
    ctx!.fillStyle = pattern
    ctx!.fillRect(0, 0, el!.width, el!.height)
    ctx!.globalCompositeOperation = 'source-over'
  }

  function tick(now: number) {
    frame = requestAnimationFrame(tick)
    const elapsed = lastFrame ? now - lastFrame : FRAME_MS
    if (elapsed < FRAME_MS) return
    lastFrame = now - (elapsed % FRAME_MS)
    time += Math.min(elapsed, 250) / 1000
    if (interactive) {
      applyPointer()
      if (rippling) stepWave()
    }
    draw()
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
  // Leaving the window must not splash a line across the field on the way back in.
  const onPointerOut = (e: PointerEvent) => {
    if (!e.relatedTarget) last = null
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
    class="pointer-events-none block select-none transition-none"
    style="image-rendering: pixelated; color: var(--ui-primary)"
  />
</template>
