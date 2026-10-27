<script lang="ts">
// The atlas: Ichigo Kurosaki's sprites from Jump Ultimate Stars (Nintendo DS), ripped by
// Dazz & Fret for The Spriters Resource, cut into their moves (21 of them, 363 frames; hits
// taken and falls left out). Ichigo © Tite Kubo / Shueisha, the sprites © Nintendo /
// Ganbarion. Loaded once, on the first triple click.
interface Atlas {
  /** x, y, width, height in the atlas; then the anchor in the frame: the hair's centre, the
   * feet */
  frames: [number, number, number, number, number, number][]
  /** `wave`: the frame where a Getsuga Tenshō leaves the blade */
  moves: { frames: number[]; wave?: number }[]
}

let loading: Promise<{ atlas: Atlas; image: HTMLImageElement }> | undefined
function load() {
  loading ??= Promise.all([
    fetch('/images/ichigo/atlas.json').then((response) => response.json() as Promise<Atlas>),
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = '/images/ichigo/atlas.png'
    }),
  ]).then(([atlas, image]) => ({ atlas, image }))
  return loading
}
</script>

<script setup lang="ts">
// UiPixelCursor's triple click: Ichigo grows out of the pointer's pixel block by block, plays
// one of his moves at random, then folds back into it. Half the time a special, whose
// Getsuga Tenshō (a crescent computed here, not from the game) flies off the blade across the
// screen, the call on top. He faces the side with more room.
const props = defineProps<{ x: number; y: number }>()
const emit = defineEmits<{ done: [] }>()

// DS pixels to CSS px
const SCALE = 2
const FRAME_MS = 85
const SPAWN_MS = 320
const FOLD_MS = 320
// The spawn and fold go by blocks of this many DS pixels
const BLOCK = 3
// He stands this far under the tip (CSS px)
const BELOW = 24
// The wave, CSS px per ms
const WAVE_SPEED = 1.1
const CALL = '月牙天衝'

const canvas = ref<HTMLCanvasElement>()

// A stable pseudo-random number per block, so the spawn's raggedness does not flicker
const noise = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}
const clamp = (p: number) => Math.min(1, Math.max(0, p))

let raf = 0
onMounted(async () => {
  let loaded: Awaited<ReturnType<typeof load>>
  try {
    loaded = await load()
  } catch {
    loading = undefined
    emit('done')
    return
  }
  const { atlas, image } = loaded
  // Gone while loading: another call took its place
  const el = canvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return emit('done')

  const dpr = Math.min(2, window.devicePixelRatio || 1)
  el.width = Math.round(innerWidth * dpr)
  el.height = Math.round(innerHeight * dpr)
  ctx.imageSmoothingEnabled = false

  const specials = atlas.moves.filter((m) => m.wave != null)
  const pool = Math.random() < 0.5 ? specials : atlas.moves.filter((m) => m.wave == null)
  const move = pool[Math.floor(Math.random() * pool.length)]!
  const dir = props.x < innerWidth / 2 ? 1 : -1
  const X = Math.round(props.x)
  const Y = Math.round(props.y + BELOW)
  const length = move.frames.length * FRAME_MS
  const release = move.wave != null ? move.wave * FRAME_MS : Infinity
  // How far the wave flies before it is gone, CSS px
  const reach = (dir > 0 ? innerWidth - X : X) + 80

  // A frame, around the feet, mirrored when he faces left. While it grows or folds, block by
  // block from the tip outwards: `level` is how far the growth has gone (0 to 1.3).
  const drawFrame = (id: number, level: number) => {
    const [fx, fy, fw, fh, ax, ay] = atlas.frames[id]!
    ctx.setTransform(dpr * SCALE * dir, 0, 0, dpr * SCALE, X * dpr, Y * dpr)
    if (level >= 1.3) {
      ctx.drawImage(image, fx, fy, fw, fh, -ax, -ay, fw, fh)
      return
    }
    for (let by = 0; by < fh; by += BLOCK) {
      for (let bx = 0; bx < fw; bx += BLOCK) {
        const order =
          Math.hypot(bx + BLOCK / 2 - ax, by + BLOCK / 2 - ay + BELOW / SCALE) / 40 +
          noise(bx, by) * 0.3
        if (order >= level) continue
        const w = Math.min(BLOCK, fw - bx)
        const h = Math.min(BLOCK, fh - by)
        ctx.drawImage(image, fx + bx, fy + by, w, h, bx - ax, by - ay, w, h)
      }
    }
  }

  // The crescent, convex ahead: inside a disc, outside the same disc pushed back; a rim, a
  // middle and a core, two looks swapped as it flies; it comes apart over its last stretch
  const drawWave = (dt: number) => {
    const travelled = dt * WAVE_SPEED
    const left = 1 - travelled / reach
    const r = Math.round(15 + 20 * clamp(dt / 450))
    const back = r * 0.55
    const cx = 26 + Math.round(travelled / SCALE)
    const cy = -28
    const flicker = Math.floor(dt / 70) % 2 === 0
    const colors = flicker ? ['#2563eb', '#7dd3fc', '#ffffff'] : ['#3b82f6', '#bae6fd', '#e0f4ff']
    const paths = colors.map(() => new Path2D())
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        const outer = Math.hypot(x, y)
        const inner = Math.hypot(x + back, y)
        if (outer > r || inner < r) continue
        if (left < 0.25 && noise(x + cx, y) >= left * 4) continue
        const depth = Math.min(r - outer, inner - r)
        paths[depth < 1 ? 0 : depth < 2.4 ? 1 : 2]!.rect(cx + x, cy + y, 1, 1)
      }
    }
    // Sparks shed behind it
    for (let i = 0; i < 18; i++) {
      const lag = noise(i, Math.floor(dt / 90)) * 40
      paths[1]!.rect(
        Math.round(cx - r * 0.6 - lag),
        Math.round(cy + (noise(i, 7) - 0.5) * r * 1.6),
        1,
        1,
      )
    }
    ctx.setTransform(dpr * SCALE * dir, 0, 0, dpr * SCALE, X * dpr, Y * dpr)
    paths.forEach((path, i) => {
      ctx.fillStyle = colors[i]!
      ctx.fill(path)
    })
  }

  // The call, upright whatever way he faces, popping in
  const drawCall = (age: number) => {
    const pop = 1 + 0.4 * (1 - clamp(age / 140))
    ctx.setTransform(dpr * pop, 0, 0, dpr * pop, X * dpr, (Y - 150) * dpr)
    ctx.font = '700 22px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.lineWidth = 4
    ctx.strokeStyle = '#0b0b0f'
    ctx.fillStyle = '#ffffff'
    ctx.strokeText(CALL, 0, 0)
    ctx.fillText(CALL, 0, 0)
  }

  const start = performance.now()
  const frame = (now: number) => {
    // A frame's timestamp can come before `start`: never a negative time (frame -1)
    const t = Math.max(0, now - start)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, el.width, el.height)

    if (t < length) {
      const id = move.frames[Math.min(move.frames.length - 1, Math.floor(t / FRAME_MS))]!
      drawFrame(id, Math.min(t / SPAWN_MS, (length - t) / FOLD_MS) * 1.3)
    }
    const flying = t >= release && (t - release) * WAVE_SPEED < reach
    if (flying) drawWave(t - release)
    if (t >= release - 3 * FRAME_MS && t < release + 10 * FRAME_MS) {
      drawCall(t - release + 3 * FRAME_MS)
    }

    if (t >= length && !flying) emit('done')
    else raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
})
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <canvas ref="canvas" class="ichigo" aria-hidden="true" />
</template>

<style scoped>
.ichigo {
  position: fixed;
  inset: 0;
  z-index: 200;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* His black robe on a dark page: a pale reiatsu around him */
:global(.dark) .ichigo,
:global(.blur) .ichigo {
  filter: drop-shadow(0 0 2px rgb(186 230 253 / 0.75));
}
</style>
