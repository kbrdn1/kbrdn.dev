<script lang="ts">
// The cells are drawn by one WebGL2 context shared by every hover canvas of the page (a
// browser keeps about sixteen alive, a blog list has more cards than that): all of a card's
// cells in one instanced call, then copied into the card's own 2D canvas. A 2D path rebuilt
// from every cell on every frame made the big cards lag (/apps: 17k cells, issue #153); one
// drawImage per cell is slower still. No WebGL2 (hardware acceleration off): no hover pixels.
const SHAPES = ['square', 'circle', 'diamond', 'triangle']

// Per cell: x, y (device px), alpha (negative: the triangle flipped), size (fraction of the cell)
const VERTEX = `#version 300 es
in vec4 aCell;
uniform vec2 uView;
uniform float uCell;
out vec2 vQ;
out float vHalf;
out float vAlpha;
void main() {
  vec2 corner = vec2(gl_VertexID & 1, gl_VertexID >> 1);
  vQ = (corner - 0.5) * uCell;
  vHalf = min(aCell.w, 1.0) * uCell * 0.5;
  vAlpha = aCell.z;
  vec2 p = (aCell.xy + corner * uCell) / uView * 2.0 - 1.0;
  // An unlit cell lands outside the clip space: nothing to rasterise
  gl_Position = aCell.w > 0.0 ? vec4(p.x, -p.y, 0.0, 1.0) : vec4(2.0, 2.0, 2.0, 1.0);
}`

// Signed distance to the shape's edge in device px, negative inside, the same shapes the 2D
// path drew: a square, the circle and the diamond inscribed in it, the half of it under a
// diagonal that alternates in a checkerboard. Half a pixel of it is the antialiasing.
const FRAGMENT = `#version 300 es
precision mediump float;
in vec2 vQ;
in float vHalf;
in float vAlpha;
uniform int uShape;
uniform vec3 uColor;
out vec4 color;
void main() {
  vec2 a = abs(vQ);
  float d = max(a.x, a.y) - vHalf;
  if (uShape == 1) d = length(vQ) - vHalf;
  else if (uShape == 2) d = (a.x + a.y - vHalf) * 0.7071;
  else if (uShape == 3) d = max(d, -((vAlpha < 0.0 ? -vQ.x : vQ.x) + vQ.y) * 0.7071);
  float alpha = clamp(0.5 - d, 0.0, 1.0) * abs(vAlpha);
  color = vec4(uColor * alpha, alpha);
}`

interface CellRenderer {
  gl: WebGL2RenderingContext
  uniforms: Record<'view' | 'cell' | 'shape' | 'color', WebGLUniformLocation | null>
}

let shared: CellRenderer | null | undefined // null: no WebGL2 on this page

function cellRenderer(): CellRenderer | null {
  if (shared !== undefined) return shared
  shared = null
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2', { antialias: false, depth: false, stencil: false })
  if (!gl) return null
  const program = gl.createProgram()
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  const cell = gl.getAttribLocation(program, 'aCell')
  gl.enableVertexAttribArray(cell)
  gl.vertexAttribPointer(cell, 4, gl.FLOAT, false, 0, 0)
  gl.vertexAttribDivisor(cell, 1)
  gl.clearColor(0, 0, 0, 0)
  // A lost context (GPU reset, too many contexts) is rebuilt on the next frame
  canvas.addEventListener('webglcontextlost', () => (shared = undefined))
  const uniform = (name: string) => gl.getUniformLocation(program, name)
  return (shared = {
    gl,
    uniforms: {
      view: uniform('uView'),
      cell: uniform('uCell'),
      shape: uniform('uShape'),
      color: uniform('uColor'),
    },
  })
}

/** Draws `cells` (4 floats each, see VERTEX) over the whole of `ctx`'s canvas, replacing it
 * (`ctx` composites with `copy`). `cell` and the cells' positions in device px. */
function drawCells(
  ctx: CanvasRenderingContext2D,
  cells: Float32Array,
  cell: number,
  shape: string,
  rgb: [number, number, number],
) {
  const renderer = cellRenderer()
  if (!renderer) return
  const { gl, uniforms } = renderer
  const { width, height } = ctx.canvas
  const target = gl.canvas as HTMLCanvasElement
  // Two cards can animate at once (one fading out under the next): resized for each
  if (target.width !== width || target.height !== height) {
    target.width = width
    target.height = height
  }
  gl.viewport(0, 0, width, height)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.uniform2f(uniforms.view, width, height)
  gl.uniform1f(uniforms.cell, cell)
  gl.uniform1i(uniforms.shape, SHAPES.indexOf(shape))
  gl.uniform3f(uniforms.color, ...rgb)
  gl.bufferData(gl.ARRAY_BUFFER, cells, gl.STREAM_DRAW)
  gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, cells.length / 4)
  ctx.drawImage(target, 0, 0)
}
</script>

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
  let cells = new Float32Array() // per pixel, the 4 floats drawCells() reads
  let cell = 0 // GAP in device px
  let dirty = true // size changed since the pixels were laid out
  let frame = 0
  let lastFrame = 0
  let mode: 'appear' | 'disappear' = 'disappear'
  let rgb: [number, number, number] = [0, 0, 0]

  function layout(originX: number, originY: number) {
    const rect = parent!.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const width = rect.width
    const height = rect.height
    el!.width = Math.round(width * dpr)
    el!.height = Math.round(height * dpr)
    ctx!.globalCompositeOperation = 'copy' // reset by the resize: each frame replaces the last
    cell = GAP * dpr
    pixels = []
    const data: number[] = []
    const step = Math.random() * 4 + (width + height) * 0.01
    for (let y = 0, j = 0; y < height; y += GAP, j++) {
      for (let x = 0, i = 0; x < width; x += GAP, i++) {
        const minSize = 0.3
        const alpha = ALPHAS[Math.floor(Math.random() * ALPHAS.length)]!
        data.push(x * dpr, y * dpr, (i + j) % 2 === 1 ? -alpha : alpha, 0)
        pixels.push({
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
    cells = new Float32Array(data)
    dirty = false
  }

  function draw() {
    for (let i = 0; i < pixels.length; i++) cells[i * 4 + 3] = pixels[i]!.size
    drawCells(ctx!, cells, cell, shape, rgb)
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
    rgb = [r / 255, g / 255, b / 255]
  }

  function start(originX: number, originY: number) {
    if (!cellRenderer()) return
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
