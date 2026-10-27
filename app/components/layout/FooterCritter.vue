<script setup lang="ts">
// Now and then, on the footer's top edge, one of the pointer's invaders (utils/invaders) walks
// in from the right in its own colour of the theme, marching on its two frames, and crosses to
// the left. One or two of its favourite food hang on its way: it leaps to catch them, and hops
// now and then for nothing. One at a time, only while the footer is in view. Decorative, never
// under reduced motion.

const CELL = 2
// px/s, and px walked between two frames
const SPEED = 96
const STRIDE = 6 * CELL
// A long jump for the food, a short hop for nothing
const JUMP = { lift: 24, duration: 880 }
const HOP = { lift: 8, duration: 420 }
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

// Its favourite food, in the theme's palette (theme.css: its 600 on light, its 500 on dark):
// rows, a fill class per letter
type Art = { rows: string[]; colors: Record<string, string> }
const YELLOW = 'fill-yellow-600 dark:fill-yellow-500'
const RED = 'fill-red-600 dark:fill-red-500'
const FOODS = {
  pellet: { rows: ['.##.', '####', '####', '.##.'], colors: { '#': YELLOW } },
  cherry: {
    rows: ['...g.', '..gg.', '.g..g', 'rr.rr', 'rr.rr'],
    colors: { g: 'fill-green-600 dark:fill-green-500', r: RED },
  },
  star: { rows: ['..#..', '.###.', '#####', '.###.', '.#.#.'], colors: { '#': YELLOW } },
  mushroom: {
    rows: ['.rrr.', 'rwrwr', 'rrrrr', '.sss.', '.sss.'],
    colors: { r: RED, w: 'fill-neutral-50', s: 'fill-primary-300' },
  },
  cookie: {
    rows: ['.###.', '#c#c#', '##c##', '#c###', '.###.'],
    colors: { '#': 'fill-primary-400', c: 'fill-primary-800' },
  },
} satisfies Record<string, Art>
// One per invader, in INVADERS' order: the squid eats pellets, the crab cherries…
const VARIANTS = [
  { tone: 'text-purple-600 dark:text-purple-500', food: FOODS.pellet },
  { tone: 'text-green-600 dark:text-green-500', food: FOODS.cherry },
  { tone: 'text-blue-600 dark:text-blue-500', food: FOODS.star },
  { tone: 'text-cyan-600 dark:text-cyan-500', food: FOODS.mushroom },
  { tone: 'text-primary-600 dark:text-primary-500', food: FOODS.cookie },
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
  tone: string
  frames: ReturnType<typeof blocks>[]
  w: number
  h: number
  food: { blocks: ReturnType<typeof blocks>; w: number; h: number }
}>()
const foods = ref<Food[]>([])
const bursts = ref<{ id: number; x: number; y: number; tone: string }[]>([])
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
    tone: variant.tone,
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
        tone: current.tone,
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
          :class="b.fill"
        />
      </svg>
      <svg
        :class="['footer-critter-body', pass.tone]"
        :width="pass.w"
        :height="pass.h"
        shape-rendering="crispEdges"
        :style="{ translate: `${at.x}px ${-at.y}px` }"
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
      :class="['footer-critter-burst', burst.tone]"
      :style="{ left: `${burst.x}px`, bottom: `${burst.y}px` }"
    >
      <span
        v-for="([dx, dy], i) in BURST"
        :key="i"
        :style="{ '--dx': `${dx * 12}px`, '--dy': `${dy * 12}px` }"
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
  height: 4rem;
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
    translate: 0 -2px;
  }
}

.footer-critter-burst {
  position: absolute;
}

.footer-critter-burst span {
  position: absolute;
  width: 2px;
  height: 2px;
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
