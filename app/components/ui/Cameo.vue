<script lang="ts">
// One cameo at a time on the whole site, now and then: the first a while after a page shows,
// the next long after the last one ended. Picked among the panels whose header is on screen
// with room enough, never the same one twice in a row when there is a choice.
interface Stage {
  /** Ready to play: on screen, revealed, with room */
  ready: () => boolean
  play: () => void
}
const stages = new Set<Stage>()
const FIRST = [5000, 11000] as const
const NEXT = [18000, 38000] as const
// Nothing ready (scrolled between panels, page hidden): looked at again soon
const RETRY = [3000, 6000] as const
let timer: ReturnType<typeof setTimeout> | undefined
let playing: Stage | undefined
let last: Stage | undefined

const between = ([a, b]: readonly [number, number]) => a + Math.random() * (b - a)
function plan(range: readonly [number, number]) {
  clearTimeout(timer)
  timer = setTimeout(pick, between(range))
}
function pick() {
  timer = undefined
  if (playing || !stages.size) return
  const calm =
    !document.hidden && !isMotionReduced() && !('pageEnter' in document.documentElement.dataset)
  const ready = calm ? [...stages].filter((stage) => stage.ready()) : []
  if (!ready.length) return plan(RETRY)
  const pool = ready.length > 1 ? ready.filter((stage) => stage !== last) : ready
  playing = last = pool[Math.floor(Math.random() * pool.length)]!
  playing.play()
}
function ended(stage: Stage) {
  if (playing !== stage) return
  playing = undefined
  plan(NEXT)
}
</script>

<script setup lang="ts">
// Where a cameo plays now and then (utils/cameos), in art pixels of Ichigo's size, growing out
// of what it stands on and folding back into it. Decorative, never under reduced motion.
// - `header`, `footer`: the room between a panel row's title or meta and its buttons
//   (Panel.vue), standing on the row's bottom edge, its canvas rising over the panel;
// - `area`: over its positioned parent (a card, a block), standing on its bottom edge, in
//   the widest stretch that no text, picture or control crosses: beside a list's titles, a
//   card's figures, a block of code.
import { CAMEOS, GROW_MS, type CameoName } from '~/utils/cameos'

const props = withDefaults(
  defineProps<{ name: CameoName; place?: 'header' | 'footer' | 'area' }>(),
  {
    place: 'header',
  },
)

// Room left on each side of it (CSS px), and how far a row's canvas rises over the panel
const MARGIN = 10
const ABOVE = 36
// What a cameo must not cover in an area, besides text; `data-cameo-solid` marks what is
// drawn without any (a graph's cells). Not canvases: the cards' own (UiPixelCanvas, the
// dither) lie over all of them, drawing nothing until hovered
const SOLID =
  'img, svg, video, input, textarea, select, button, .btn, .tag, .icon-box, .ticks, [role="img"], [data-cameo-solid]'

const box = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()
const active = ref(false)
// Where it plays in its box (CSS px from the left), picked when it is found ready
let at = 0
let raf = 0

// Art pixels to CSS px: one and a half, whole screen pixels (Ichigo's)
const pixelScale = () => {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  return Math.max(1, Math.floor(1.5 * dpr)) / dpr
}
const dark = () => document.documentElement.matches('.dark, .blur')

// In an area: the stretches of [left, right] that nothing in the panel crosses between top
// and bottom
function freeStretches(el: HTMLElement, left: number, right: number, top: number, bottom: number) {
  const root = el.closest('.panel') ?? el.parentElement!
  const taken: [number, number][] = []
  const crosses = (r: DOMRect) =>
    r.width > 1 && r.bottom > top && r.top < bottom && r.right > left && r.left < right
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const range = document.createRange()
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim()) continue
    range.selectNodeContents(node)
    for (const r of range.getClientRects()) if (crosses(r)) taken.push([r.left, r.right])
  }
  for (const solid of root.querySelectorAll(SOLID)) {
    const r = solid.getBoundingClientRect()
    if (!crosses(r)) continue
    // A marked block reaches as far as what it holds: a graph's row of weeks stops short of
    // its full width
    const ends = solid.hasAttribute('data-cameo-solid')
      ? [...solid.children].map((child) => child.getBoundingClientRect())
      : []
    taken.push(
      ends.length
        ? [Math.min(...ends.map((e) => e.left)), Math.max(...ends.map((e) => e.right))]
        : [r.left, r.right],
    )
  }
  taken.sort((a, b) => a[0] - b[0])
  const free: [number, number][] = []
  let from = left
  for (const [a, b] of taken) {
    if (a > from) free.push([from, a])
    from = Math.max(from, b)
  }
  if (right > from) free.push([from, right])
  return free
}

const stage: Stage = {
  ready() {
    const el = box.value
    const row = el?.parentElement
    if (!el || !row || el.closest('[data-hidden]')) return false
    const cameo = CAMEOS[props.name]
    const [w, h] = [cameo.w * pixelScale(), cameo.h * pixelScale()]
    const room = el.getBoundingClientRect()
    const top = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
    if (props.place !== 'area') {
      at = MARGIN + Math.random() * (room.width - w - 2 * MARGIN)
      return (
        room.width >= w + 2 * MARGIN &&
        // On the row's bottom edge, not over a wrapped line of buttons
        Math.abs(room.bottom - row.getBoundingClientRect().bottom) < 1 &&
        room.top - ABOVE >= top &&
        room.bottom <= window.innerHeight
      )
    }
    const [ground, roof] = [room.bottom - 1, room.bottom - 1 - h]
    if (roof < top || ground > window.innerHeight) return false
    // The rightmost stretch it fits in, somewhere in its right part
    const fits = freeStretches(el, room.left + MARGIN, room.right - MARGIN, roof, ground).filter(
      ([a, b]) => b - a >= w + 2 * MARGIN,
    )
    const stretch = fits.at(-1)
    if (!stretch) return false
    const slack = stretch[1] - stretch[0] - w - 2 * MARGIN
    at = stretch[0] - room.left + MARGIN + slack * (0.5 + Math.random() * 0.5)
    return true
  },
  play() {
    active.value = true
    nextTick(run)
  },
}

function run() {
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx || !box.value) return stop()
  const cameo = CAMEOS[props.name]
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const scale = pixelScale()
  const [width, height] = [el.clientWidth, el.clientHeight]
  el.width = Math.round(width * dpr)
  el.height = Math.round(height * dpr)
  ctx.imageSmoothingEnabled = false
  // The frame is painted at its art size, then drawn up to scale
  const art = document.createElement('canvas')
  art.width = cameo.w
  art.height = cameo.h
  const paint = art.getContext('2d')!
  const image = paint.createImageData(cameo.w, cameo.h)
  // Where it was found room for, on whole device pixels
  const x = Math.round(at * dpr)
  const y = Math.round((height - cameo.h * scale) * dpr)

  const start = performance.now()
  const frame = (now: number) => {
    const t = Math.max(0, now - start)
    if (t >= cameo.duration) return stop()
    paint.putImageData(cameo.paint(t, dark()).toImage(paint, image), 0, 0)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, el.width, el.height)
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, x, y)
    const level = Math.min(t / GROW_MS, (cameo.duration - t) / GROW_MS) * GROWN
    drawGrowing(ctx, art, [0, 0, cameo.w, cameo.h], [0, 0], cameo.origin, level, 3, cameo.spread)
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
}

function stop() {
  cancelAnimationFrame(raf)
  active.value = false
  ended(stage)
}

const reducedMotion = useReducedMotion()
watch(reducedMotion, (reduced) => reduced && active.value && stop())
onMounted(() => {
  stages.add(stage)
  if (!timer && !playing) plan(FIRST)
})
onBeforeUnmount(() => {
  if (active.value) stop()
  stages.delete(stage)
  if (!stages.size) {
    clearTimeout(timer)
    timer = undefined
  }
})
</script>

<template>
  <!-- In a row, it grows into the room between the title or meta and the buttons; its margins
       take back the gaps on each side, so the row lays out as it did without it. In an area,
       it lies over its parent. -->
  <div
    ref="box"
    :data-cameo="name"
    :class="[
      'pointer-events-none',
      place === 'area'
        ? 'absolute inset-0 z-20 m-0 border-0'
        : ['relative -mx-2 min-w-0 flex-1 self-stretch', place === 'footer' ? '-my-2.5' : '-my-2'],
    ]"
    aria-hidden="true"
  >
    <canvas
      v-if="active"
      ref="canvas"
      :class="['cameo absolute left-0 w-full', place === 'area' ? 'bottom-px' : 'bottom-0']"
      :style="{
        height: place === 'area' ? `${CAMEOS[name].h * pixelScale()}px` : `calc(100% + ${ABOVE}px)`,
      }"
    />
  </div>
</template>

<style scoped>
/* A very dark grey halo on a dark page, like Ichigo's. Not :global(.dark) .cameo: Vue
   compiles it to the bare global selector */
:is(.dark, .blur) .cameo {
  filter: drop-shadow(0 0 2px var(--color-neutral-700));
}
</style>
