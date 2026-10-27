<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

interface Props {
  name: string
  titles: string[]
  handle?: string
  isHirable?: boolean
  calendarLink?: string
  socials: { platform: string; url: string; label: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  handle: '@kbrdn1',
  isHirable: true,
  calendarLink: 'https://cal.com',
})

const currentTitleIndex = ref(0)

const currentTitle = computed(() => props.titles[currentTitleIndex.value] || '')

// The mascot is alive: it floats (CSS), and every few seconds or when the pointer comes
// over it, it turns into one of the drawn portraits of me, then back into the mascot in
// another mood. Every picture is stacked and cross-faded, so a swap never flashes.
const MASCOT = ['hoodie', 'hoodie-happy', 'side-eye', 'hoodie-cool', 'grin', 'smug']
const PORTRAITS = 9 // public/images/me/pp/1..9.webp, neutral outfits
// Each picture once in the stack; the order alternates mascot and portrait, until every
// portrait has had its turn (the mascot's moods come round again)
const MOODS = [
  ...MASCOT.map((mood) => `/images/mascot/${mood}.webp`),
  ...Array.from({ length: PORTRAITS }, (_, i) => `/images/me/pp/${i + 1}.webp`),
]
const ORDER = Array.from({ length: PORTRAITS }, (_, i) => [
  i % MASCOT.length,
  MASCOT.length + i,
]).flat()
const step = ref(0)
const mood = computed(() => ORDER[step.value])
const reducedMotion = useReducedMotion()

function nextMood() {
  step.value = (step.value + 1) % ORDER.length
}

let interval: ReturnType<typeof setInterval> | undefined
let moodInterval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (props.titles.length > 1) {
    interval = setInterval(() => {
      currentTitleIndex.value = (currentTitleIndex.value + 1) % props.titles.length
    }, 3000)
  }
  if (!reducedMotion.value) moodInterval = setInterval(nextMood, 4000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  if (moodInterval) clearInterval(moodInterval)
})
</script>

<template>
  <!-- Open on the page, no box: status, name, rotating title, meta, then the actions;
       the mascot on the right -->
  <div
    class="flex flex-col gap-8 py-4 sm:py-8 md:flex-row md:items-center md:justify-between md:gap-12"
  >
    <div class="min-w-0 flex-1">
      <span v-if="isHirable" class="tag mb-5 text-green-700 dark:text-green-500">
        <span class="relative flex size-1.5" aria-hidden="true">
          <span
            class="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75"
          />
          <span class="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
        {{ t('hero.availableForHire') }}
      </span>

      <h1
        class="mb-2 text-5xl tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-100"
        :aria-label="name"
      >
        <UiScrambleText :text="name" />
      </h1>

      <!-- Rotating title, rolling letter by letter like the figures' reels -->
      <p class="text-xl text-primary-500 sm:text-2xl" style="font-family: 'Fenix', serif">
        <UiRollingText :text="currentTitle" />
      </p>

      <!-- A face, small, beside the handle: the photo, the drawing on hover -->
      <p class="eyebrow group/me mt-5 flex items-center gap-2.5">
        <span
          class="relative size-7 shrink-0 overflow-hidden rounded-full ring-1 ring-(--card-border)"
        >
          <NuxtImg
            src="/images/me/face.webp"
            alt=""
            width="56"
            height="56"
            class="absolute inset-0 size-full object-cover transition-opacity duration-300 group-hover/me:opacity-0"
          />
          <NuxtImg
            src="/images/me/avatar.webp"
            alt=""
            width="56"
            height="56"
            class="absolute inset-0 size-full bg-neutral-200 object-cover opacity-0 transition-opacity duration-300 group-hover/me:opacity-100 dark:bg-neutral-800"
          />
        </span>
        {{ handle }} · {{ t('footer.location.city') }}
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <NuxtLink to="/contact" class="btn btn-primary">
          <UIcon name="i-heroicons-paper-airplane" class="size-4" aria-hidden="true" />
          {{ t('hero.contact') }}
        </NuxtLink>
        <HomeSocials :links="socials" />
      </div>
    </div>

    <div
      class="mascot-float relative mx-auto size-48 shrink-0 sm:size-56 md:mx-0"
      aria-hidden="true"
      @mouseenter="nextMood"
    >
      <img
        v-for="(m, i) in MOODS"
        :key="m"
        :src="m"
        width="224"
        height="224"
        alt=""
        draggable="false"
        class="absolute inset-0 size-full select-none object-contain transition-opacity duration-300"
        :class="i === mood ? 'opacity-100' : 'opacity-0'"
      />
    </div>
  </div>
</template>
