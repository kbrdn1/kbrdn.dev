<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
const colorMode = useColorMode()
const isDark = computed(() => isDarkMode(colorMode.value))

interface Slide {
  label: string
  title: string
  description: string
  cta?: { label: string; href: string; icon: string }
}

const slides = computed<Slide[]>(() => [
  {
    label: t('explore.labels.collab'),
    title: t('explore.slides.collab.title'),
    description: t('explore.slides.collab.description'),
    cta: {
      label: t('explore.slides.collab.cta'),
      href: 'mailto:hello@kbrdn.dev',
      icon: 'i-heroicons-envelope',
    },
  },
  {
    label: t('explore.labels.crafting'),
    title: t('explore.slides.crafting.title'),
    description: t('explore.slides.crafting.description'),
    cta: { label: 'gwm', href: 'https://github.com/kbrdn1/gwm-cli', icon: 'i-simple-icons-github' },
  },
  {
    label: t('explore.labels.blog'),
    title: t('explore.slides.blog.title'),
    description: t('explore.slides.blog.description'),
    cta: { label: t('explore.slides.blog.cta'), href: '/blog', icon: 'i-heroicons-document-text' },
  },
  {
    label: t('explore.labels.sponsor'),
    title: t('explore.slides.sponsor.title'),
    description: t('explore.slides.sponsor.description'),
    cta: {
      label: t('explore.slides.sponsor.cta'),
      href: 'https://github.com/sponsors/kbrdn1',
      icon: 'i-heroicons-heart',
    },
  },
  {
    label: t('explore.labels.motto'),
    title: t('explore.slides.motto.title'),
    description: t('explore.slides.motto.description'),
  },
])

const currentSlide = ref(0)
const slide = computed(() => slides.value[currentSlide.value])

// One voxel scene per slide (public/images/scenes): the dark ones in dark and glass mode
const SCENES = {
  dark: ['city-gate', 'circuit-red'],
  light: ['city-peach', 'city-domes', 'city-marble', 'village'],
}
const scene = computed(() => {
  const list = SCENES[isDark.value ? 'dark' : 'light']
  return `/images/scenes/${list[currentSlide.value % list.length]}.webp`
})

// Next slides in from the right, previous from the left (the timer always goes next)
const direction = ref<'next' | 'prev'>('next')
const pad = (n: number) => String(n).padStart(2, '0')

function goToSlide(index: number) {
  const target = (index + slides.value.length) % slides.value.length
  if (target === currentSlide.value) return
  direction.value = index > currentSlide.value ? 'next' : 'prev'
  currentSlide.value = target
}

// Autoplay: the footer's tick timer fills in 5s (CSS), and its end moves to the next slide.
// Paused while the carousel is hovered or focused, off under reduced motion: moving content
// must be pausable (WCAG 2.2.2).
const paused = ref(false)
const reducedMotion = useReducedMotion()
</script>

<template>
  <!-- A panel after disarto's onboarding card: the slide in a card, its voxel scene seen
       through the pixel layer beside it, the position and the steps in the footer -->
  <section
    aria-roledescription="carousel"
    :aria-label="t('explore.title')"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <UiPanel :title="t('explore.title')">
      <template #actions>
        <button
          type="button"
          class="icon-btn"
          :aria-label="t('explore.previous')"
          @click="goToSlide(currentSlide - 1)"
        >
          <UIcon name="i-heroicons-chevron-left-20-solid" class="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="icon-btn"
          :aria-label="t('explore.next')"
          @click="goToSlide(currentSlide + 1)"
        >
          <UIcon name="i-heroicons-chevron-right-20-solid" class="size-4" aria-hidden="true" />
        </button>
      </template>

      <div class="grid gap-1 md:grid-cols-2">
        <div class="panel-card flex min-h-80 flex-col p-6 sm:p-8">
          <Transition :name="`swap-${direction}`" mode="out-in">
            <div :key="currentSlide" class="flex flex-1 flex-col">
              <p class="eyebrow">{{ slide?.label }}</p>
              <h3 class="mt-3 text-3xl tracking-tight text-neutral-900 dark:text-neutral-100">
                {{ slide?.title }}
              </h3>
              <p class="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {{ slide?.description }}
              </p>
              <div v-if="slide?.cta" class="mt-auto pt-6">
                <NuxtLink :to="slide.cta.href" target="_blank" class="btn btn-primary">
                  <UIcon :name="slide.cta.icon" class="size-4" aria-hidden="true" />
                  {{ slide.cta.label }}
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Client only: the scene follows the colour mode, unknown to the server. Hovered,
             it depixelates down to the crisp picture. -->
        <div
          class="relative min-h-64 overflow-hidden rounded-2xl bg-neutral-200 dark:bg-neutral-900"
        >
          <ClientOnly>
            <div class="absolute inset-0">
              <UiPixelImage :src="scene" class="size-full" reveal />
            </div>
          </ClientOnly>
        </div>
      </div>

      <template #meta>
        <UiRollingNumber :value="pad(currentSlide + 1)" /> /
        <UiRollingNumber :value="pad(slides.length)" />
      </template>
      <template #footer>
        <!-- Client only: whether to autoplay depends on the reader's motion preference -->
        <ClientOnly>
          <div
            v-if="!reducedMotion"
            class="ticks mr-2 h-3 w-36 bg-neutral-300 dark:bg-neutral-700"
            aria-hidden="true"
          >
            <div
              :key="currentSlide"
              class="explore-timer h-full bg-primary-500"
              :style="{ animationPlayState: paused ? 'paused' : 'running' }"
              @animationend="goToSlide(currentSlide + 1)"
            />
          </div>
        </ClientOnly>
      </template>
    </UiPanel>
  </section>
</template>
