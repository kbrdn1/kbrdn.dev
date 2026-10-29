<script setup lang="ts">
import type { NuxtError } from '#app'
import { useI18n } from '#imports'

// The error page in the site's layout (navbar, footer, all three modes): an intro like the
// other pages, then a panel where the status code is drawn in pixels that can be dragged
// apart and put back. Any status shows its own code; the wording changes past 404.
const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const code = computed(() => String(props.error.status ?? props.error.statusCode ?? 500))
const notFound = computed(() => code.value === '404')

useSeoMeta({ title: () => (notFound.value ? t('error.title') : t('error.titleOther')) })
// app.vue's head, minus what an error page must not claim (canonical, JSON-LD)
useSiteSeo({ indexable: false })

// A 5×7 pixel font, one row per string
const FONT: Record<string, string[]> = {
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  '3': ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  '4': ['10010', '10010', '10010', '11111', '00010', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
}

const PIXEL = 12
const GAP = 3
const STEP = PIXEL + GAP
const DIGIT_SPACING = 16
const DIGIT_WIDTH = 5 * STEP - GAP

interface Pixel {
  id: number
  x: number
  y: number
  originX: number
  originY: number
}

function buildPixels(): Pixel[] {
  const pixels: Pixel[] = []
  ;[...code.value].forEach((digit, d) => {
    const left = d * (DIGIT_WIDTH + DIGIT_SPACING)
    ;(FONT[digit] ?? []).forEach((row, r) =>
      [...row].forEach((on, c) => {
        if (on !== '1') return
        const x = left + c * STEP
        const y = r * STEP
        pixels.push({ id: pixels.length, x, y, originX: x, originY: y })
      }),
    )
  })
  return pixels
}

const pixels = ref<Pixel[]>(buildPixels())
const width = computed(() => code.value.length * (DIGIT_WIDTH + DIGIT_SPACING) - DIGIT_SPACING)
const height = 7 * STEP - GAP
const placed = computed(() => pixels.value.filter((p) => p.x === p.originX && p.y === p.originY))

// Dragging: pointer events with capture, so mouse, pen and touch all work and the pixel
// keeps the pointer even when it moves faster than the pixel
const dragging = ref<{ id: number; dx: number; dy: number } | null>(null)

function grab(event: PointerEvent, pixel: Pixel) {
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  dragging.value = { id: pixel.id, dx: event.clientX - pixel.x, dy: event.clientY - pixel.y }
}

function drag(event: PointerEvent) {
  const grip = dragging.value
  const pixel = grip && pixels.value[grip.id]
  if (!grip || !pixel) return
  pixel.x = event.clientX - grip.dx
  pixel.y = event.clientY - grip.dy
}

function drop() {
  dragging.value = null
}

function resetPixels() {
  pixels.value = buildPixels()
}

const mood = computed(() =>
  dragging.value ? 'dizzy' : placed.value.length < pixels.value.length ? 'thinking' : 'shocked',
)

// Intro: the server renders the pixels hidden; once mounted, each gets a random scatter
// offset (client only, so no hydration mismatch), then the next frame lets them fly home,
// staggered. The same per-pixel delays stagger a reset.
const phase = ref<'hidden' | 'scattered' | 'assembled'>('hidden')
const scatter = ref<Record<number, Record<string, string>>>({})

onMounted(() => {
  const spread = Math.max(window.innerWidth, window.innerHeight) * 0.5
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
</script>

<template>
  <!-- UApp like app.vue, which the error page replaces: without it, the navbar's tooltips
       (theme, language, sponsor) have no provider and render nothing -->
  <UApp>
    <NuxtLayout>
      <div class="mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-20 sm:px-6">
        <!-- Intro, open on the page like the other pages -->
        <section class="py-4 sm:py-8">
          <p class="eyebrow">{{ t('error.eyebrow', { code }) }}</p>
          <h1
            class="mt-4 max-w-3xl text-5xl tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-100"
          >
            <UiScrambleText :text="notFound ? t('error.title') : t('error.titleOther')" />
          </h1>
          <p
            class="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400"
          >
            {{ notFound ? t('error.subtitle') : t('error.subtitleOther') }}
          </p>
        </section>

        <!-- The code in pixels: drag them apart, put them back -->
        <UiPanel :title="t('error.playTitle')" :subtitle="t('error.playSubtitle')">
          <div
            class="panel-card relative flex min-h-80 flex-col items-center justify-center gap-10 overflow-hidden p-8 sm:p-12"
          >
            <div
              class="relative"
              role="img"
              :aria-label="code"
              :data-phase="phase"
              :style="{ width: `${width}px`, height: `${height}px` }"
            >
              <div
                v-for="pixel in pixels"
                :key="pixel.id"
                class="pixel absolute cursor-grab touch-none bg-primary-500 active:cursor-grabbing"
                :class="{ 'is-dragging': dragging?.id === pixel.id }"
                :style="{
                  width: `${PIXEL}px`,
                  height: `${PIXEL}px`,
                  left: `${pixel.x}px`,
                  top: `${pixel.y}px`,
                  ...scatter[pixel.id],
                }"
                @pointerdown="grab($event, pixel)"
                @pointermove="drag"
                @pointerup="drop"
                @pointercancel="drop"
              />
            </div>
            <UiMascot :mood="mood" :size="88" class="mascot-bob" />
          </div>

          <template #meta>
            <UiRollingNumber :value="placed.length" /> / <UiRollingNumber :value="pixels.length" />
            {{ t('error.inPlace') }}
          </template>
          <template #footer>
            <button type="button" class="btn btn-outline btn-sm" @click="resetPixels">
              <UIcon name="i-heroicons-arrow-path" class="size-4" aria-hidden="true" />
              {{ t('error.reset') }}
            </button>
            <NuxtLinkLocale to="/" class="btn btn-primary btn-sm">
              <UIcon name="i-heroicons-arrow-left-20-solid" class="size-4" aria-hidden="true" />
              {{ t('error.backHome') }}
            </NuxtLinkLocale>
          </template>
        </UiPanel>
      </div>
    </NuxtLayout>
  </UApp>
</template>

<style scoped>
/* Hidden on the server, scattered for one frame once mounted, then each pixel flies
   home with a little overshoot. Reset reuses the transition, staggered the same way. */
.pixel {
  opacity: 0;
  transform: translate(var(--dx, 0), var(--dy, 0)) rotate(var(--rot, 0deg)) scale(0.4);
  box-shadow: 0 0 2px color-mix(in srgb, var(--color-primary-500) 30%, transparent);
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

/* The dragged pixel follows the pointer without lag, and glows */
[data-phase='assembled'] .pixel.is-dragging {
  z-index: 1;
  box-shadow: 0 0 10px color-mix(in srgb, var(--color-primary-500) 60%, transparent);
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
