<script setup lang="ts">
// Now and then, on the footer's top edge, one of the pointer's invaders (utils/invaders) walks
// in from the right in its own colour, marching on its two frames, and crosses to the left.
// One or two of its favourite food hang on its way: it jumps to catch them, and hops now and
// then for nothing. One at a time, only while the footer is in view. Decorative, never under
// reduced motion.

const CELL = 3
// px/s, and px walked between two frames
const SPEED = 54
const STRIDE = 4 * CELL
const JUMP = { lift: 30, duration: 560 }
const HOP = { lift: 9, duration: 300 }
// Between two passes (ms): the first once the footer shows, then after each one
const FIRST = [4000, 10000] as const
const NEXT = [14000, 32000] as const
// A caught food bursts on the diagonals
const BURST = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
] as const

// Its favourite food: rows, a colour per letter
type Art = { rows: string[]; colors: Record<string, string> }
const FOODS = {
  pellet: { rows: ['.##.', '####', '####', '.##.'], colors: { '#': '#eab308' } },
  cherry: {
    rows: ['...g.', '..gg.', '.g..g', 'rr.rr', 'rr.rr'],
    colors: { g: '#22c55e', r: '#ef4444' },
  },
  star: { rows: ['..#..', '.###.', '#####', '.###.', '.#.#.'], colors: { '#': '#f59e0b' } },
  mushroom: {
    rows: ['.rrr.', 'rwrwr', 'rrrrr', '.sss.', '.sss.'],
    colors: { r: '#ef4444', w: '#fafafa', s: '#d6b38a' },
  },
  cookie: {
    rows: ['.###.', '#c#c#', '##c##', '#c###', '.###.'],
    colors: { '#': '#c8925a', c: '#6b3f22' },
  },
} satisfies Record<string, Art>
// One per invader, in INVADERS' order: the squid eats pellets, the crab cherries…
const VARIANTS = [
  { color: '#8b5cf6', food: FOODS.pellet },
  { color: '#22c55e', food: FOODS.cherry },
  { color: '#0ea5e9', food: FOODS.star },
  { color: '#ec4899', food: FOODS.mushroom },
  { color: 'var(--color-primary-500)', food: FOODS.cookie },
]

// The blocks of a picture, one rect each
const blocks = (art: Art | string[]) => {
  const { rows, colors } = Array.isArray(art) ? { rows: art, colors: { '#': '' } } : art
  return rows.flatMap((row, y) =>
    [...row].flatMap((c, x) =>
      c in colors ? [{ x: x * CELL, y: y * CELL, fill: colors[c] }] : [],
    ),
  )
}

const reducedMotion = useReducedMotion()
const mounted = ref(false)
const band = ref<HTMLElement>()

interface Food {
  id: number
  x: number
  eaten: boolean
}
const pass = ref<{
  color: string
  frames: ReturnType<typeof blocks>[]
  w: number
  h: number
  food: { blocks: ReturnType<typeof blocks>; w: number; h: number }
}>()
const foods = ref<Food[]>([])
const bursts = ref<{ id: number; x: number; y: number; color: string }[]>([])
const frame = ref(0)
const at = reactive({ x: 0, y: 0 })

let x = 0
let from = 0
let last = 0
let raf = 0
let nextHop = 0
let ids = 0
let jump: { start: number; lift: number; duration: number; food?: Food } | undefined
let timer: ReturnType<typeof setTimeout> | undefined
let visible = false
let lastVariant = -1

const between = ([a, b]: readonly [number, number]) => a + Math.random() * (b - a)
const snapped = (v: number) => Math.round(v / CELL) * CELL

function schedule(range: readonly [number, number]) {
  clearTimeout(timer)
  timer = setTimeout(start, between(range))
}

function start() {
  const width = band.value?.clientWidth ?? 0
  // Out of view, the observer calls the next one when the footer shows again
  if (!visible) return void (timer = undefined)
  if (document.hidden || pass.value || width < 240) return schedule(FIRST)
  let i = lastVariant
  while (i === lastVariant) i = Math.floor(Math.random() * INVADERS.length)
  lastVariant = i
  const variant = VARIANTS[i]!
  const [a, b] = INVADERS[i]!
  const food = variant.food
  pass.value = {
    color: variant.color,
    frames: [blocks(a), blocks(b)],
    w: a[0]!.length * CELL,
    h: a.length * CELL,
    food: { blocks: blocks(food), w: food.rows[0]!.length * CELL, h: food.rows.length * CELL },
  }
  // One or two on its way, apart, away from the ends
  const first = width * between([0.25, 0.5])
  foods.value = [{ id: ++ids, x: first, eaten: false }]
  if (Math.random() < 0.5)
    foods.value.push({ id: ++ids, x: first + width * between([0.2, 0.3]), eaten: false })
  x = from = width
  jump = undefined
  last = performance.now()
  nextHop = last + between([1200, 2600])
  raf = requestAnimationFrame(step)
}

function end() {
  cancelAnimationFrame(raf)
  raf = 0
  pass.value = undefined
  foods.value = []
  schedule(NEXT)
}

function step(now: number) {
  const current = pass.value
  if (!current) return
  // A frame can stamp itself before the last one: never walk back
  x -= (SPEED * Math.min(50, Math.max(0, now - last))) / 1000
  last = now
  frame.value = Math.floor((from - x) / STRIDE) % 2
  const centre = x + current.w / 2
  if (!jump) {
    // Take off so that the top of the arc is right under the food
    const food = foods.value.find(
      (f) => !f.eaten && centre >= f.x && centre - f.x <= (SPEED * JUMP.duration) / 2000,
    )
    if (food) jump = { start: now, ...JUMP, food }
    else if (now > nextHop) {
      if (Math.random() < 0.35) jump = { start: now, ...HOP }
      nextHop = now + between([1200, 2600])
    }
  }
  let lift = 0
  if (jump) {
    const p = Math.min(1, Math.max(0, (now - jump.start) / jump.duration))
    lift = Math.sin(Math.PI * p) * jump.lift
    if (jump.food && !jump.food.eaten && p >= 0.5) {
      jump.food.eaten = true
      const id = ++ids
      bursts.value.push({
        id,
        x: jump.food.x,
        y: foodBottom.value + current.food.h / 2,
        color: current.color,
      })
      setTimeout(() => (bursts.value = bursts.value.filter((b) => b.id !== id)), 600)
    }
    if (p >= 1) jump = undefined
  }
  at.x = snapped(x)
  at.y = snapped(lift)
  if (x < -current.w) return end()
  raf = requestAnimationFrame(step)
}

// Where the food hangs: at the top of the jump, the invader's head just reaching it
const foodBottom = computed(() => (pass.value ? pass.value.h + JUMP.lift - 2 * CELL : 0))

let observer: IntersectionObserver | undefined
onMounted(() => {
  mounted.value = true
  if (reducedMotion.value) return
  nextTick(() => {
    if (!band.value) return
    observer = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting
      if (visible && !timer && !pass.value) schedule(FIRST)
    })
    observer.observe(band.value.parentElement ?? band.value)
  })
})
onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(timer)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div v-if="mounted && !reducedMotion" ref="band" class="footer-critter" aria-hidden="true">
    <template v-if="pass">
      <svg
        v-for="food in foods"
        v-show="!food.eaten"
        :key="food.id"
        class="footer-critter-food"
        :width="pass.food.w"
        :height="pass.food.h"
        shape-rendering="crispEdges"
        :style="{ left: `${food.x - pass.food.w / 2}px`, bottom: `${foodBottom}px` }"
      >
        <rect
          v-for="(b, i) in pass.food.blocks"
          :key="i"
          :x="b.x"
          :y="b.y"
          :width="CELL"
          :height="CELL"
          :fill="b.fill"
        />
      </svg>
      <svg
        class="footer-critter-body"
        :width="pass.w"
        :height="pass.h"
        shape-rendering="crispEdges"
        :style="{ translate: `${at.x}px ${-at.y}px`, color: pass.color }"
      >
        <rect
          v-for="(b, i) in pass.frames[frame]"
          :key="i"
          :x="b.x"
          :y="b.y"
          :width="CELL"
          :height="CELL"
          fill="currentColor"
        />
      </svg>
    </template>
    <div
      v-for="burst in bursts"
      :key="burst.id"
      class="footer-critter-burst"
      :style="{ left: `${burst.x}px`, bottom: `${burst.y}px`, color: burst.color }"
    >
      <span
        v-for="([dx, dy], i) in BURST"
        :key="i"
        :style="{ '--dx': `${dx * 14}px`, '--dy': `${dy * 14}px` }"
      />
    </div>
  </div>
</template>

<style scoped>
/* A strip standing on the panel's top border, inset by its corners: the invader walks in and
   out through its ends */
.footer-critter {
  position: absolute;
  right: 1.25rem;
  bottom: 100%;
  left: 1.25rem;
  height: 4.5rem;
  overflow: clip;
  pointer-events: none;
}

.footer-critter-body {
  position: absolute;
  bottom: 0;
  left: 0;
}

/* The food bobs on two frames, like the invader walks */
.footer-critter-food {
  position: absolute;
  animation: footer-critter-bob 0.9s steps(1) infinite;
}

@keyframes footer-critter-bob {
  50% {
    translate: 0 -3px;
  }
}

.footer-critter-burst {
  position: absolute;
}

.footer-critter-burst span {
  position: absolute;
  width: 3px;
  height: 3px;
  background: currentColor;
  animation: footer-critter-burst 0.5s steps(5, end) forwards;
}

@keyframes footer-critter-burst {
  to {
    translate: var(--dx) var(--dy);
    opacity: 0;
  }
}
</style>
