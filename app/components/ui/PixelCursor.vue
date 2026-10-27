<script setup lang="ts">
// A pixel on the pointer's tip. Now and then it grows block by block into an arcade invader,
// stepping off the tip in one of a D-pad's eight directions, twitches through its two frames,
// sometimes turns into another one somewhere else, then shrinks back onto the tip.
// Decorative: a mouse or trackpad only, never under reduced motion.

// The grid every shape is centred in, in blocks of CELL px
const W = 16
const H = 8
const CELL = 3
// A D-pad's eight directions, and how far a shape steps off the tip along them (px): out
// from under the arrow
const DIRECTIONS = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
] as const
const STEP = { x: 34, y: 26 }

const REST = ['##', '##']
// Two frames each, after the 1978 sprites
const SPRITES: [string[], string[]][] = [
  [
    [
      '...##...',
      '..####..',
      '.######.',
      '##.##.##',
      '########',
      '..#..#..',
      '.#.##.#.',
      '#.#..#.#',
    ],
    [
      '...##...',
      '..####..',
      '.######.',
      '##.##.##',
      '########',
      '.#.##.#.',
      '#......#',
      '.#....#.',
    ],
  ],
  [
    [
      '..#.....#..',
      '...#...#...',
      '..#######..',
      '.##.###.##.',
      '###########',
      '#.#######.#',
      '#.#.....#.#',
      '...##.##...',
    ],
    [
      '..#.....#..',
      '#..#...#..#',
      '#.#######.#',
      '###.###.###',
      '###########',
      '.#########.',
      '..#.....#..',
      '.#.......#.',
    ],
  ],
  [
    [
      '....####....',
      '.##########.',
      '############',
      '###..##..###',
      '############',
      '...##..##...',
      '..##.##.##..',
      '##........##',
    ],
    [
      '....####....',
      '.##########.',
      '############',
      '###..##..###',
      '############',
      '..###..###..',
      '.##..##..##.',
      '..##....##..',
    ],
  ],
  [
    [
      '.....######.....',
      '...##########...',
      '..############..',
      '.##.##.##.##.##.',
      '################',
      '..###..##..###..',
      '...#........#...',
    ],
    [
      '.....######.....',
      '...##########...',
      '..############..',
      '.#.##.##.##.##.#',
      '################',
      '..###..##..###..',
      '...#........#...',
    ],
  ],
  [
    [
      '..######..',
      '.########.',
      '##..##..##',
      '##..##..##',
      '##########',
      '##########',
      '##########',
      '#.##..##.#',
    ],
    [
      '..######..',
      '.########.',
      '#..##..###',
      '#..##..###',
      '##########',
      '##########',
      '##########',
      '##.#..#.##',
    ],
  ],
]

// Each block switches on after a delay growing from the centre, a little ragged: the shape
// spreads out of the pixel, and folds back into it the other way round
const SPREAD_MS = 280
const delays = Array.from({ length: W * H }, (_, i) => {
  const dx = (i % W) + 0.5 - W / 2
  const dy = Math.floor(i / W) + 0.5 - H / 2
  return Math.min(SPREAD_MS, Math.round(Math.hypot(dx, dy) * 26 + Math.random() * 60))
})

const lit = ref<boolean[]>([])
function draw(rows: string[]) {
  const next = Array<boolean>(W * H).fill(false)
  const ox = Math.floor((W - rows[0]!.length) / 2)
  const oy = Math.floor((H - rows.length) / 2)
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === '#') next[(y + oy) * W + x + ox] = true
  })
  lit.value = next
}
draw(REST)

const reducedMotion = useReducedMotion()
const fine = ref(false)
const enabled = computed(() => fine.value && !reducedMotion.value)
const shown = ref(false)
// Frames swap at once; a change of shape spreads
const snap = ref(false)
const shift = ref({ x: 0, y: 0 })
const el = ref<HTMLElement>()

// The pixel eases towards the pointer, a few frames behind
let x = 0
let y = 0
let tx = 0
let ty = 0
let raf = 0
function step() {
  x += (tx - x) * 0.35
  y += (ty - y) * 0.35
  el.value?.style.setProperty(
    'translate',
    `${Math.round(x - (W * CELL) / 2)}px ${Math.round(y - (H * CELL) / 2)}px`,
  )
  raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(step) : 0
}
function onMove(event: PointerEvent) {
  if (!enabled.value || event.pointerType !== 'mouse') return
  tx = event.clientX
  ty = event.clientY
  // Back in the window: it appears where the pointer is, not sliding in from where it left
  if (!shown.value) {
    x = tx
    y = ty
    shown.value = true
  }
  raf ||= requestAnimationFrame(step)
}
const onLeave = () => (shown.value = false)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
let alive = true
async function perform() {
  let last = -1
  while (alive) {
    await sleep(6000 + Math.random() * 6000)
    if (!alive || !enabled.value || !shown.value || document.hidden) continue
    // One invader, or two in a row
    for (let turn = Math.random() < 0.45 ? 2 : 1; turn > 0 && alive; turn--) {
      let i = last
      while (i === last) i = Math.floor(Math.random() * SPRITES.length)
      last = i
      const [a, b] = SPRITES[i]!
      const [dx, dy] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]!
      shift.value = { x: dx * STEP.x, y: dy * STEP.y }
      snap.value = false
      draw(a)
      await sleep(SPREAD_MS + 220)
      snap.value = true
      for (let frame = 1; frame <= 6 && alive; frame++) {
        draw(frame % 2 ? b : a)
        await sleep(380)
      }
    }
    snap.value = false
    shift.value = { x: 0, y: 0 }
    draw(REST)
  }
}

onMounted(() => {
  fine.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  window.addEventListener('pointermove', onMove, { passive: true })
  document.documentElement.addEventListener('mouseleave', onLeave)
  perform()
})
onBeforeUnmount(() => {
  alive = false
  cancelAnimationFrame(raf)
  window.removeEventListener('pointermove', onMove)
  document.documentElement.removeEventListener('mouseleave', onLeave)
})
</script>

<template>
  <div
    v-if="enabled"
    ref="el"
    class="pixel-cursor"
    :data-shown="shown || undefined"
    :data-snap="snap || undefined"
    :style="{
      '--w': W,
      '--cell': `${CELL}px`,
      '--spread': SPREAD_MS,
      '--sx': `${shift.x}px`,
      '--sy': `${shift.y}px`,
    }"
    aria-hidden="true"
  >
    <span
      v-for="(on, i) in lit"
      :key="i"
      :data-on="on || undefined"
      :style="{ '--d': delays[i] }"
    />
  </div>
</template>

<style scoped>
.pixel-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
  display: grid;
  grid-template-columns: repeat(var(--w), var(--cell));
  grid-auto-rows: var(--cell);
  pointer-events: none;
  opacity: 0;
  /* `translate` follows the pointer (script); the step off the tip moves like a sprite, in
     a few hops */
  transform: translate(var(--sx), var(--sy));
  transition:
    opacity 0.3s ease,
    transform 0.28s steps(4, end);
}

.pixel-cursor[data-shown] {
  opacity: 1;
}

.pixel-cursor span {
  background: var(--color-primary-500);
  scale: 0;
  transition: scale 0.12s linear calc((var(--spread) - var(--d)) * 1ms);
}

.pixel-cursor span[data-on] {
  scale: 1;
  transition-delay: calc(var(--d) * 1ms);
}

.pixel-cursor[data-snap] span {
  transition-delay: 0s;
}
</style>
