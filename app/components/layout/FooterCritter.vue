<script setup lang="ts">
// Now and then, on the footer's top edge, one of the pointer's invaders (utils/invaders) runs
// in from a side in its own colour of the theme, marching on its two frames, a trail behind it
// that follows its jumps, and runs back and forth. Its favourite food pops up here and there
// over the edge: it leaps to catch it; an obstacle rises now and then in its way (a rock,
// spikes, a cactus, a crate): it vaults it; a bird flies at it now and then at head height: it
// ducks under; and it hops now and then for nothing. After a while it runs off, and some time later another one
// comes. A click on it blows it up, and the next one comes as if it had left. One at a time,
// only while the footer is in view. Decorative, never under reduced motion.

const CELL = 2
// px/s, and px walked between two frames
const SPEED = 150
const STRIDE = 6 * CELL
// A long jump for the food, a short hop for nothing
const JUMP = { lift: 24, duration: 720 }
const VAULT = { lift: 16, duration: 480 }
const TALL = { lift: 24, duration: 600 }
const HOP = { lift: 8, duration: 360 }
// Its trail: a block dropped behind it every few ms, where it is (along its jumps too), gone
// after TRAIL_LIFE
const TRAIL_EVERY = 40
const TRAIL_LIFE = 500
// When the first one comes once the footer shows, how long one stays, and when the next one
// comes after it left (ms)
const FIRST = [4000, 10000] as const
const STAY = [12000, 22000] as const
const NEXT = [10000, 24000] as const
// Its food pops up every so often, two at most at once; an obstacle now and then, one at a
// time, gone after a while
const FOOD_EVERY = [1400, 3200] as const
const FOOD_MAX = 2
const OBSTACLE_EVERY = [3000, 6500] as const
const OBSTACLE_LIFE = 5000
// How long the explosion stays when it is shot (ms)
const DEATH = 420
// A caught food bursts on the diagonals
const BURST = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
] as const

// Its favourite food, in the theme's palette (theme.css: its 600 on light, its 500 on dark):
// rows, a fill class per letter, and a second frame it plays with the first (FOOD_FRAME ms)
type Art = { rows: string[]; colors: Record<string, string> }
const FOOD_FRAME = 280
const YELLOW = 'fill-yellow-600 dark:fill-yellow-500'
const RED = 'fill-red-600 dark:fill-red-500'
const FOODS = {
  // It pulses
  pellet: {
    rows: ['.##.', '####', '####', '.##.'],
    alt: ['....', '.##.', '.##.', '....'],
    colors: { '#': YELLOW },
  },
  // It swings on its stem
  cherry: {
    rows: ['...g.', '..gg.', '.g..g', 'rr.rr', 'rr.rr'],
    alt: ['..g..', '..gg.', '.g..g', 'rr.rr', 'rr.rr'],
    colors: { g: 'fill-green-600 dark:fill-green-500', r: RED },
  },
  // It twinkles
  star: {
    rows: ['..#..', '.###.', '#####', '.###.', '.#.#.'],
    alt: ['#.#.#', '.###.', '##.##', '.###.', '#.#.#'],
    colors: { '#': YELLOW },
  },
  // Its spots blink
  mushroom: {
    rows: ['.rrr.', 'rwrwr', 'rrrrr', '.sss.', '.sss.'],
    alt: ['.rwr.', 'rrrrr', 'wrrrw', '.sss.', '.sss.'],
    colors: { r: RED, w: 'fill-neutral-50', s: 'fill-primary-300' },
  },
  // It spins
  cookie: {
    rows: ['.###.', '#c#c#', '##c##', '#c###', '.###.'],
    alt: ['.###.', '##c##', '#c#c#', '###c#', '.###.'],
    colors: { '#': 'fill-primary-400', c: 'fill-primary-800' },
  },
} satisfies Record<string, Art & { alt: string[] }>
// What rises in its way, in the theme's palette: anything over three rows takes a higher jump
const ROCK = 'fill-neutral-400 dark:fill-neutral-600'
const OBSTACLES = [
  // A rock
  { rows: ['..##..', '.####.', '######'], colors: { '#': ROCK } },
  // Spikes
  { rows: ['#...#...#', '##.###.##', '#########'], colors: { '#': ROCK } },
  // A cactus
  {
    rows: ['..#..', '#.#..', '#.#.#', '###.#', '..###', '..#..'],
    colors: { '#': 'fill-green-600 dark:fill-green-500' },
  },
  // A crate
  {
    rows: ['#####', '##.##', '#.#.#', '##.##', '#####'],
    colors: { '#': 'fill-primary-700 dark:fill-primary-600' },
  },
] satisfies Art[]
// A bird flies at it now and then (px/s), flapping; drawn flying right, mirrored to the left
const BIRD_SPEED = 140
const BIRD = [
  ['#.....', '##..#.', '.####y', '..##..'],
  ['......', '..#...', '#####y', '##.#..'],
]
// The arcade's explosion, where it was shot
const EXPLOSION = [
  '#..#...#..#',
  '.#..#.#..#.',
  '...........',
  '##.......##',
  '...........',
  '.#..#.#..#.',
  '#..#...#..#',
]
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
}
const pass = ref<{
  tone: string
  frames: ReturnType<typeof blocks>[]
  crouch: ReturnType<typeof blocks>[]
  w: number
  h: number
  food: { frames: ReturnType<typeof blocks>[]; w: number; h: number }
}>()
const foods = ref<Food[]>([])
const obstacles = ref<{ id: number; x: number; t: number; art: number }[]>([])
const obstacleArts = OBSTACLES.map((art) => ({
  blocks: blocks(art),
  w: art.rows[0]!.length * CELL,
  h: art.rows.length * CELL,
  tall: art.rows.length > 3,
}))
const BIRD_COLORS = { '#': 'fill-neutral-600 dark:fill-neutral-400', y: YELLOW }
const birdArts = {
  w: BIRD[0]![0]!.length * CELL,
  h: BIRD[0]!.length * CELL,
  // Flying right, then left
  frames: [
    BIRD.map((rows) => blocks({ rows, colors: BIRD_COLORS })),
    BIRD.map((rows) =>
      blocks({ rows: rows.map((r) => [...r].reverse().join('')), colors: BIRD_COLORS }),
    ),
  ],
}
const birds = ref<{ id: number; x: number; dir: number }[]>([])
// Ducking under a bird: two rows of its frames left out, on the ground
const crouching = ref(false)
const explosion = { blocks: blocks(EXPLOSION), w: EXPLOSION[0]!.length * CELL }
const dead = ref<{ x: number; y: number }>()
const bursts = ref<{ id: number; x: number; y: number; tone: string }[]>([])
const frame = ref(0)
const foodFrame = ref(0)
const at = reactive({ x: 0, y: 0 })
const trail = ref<{ id: number; x: number; y: number; t: number }[]>([])

let x = 0
// -1 to the left, 1 to the right
let dir = 1
let walked = 0
let width = 0
let last = 0
let raf = 0
let nextHop = 0
let nextFood = 0
let nextObstacle = 0
let leaveAt = 0
let leaving = false
let ids = 0
let sampled = 0
let jump:
  | { start: number; lift: number; duration: number; food?: Food; eaten?: boolean }
  | undefined
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
  width = band.value?.clientWidth ?? 0
  // Out of view, or motion paused: the observer calls the next one when it can show again
  if (!visible || reducedMotion.value) return void (timer = undefined)
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
    crouch: [a, b].map((rows) => blocks(rows.filter((_, r) => r !== 1 && r !== 3))),
    w: a[0]!.length * CELL,
    h: a.length * CELL,
    food: {
      frames: [blocks(food), blocks({ rows: food.alt, colors: food.colors })],
      w: food.rows[0]!.length * CELL,
      h: food.rows.length * CELL,
    },
  }
  // In from either side, just out of the strip
  dir = Math.random() < 0.5 ? -1 : 1
  x = dir < 0 ? width : -pass.value.w
  walked = 0
  leaving = false
  foods.value = []
  obstacles.value = []
  birds.value = []
  trail.value = []
  sampled = 0
  jump = undefined
  last = performance.now()
  nextHop = last + between([1200, 2600])
  nextFood = last + between(FOOD_EVERY)
  nextObstacle = last + between(OBSTACLE_EVERY)
  leaveAt = last + between(STAY)
  raf = requestAnimationFrame(step)
}

function end() {
  cancelAnimationFrame(raf)
  raf = 0
  pass.value = undefined
  dead.value = undefined
  crouching.value = false
  foods.value = []
  obstacles.value = []
  birds.value = []
  trail.value = []
  schedule(NEXT)
}

// Shot: it blows up where it stands, its blocks flying off, then the cycle goes on
function kill() {
  const current = pass.value
  if (!current || dead.value) return
  cancelAnimationFrame(raf)
  raf = 0
  dead.value = { x: at.x + current.w / 2 - explosion.w / 2, y: at.y }
  const id = ++ids
  bursts.value.push({ id, x: at.x + current.w / 2, y: at.y + current.h / 2, tone: current.tone })
  setTimeout(() => (bursts.value = bursts.value.filter((b) => b.id !== id)), 600)
  clearTimeout(timer)
  timer = setTimeout(end, DEATH)
}

function step(now: number) {
  const current = pass.value
  if (!current) return
  // A frame can stamp itself before the last one: never walk back
  const dx = (SPEED * Math.min(50, Math.max(0, now - last))) / 1000
  last = now
  x += dir * dx
  walked += dx
  frame.value = Math.floor(walked / STRIDE) % 2
  foodFrame.value = Math.floor(now / FOOD_FRAME) % 2
  // Back and forth between the ends, until it is time to go: then on through the end
  if (now >= leaveAt) leaving = true
  if (!leaving && dir < 0 && x <= 0) dir = 1
  else if (!leaving && dir > 0 && x >= width - current.w) dir = -1
  const centre = x + current.w / 2
  if (!leaving && now >= nextFood) {
    nextFood = now + between(FOOD_EVERY)
    if (foods.value.length < FOOD_MAX) {
      // Somewhere over the edge, not right on it nor on another one
      const spot = width * between([0.08, 0.92])
      if (Math.abs(spot - centre) > 60 && foods.value.every((f) => Math.abs(f.x - spot) > 48))
        foods.value.push({ id: ++ids, x: spot })
    }
  }
  // Birds fly on, and are gone past the ends
  for (const bird of birds.value) bird.x += bird.dir * (BIRD_SPEED / SPEED) * dx
  birds.value = birds.value.filter((b) => b.x > -birdArts.w && b.x < width)
  // An obstacle rises ahead of it, far enough to be seen coming; it sinks back after a while.
  // Or a bird comes from the end it runs to.
  obstacles.value = obstacles.value.filter((o) => now - o.t < OBSTACLE_LIFE)
  if (!leaving && now >= nextObstacle) {
    nextObstacle = now + between(OBSTACLE_EVERY)
    // Within the strip's width, a phone's as a desktop's
    const spot = centre + dir * between([Math.min(90, width * 0.2), Math.min(220, width * 0.45)])
    // One bird and one obstacle at a time at most
    if (Math.random() < 0.35) {
      if (!birds.value.length)
        birds.value.push({
          id: ++ids,
          x: dir > 0 ? width - 1 : -birdArts.w + 1,
          dir: -dir,
        })
    } else if (!obstacles.value.length && spot > width * 0.08 && spot < width * 0.92)
      obstacles.value.push({
        id: ++ids,
        x: spot,
        t: now,
        art: Math.floor(Math.random() * OBSTACLES.length),
      })
  }
  // Within reach ahead: the top of an arc of `duration` lands right over it
  const ahead = (target: number, duration: number) => {
    const d = (target - centre) * dir
    return d >= 0 && d <= (SPEED * duration) / 2000
  }
  // A bird at head height: it ducks while it passes over, and does not leap for food or for
  // nothing while one closes in (at both speeds, or at their difference from behind)
  const over = (b: { x: number }) =>
    Math.abs(b.x + birdArts.w / 2 - centre) < (current.w + birdArts.w) / 2 + 10
  const coming = (b: { x: number; dir: number }) => {
    const d = (b.x + birdArts.w / 2 - centre) * dir
    const speed = SPEED - b.dir * dir * BIRD_SPEED
    return speed > 0 && d >= 0 && d <= (speed * JUMP.duration) / 1000
  }
  crouching.value = !jump && birds.value.some(over)
  if (!jump && !crouching.value) {
    const food = foods.value.find((f) => ahead(f.x, JUMP.duration))
    const obstacle = obstacles.value.find((o) =>
      ahead(o.x, obstacleArts[o.art]!.tall ? TALL.duration : VAULT.duration),
    )
    // Stays down while a bird comes
    const waiting = birds.value.some(coming)
    if (obstacle) jump = { start: now, ...(obstacleArts[obstacle.art]!.tall ? TALL : VAULT) }
    else if (food && !waiting) jump = { start: now, ...JUMP, food }
    else if (now > nextHop && !waiting) {
      if (Math.random() < 0.35) jump = { start: now, ...HOP }
      nextHop = now + between([1200, 2600])
    }
  }
  let lift = 0
  if (jump) {
    const p = Math.min(1, Math.max(0, (now - jump.start) / jump.duration))
    lift = Math.sin(Math.PI * p) * jump.lift
    if (jump.food && !jump.eaten && p >= 0.5) {
      jump.eaten = true
      const eaten = jump.food
      foods.value = foods.value.filter((f) => f.id !== eaten.id)
      const id = ++ids
      bursts.value.push({
        id,
        x: eaten.x,
        y: foodBottom.value + current.food.h / 2,
        tone: current.tone,
      })
      setTimeout(() => (bursts.value = bursts.value.filter((b) => b.id !== id)), 600)
    }
    if (p >= 1) jump = undefined
  }
  at.x = snapped(x)
  at.y = snapped(lift)
  if (now - sampled >= TRAIL_EVERY) {
    sampled = now
    trail.value = [
      ...trail.value.filter((d) => now - d.t < TRAIL_LIFE),
      {
        id: ++ids,
        // Behind it, whichever way it runs
        x: dir < 0 ? at.x + current.w - CELL : at.x,
        y: at.y + (Math.random() < 0.5 ? 0 : CELL),
        t: now,
      },
    ]
  }
  if (leaving && (x < -current.w || x > width)) return end()
  raf = requestAnimationFrame(step)
}

// Where the food hangs: at the top of the jump, the invader's head just reaching it
const foodBottom = computed(() => (pass.value ? pass.value.h + JUMP.lift - 2 * CELL : 0))

let observer: IntersectionObserver | undefined
// A rotated phone or a resized window: it turns at the new ends, what is past them goes
let resize: ResizeObserver | undefined
function watchBand() {
  nextTick(() => {
    if (!band.value) return
    observer = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting
      if (visible && !timer && !pass.value) schedule(FIRST)
      // Scrolled away: it does not run on unseen, the next one comes when the footer shows
      else if (!visible && pass.value && !dead.value) end()
    })
    observer.observe(band.value.parentElement ?? band.value)
    resize = new ResizeObserver(([entry]) => {
      if (!entry || !pass.value) return
      width = entry.contentRect.width
      x = Math.min(x, width)
      foods.value = foods.value.filter((f) => f.x < width)
      obstacles.value = obstacles.value.filter((o) => o.x < width)
      birds.value = birds.value.filter((b) => b.x < width)
    })
    resize.observe(band.value)
  })
}
function unwatchBand() {
  observer?.disconnect()
  resize?.disconnect()
  if (pass.value) end()
  clearTimeout(timer)
  timer = undefined
  cancelAnimationFrame(raf)
}
onMounted(() => {
  mounted.value = true
  if (!reducedMotion.value) watchBand()
})
// The pause control (or the system setting, changed live): it goes at once, and the cycle
// starts over when motion is back
watch(reducedMotion, (reduced) => (reduced ? unwatchBand() : watchBand()))
onBeforeUnmount(unwatchBand)
</script>

<template>
  <div v-if="mounted && !reducedMotion" ref="band" class="footer-critter" aria-hidden="true">
    <template v-if="pass">
      <svg
        v-for="food in foods"
        :key="food.id"
        class="footer-critter-food"
        :width="pass.food.w"
        :height="pass.food.h"
        shape-rendering="crispEdges"
        :style="{ left: `${food.x - pass.food.w / 2}px`, bottom: `${foodBottom}px` }"
      >
        <rect
          v-for="(b, i) in pass.food.frames[foodFrame]"
          :key="i"
          :x="b.x"
          :y="b.y"
          :width="CELL"
          :height="CELL"
          :class="b.fill"
        />
      </svg>
      <svg
        v-for="obstacle in obstacles"
        :key="obstacle.id"
        class="footer-critter-obstacle"
        :width="obstacleArts[obstacle.art]!.w"
        :height="obstacleArts[obstacle.art]!.h"
        shape-rendering="crispEdges"
        :style="{
          left: `${obstacle.x - obstacleArts[obstacle.art]!.w / 2}px`,
          '--life': `${OBSTACLE_LIFE}ms`,
        }"
      >
        <rect
          v-for="(b, i) in obstacleArts[obstacle.art]!.blocks"
          :key="i"
          :x="b.x"
          :y="b.y"
          :width="CELL"
          :height="CELL"
          :class="b.fill"
        />
      </svg>
      <svg
        v-for="bird in birds"
        :key="bird.id"
        class="footer-critter-bird"
        :width="birdArts.w"
        :height="birdArts.h"
        shape-rendering="crispEdges"
        :style="{ left: `${bird.x}px`, bottom: `${pass.h - CELL}px` }"
      >
        <rect
          v-for="(b, i) in birdArts.frames[bird.dir > 0 ? 0 : 1]![foodFrame]"
          :key="i"
          :x="b.x"
          :y="b.y"
          :width="CELL"
          :height="CELL"
          :class="b.fill"
        />
      </svg>
      <span
        v-for="dust in trail"
        :key="dust.id"
        :class="['footer-critter-dust', pass.tone]"
        :style="{ left: `${dust.x}px`, bottom: `${dust.y}px` }"
      />
      <svg
        v-if="dead"
        :class="['footer-critter-body footer-critter-dead', pass.tone]"
        :width="explosion.w"
        :height="EXPLOSION.length * CELL"
        shape-rendering="crispEdges"
        :style="{ translate: `${dead.x}px ${-dead.y}px` }"
      >
        <rect
          v-for="(b, i) in explosion.blocks"
          :key="i"
          :x="b.x"
          :y="b.y"
          :width="CELL"
          :height="CELL"
          fill="currentColor"
        />
      </svg>
      <svg
        v-else
        :class="['footer-critter-body footer-critter-alive', pass.tone]"
        :width="pass.w"
        :height="crouching ? pass.h - 2 * CELL : pass.h"
        shape-rendering="crispEdges"
        :style="{ translate: `${at.x}px ${-at.y}px` }"
        @pointerdown="kill"
      >
        <rect
          v-for="(b, i) in (crouching ? pass.crouch : pass.frames)[frame]"
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
/* A strip standing on the panel's top border, inset by its corners: the invader runs in and
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

.footer-critter-bird {
  position: absolute;
}

.footer-critter-body {
  position: absolute;
  bottom: 0;
  left: 0;
}

/* The only thing in the strip that takes the pointer: shooting it */
.footer-critter-alive {
  pointer-events: auto;
  cursor: crosshair;
}

.footer-critter-dead {
  animation: footer-critter-dust 0.42s steps(3, end) forwards;
}

/* An obstacle rises out of the edge, and sinks back in its last moment */
.footer-critter-obstacle {
  position: absolute;
  bottom: 0;
  transform-origin: bottom;
  animation:
    footer-critter-rise 0.24s steps(3, end) both,
    footer-critter-rise 0.24s steps(3, end) calc(var(--life) - 0.24s) reverse forwards;
}

@keyframes footer-critter-rise {
  from {
    scale: 1 0;
  }
}

/* The food pops up, then bobs on two frames, like the invader walks */
.footer-critter-food {
  position: absolute;
  animation:
    footer-critter-pop 0.24s steps(3, end) both,
    footer-critter-bob 0.9s steps(1) 0.24s infinite;
}

@keyframes footer-critter-pop {
  from {
    scale: 0;
  }
}

@keyframes footer-critter-bob {
  50% {
    translate: 0 -2px;
  }
}

/* Its trail fades out on a few steps, like the rest */
.footer-critter-dust {
  position: absolute;
  width: 2px;
  height: 2px;
  background: currentColor;
  animation: footer-critter-dust 0.5s steps(4, end) forwards;
}

@keyframes footer-critter-dust {
  to {
    opacity: 0;
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
