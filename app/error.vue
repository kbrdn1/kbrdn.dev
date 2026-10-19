<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
// useError() doit être appelé même si non utilisé directement pour que Nuxt expose l'error context au template
useError()

// 404 pixel font map — each digit is a 5x7 grid (1 = filled, 0 = empty)
const DIGITS: Record<string, number[][]> = {
  '4': [
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
  ],
  '0': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
}

const PIXEL_SIZE = 12
const PIXEL_GAP = 3
const DIGIT_SPACING = 16
const STEP = PIXEL_SIZE + PIXEL_GAP

interface Pixel {
  id: number
  x: number
  y: number
  originX: number
  originY: number
}

// Build the "404" pixel layout
function buildPixels(): Pixel[] {
  const digits = ['4', '0', '4']
  const pixels: Pixel[] = []
  let id = 0

  let cursorX = 0
  for (const digit of digits) {
    const grid = DIGITS[digit]!
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row]!.length; col++) {
        if (grid[row]![col]) {
          const x = cursorX + col * STEP
          const y = row * STEP
          pixels.push({ id: id++, x, y, originX: x, originY: y })
        }
      }
    }
    cursorX += DIGITS[digit]![0]!.length * STEP + DIGIT_SPACING
  }

  return pixels
}

const pixels = ref<Pixel[]>(buildPixels())

// Canvas dimensions
const canvasWidth = computed(() => {
  const digits = ['4', '0', '4']
  let w = 0
  for (const d of digits) w += DIGITS[d]![0]!.length * STEP + DIGIT_SPACING
  return w - DIGIT_SPACING
})
const canvasHeight = 7 * STEP - PIXEL_GAP

// Dragging state
const dragging = ref<{ id: number; offsetX: number; offsetY: number } | null>(null)

function onMouseDown(event: MouseEvent, pixel: Pixel) {
  event.preventDefault()
  dragging.value = {
    id: pixel.id,
    offsetX: event.clientX - pixel.x,
    offsetY: event.clientY - pixel.y,
  }
}

function onMouseMove(event: MouseEvent) {
  if (!dragging.value) return
  const px = pixels.value.find((p) => p.id === dragging.value!.id)
  if (px) {
    px.x = event.clientX - dragging.value.offsetX
    px.y = event.clientY - dragging.value.offsetY
  }
}

function onMouseUp() {
  dragging.value = null
}

function resetPixels() {
  pixels.value = buildPixels()
}

function handleBackHome() {
  clearError({ redirect: '/' })
}

// Intro: the server renders the pixels hidden; once mounted, each gets a random
// scatter offset (client only, so no hydration mismatch), then the next frame
// lets them fly home, staggered. The same per-pixel delays stagger a reset.
const phase = ref<'hidden' | 'scattered' | 'assembled'>('hidden')
const scatter = ref<Record<number, Record<string, string>>>({})

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  const spread = Math.max(window.innerWidth, window.innerHeight) * 0.6
  scatter.value = Object.fromEntries(
    pixels.value.map((p) => [
      p.id,
      {
        '--dx': `${(Math.random() - 0.5) * spread}px`,
        '--dy': `${(Math.random() - 0.5) * spread}px`,
        '--rot': `${(Math.random() - 0.5) * 360}deg`,
        '--delay': `${Math.round(Math.random() * 500)}ms`,
        '--flicker-delay': `${(1.5 + Math.random() * 8).toFixed(2)}s`,
        '--flicker-duration': `${(5 + Math.random() * 7).toFixed(2)}s`,
      },
    ]),
  )
  phase.value = 'scattered'
  requestAnimationFrame(() => requestAnimationFrame(() => (phase.value = 'assembled')))
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center relative overflow-hidden select-none"
    style="background-color: #1a1a1a"
  >
    <!-- The site's dither field, interactive like on every other page -->
    <UiDitherCanvas
      interactive
      fade="down"
      class="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,#000_60%,transparent)]"
    />

    <!-- Main content -->
    <div class="relative z-10 flex flex-col items-center gap-8 px-6">
      <!-- Pixel canvas -->
      <div
        class="relative"
        :data-phase="phase"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
        aria-label="404"
      >
        <div
          v-for="pixel in pixels"
          :key="pixel.id"
          class="pixel absolute cursor-grab active:cursor-grabbing"
          :class="{ 'is-dragging': dragging?.id === pixel.id }"
          :style="{
            width: PIXEL_SIZE + 'px',
            height: PIXEL_SIZE + 'px',
            left: pixel.x + 'px',
            top: pixel.y + 'px',
            backgroundColor: '#d4825d',
            boxShadow:
              dragging?.id === pixel.id
                ? '0 0 8px rgba(212, 130, 93, 0.6)'
                : '0 0 2px rgba(212, 130, 93, 0.3)',
            ...scatter[pixel.id],
          }"
          @mousedown="onMouseDown($event, pixel)"
        />
      </div>

      <!-- Text content -->
      <div class="text-center flex flex-col items-center gap-6 mt-4">
        <UiMascot :mood="dragging ? 'dizzy' : 'shocked'" :size="96" class="mascot-bob" />
        <p class="text-neutral-400 text-base" style="font-family: 'Monaspace Krypton', monospace">
          <UiScrambleText :text="t('error.subtitle')" />
        </p>

        <!-- Action buttons -->
        <div class="flex flex-wrap items-center justify-center gap-3">
          <button
            :class="
              cn(
                'inline-flex items-center gap-2 px-4 py-2 text-sm',
                'border border-neutral-700 text-neutral-400',
                'hover:border-neutral-500 hover:text-neutral-200',
                'transition-colors duration-200',
                'font-mono',
              )
            "
            @click="resetPixels"
          >
            <span aria-hidden="true">↺</span>
            {{ t('error.reset') }}
          </button>

          <NuxtLink
            :class="
              cn(
                'inline-flex items-center gap-2 px-4 py-2 text-sm',
                'bg-primary-500 text-white',
                'hover:bg-primary-600',
                'transition-colors duration-200',
                'font-mono',
              )
            "
            to="/"
            @click.prevent="handleBackHome"
          >
            <span aria-hidden="true">←</span>
            {{ t('error.backHome') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hidden on the server, scattered for one frame once mounted, then each pixel flies
   home with a little overshoot. Reset reuses the transition, staggered the same way. */
.pixel {
  opacity: 0;
  transform: translate(var(--dx, 0), var(--dy, 0)) rotate(var(--rot, 0deg)) scale(0.4);
}

[data-phase='assembled'] .pixel {
  opacity: 1;
  transform: none;
  transition:
    transform 900ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 400ms ease-out,
    left 700ms cubic-bezier(0.34, 1.56, 0.64, 1),
    top 700ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 200ms;
  transition-delay: var(--delay, 0ms);
  /* A pixel slips out of place now and then: on `translate`, which composes with the
     intro's `transform` instead of overriding it. */
  animation: pixel-glitch var(--flicker-duration, 8s) steps(1) var(--flicker-delay, 3s) infinite;
}

/* The dragged pixel follows the pointer without lag. */
[data-phase='assembled'] .pixel.is-dragging {
  transition: box-shadow 200ms;
  animation: none;
}

@keyframes pixel-glitch {
  0%,
  92%,
  100% {
    translate: 0 0;
    filter: none;
  }
  93% {
    translate: 3px -4px;
    filter: brightness(1.5);
  }
  95% {
    translate: -2px 2px;
  }
}

.mascot-bob {
  animation: mascot-bob 2.6s ease-in-out infinite;
}

@keyframes mascot-bob {
  0%,
  100% {
    translate: 0 0;
  }
  50% {
    translate: 0 -6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-phase] .pixel,
  [data-phase='assembled'] .pixel {
    opacity: 1;
    transform: none;
    transition: none;
    animation: none;
  }

  .mascot-bob {
    animation: none;
  }
}
</style>
