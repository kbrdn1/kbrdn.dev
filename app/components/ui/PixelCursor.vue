<script setup lang="ts">
// A pixel on the pointer's tip. Now and then it grows block by block into an arcade invader,
// hops off the tip in one of a D-pad's eight directions, marches on a few steps through its
// two frames like in the arcade, sometimes turns into another one, then hops back onto the
// tip. A click throws a burst of blocks; a triple click calls Ichigo (UiIchigo).
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
// The hop's height, and how far each frame marches on (px)
const LIFT = 12
const MARCH = CELL

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
const el = ref<HTMLElement>()
const shape = ref<HTMLElement>()

// Where the shape stands off the tip: it hops there on an arc, or steps there at once,
// snapped to the blocks so it moves like a sprite
let hop = { from: { x: 0, y: 0 }, to: { x: 0, y: 0 }, start: 0, duration: 0, lift: 0 }
function offset(now: number) {
  const p = hop.duration ? Math.min(1, (now - hop.start) / hop.duration) : 1
  const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2
  const snapped = (v: number) => Math.round(v / CELL) * CELL
  return {
    x: snapped(hop.from.x + (hop.to.x - hop.from.x) * e),
    y: snapped(hop.from.y + (hop.to.y - hop.from.y) * e - Math.sin(Math.PI * p) * hop.lift),
    moving: p < 1,
  }
}
function moveTo(to: { x: number; y: number }, duration = 0, lift = 0) {
  const now = performance.now()
  const { x, y } = offset(now)
  hop = { from: { x, y }, to, start: now, duration, lift }
  raf ||= requestAnimationFrame(step)
}

// The pixel eases towards the pointer, a few frames behind
let x = 0
let y = 0
let tx = 0
let ty = 0
let raf = 0
function step(now: number) {
  x += (tx - x) * 0.35
  y += (ty - y) * 0.35
  el.value?.style.setProperty(
    'translate',
    `${Math.round(x - (W * CELL) / 2)}px ${Math.round(y - (H * CELL) / 2)}px`,
  )
  const off = offset(now)
  shape.value?.style.setProperty('translate', `${off.x}px ${off.y}px`)
  raf = off.moving || Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(step) : 0
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

// A click throws eight blocks along the D-pad; a triple click calls Ichigo where it landed
const bursts = ref<number[]>([])
let burstId = 0
const ichigo = ref<{ x: number; y: number }>()
function onClick(event: MouseEvent) {
  if (!enabled.value || !shown.value) return
  if (event.detail === 3 && !ichigo.value) {
    // The triple click also selected a paragraph
    getSelection()?.removeAllRanges()
    ichigo.value = { x: event.clientX, y: event.clientY }
    return
  }
  const id = ++burstId
  bursts.value.push(id)
  setTimeout(() => (bursts.value = bursts.value.filter((b) => b !== id)), 600)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
let alive = true
async function perform() {
  let last = -1
  while (alive) {
    await sleep(6000 + Math.random() * 6000)
    if (!alive || !enabled.value || !shown.value || ichigo.value || document.hidden) continue
    // One invader, or two in a row
    for (let turn = Math.random() < 0.45 ? 2 : 1; turn > 0 && alive; turn--) {
      let i = last
      while (i === last) i = Math.floor(Math.random() * SPRITES.length)
      last = i
      const [a, b] = SPRITES[i]!
      const [dx, dy] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]!
      let at = { x: dx * STEP.x, y: dy * STEP.y }
      moveTo(at, 340, LIFT)
      snap.value = false
      draw(a)
      await sleep(SPREAD_MS + 220)
      snap.value = true
      // The march: a step on with every frame
      for (let frame = 1; frame <= 6 && alive; frame++) {
        draw(frame % 2 ? b : a)
        at = { x: at.x + dx * MARCH, y: at.y + dy * MARCH }
        moveTo(at)
        await sleep(380)
      }
    }
    snap.value = false
    moveTo({ x: 0, y: 0 }, 300, LIFT * 0.6)
    draw(REST)
  }
}

onMounted(() => {
  fine.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('click', onClick)
  document.documentElement.addEventListener('mouseleave', onLeave)
  perform()
})
onBeforeUnmount(() => {
  alive = false
  cancelAnimationFrame(raf)
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('click', onClick)
  document.documentElement.removeEventListener('mouseleave', onLeave)
})
</script>

<template>
  <template v-if="enabled">
    <div
      ref="el"
      class="pixel-cursor"
      :data-shown="(shown && !ichigo) || undefined"
      :data-snap="snap || undefined"
      :style="{ '--w': W, '--cell': `${CELL}px`, '--spread': SPREAD_MS }"
      aria-hidden="true"
    >
      <div ref="shape" class="pixel-cursor-shape">
        <span
          v-for="(on, i) in lit"
          :key="i"
          :data-on="on || undefined"
          :style="{ '--d': delays[i] }"
        />
      </div>
      <div v-for="id in bursts" :key="id" class="pixel-cursor-burst">
        <span
          v-for="([dx, dy], i) in DIRECTIONS"
          :key="i"
          :style="{ '--dx': `${dx * 24}px`, '--dy': `${dy * 24}px` }"
        />
      </div>
    </div>
    <UiIchigo v-if="ichigo" :x="ichigo.x" :y="ichigo.y" @done="ichigo = undefined" />
  </template>
</template>

<style scoped>
/* `translate` follows the pointer, the shape's own its hops and march (script) */
.pixel-cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pixel-cursor-shape {
  display: grid;
  grid-template-columns: repeat(var(--w), var(--cell));
  grid-auto-rows: var(--cell);
}

.pixel-cursor[data-shown] {
  opacity: 1;
}

.pixel-cursor-shape span {
  background: var(--color-primary-500);
  scale: 0;
  transition: scale 0.12s linear calc((var(--spread) - var(--d)) * 1ms);
}

.pixel-cursor-shape span[data-on] {
  scale: 1;
  transition-delay: calc(var(--d) * 1ms);
}

.pixel-cursor[data-snap] .pixel-cursor-shape span {
  transition-delay: 0s;
}

/* From the tip, whatever the shape is doing */
.pixel-cursor-burst {
  position: absolute;
  top: 50%;
  left: 50%;
}

.pixel-cursor-burst span {
  position: absolute;
  width: var(--cell);
  height: var(--cell);
  margin: calc(var(--cell) / -2);
  background: var(--color-primary-500);
  animation: pixel-burst 0.5s steps(6, end) forwards;
}

@keyframes pixel-burst {
  to {
    translate: var(--dx) var(--dy);
    opacity: 0;
  }
}
</style>
