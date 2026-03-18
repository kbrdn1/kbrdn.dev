<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

interface Slide {
  title: string
  description: string
  cta?: { label: string; href: string; icon: string }
}

const slides = computed<Slide[]>(() => [
  {
    title: t('explore.slides.collab.title'),
    description: t('explore.slides.collab.description'),
    cta: { label: t('explore.slides.collab.cta'), href: 'mailto:hello@kbrdn.dev', icon: 'i-heroicons-envelope' },
  },
  {
    title: t('explore.slides.crafting.title'),
    description: t('explore.slides.crafting.description'),
    cta: { label: 'LazyCurl', href: 'https://github.com/kbrdn1/LazyCurl', icon: 'i-simple-icons-github' },
  },
  {
    title: t('explore.slides.blog.title'),
    description: t('explore.slides.blog.description'),
    cta: { label: t('explore.slides.blog.cta'), href: '/blog', icon: 'i-heroicons-document-text' },
  },
  {
    title: t('explore.slides.sponsor.title'),
    description: t('explore.slides.sponsor.description'),
    cta: { label: t('explore.slides.sponsor.cta'), href: 'https://github.com/sponsors/kbrdn1', icon: 'i-heroicons-heart' },
  },
  {
    title: t('explore.slides.motto.title'),
    description: t('explore.slides.motto.description'),
  },
])

const currentSlide = ref(0)
const isTransitioning = ref(false)
const slideDirection = ref<'left' | 'right'>('left')
const isPaused = ref(false)

let interval: ReturnType<typeof setInterval> | undefined

function startAutoRotate() {
  interval = setInterval(() => {
    if (isPaused.value) return
    slideDirection.value = 'left'
    isTransitioning.value = true
    setTimeout(() => {
      currentSlide.value = (currentSlide.value + 1) % slides.value.length
      isTransitioning.value = false
    }, 400)
  }, 5000)
}

onMounted(() => {
  startAutoRotate()
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

function togglePause() {
  isPaused.value = !isPaused.value
}

function goToSlide(index: number) {
  if (index === currentSlide.value) return
  slideDirection.value = index > currentSlide.value ? 'left' : 'right'
  isTransitioning.value = true
  setTimeout(() => {
    currentSlide.value = index
    isTransitioning.value = false
  }, 400)
}
</script>

<template>
  <section class="w-full relative overflow-hidden mx-auto border-t border-neutral-200 dark:border-neutral-800" style="max-width: 80rem;" aria-roledescription="carousel" aria-label="Featured content">
    <!-- Background image -->
    <ClientOnly>
      <NuxtImg
        :src="isDark ? '/images/banners/dark.jpg' : '/images/banners/light.jpg'"
        alt=""
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <template #fallback>
        <div class="absolute inset-0 bg-neutral-200 dark:bg-neutral-800" />
      </template>
    </ClientOnly>
    <!-- Fade edges -->
    <div class="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-transparent/30 to-neutral-950/50" />
    <div class="absolute inset-0 bg-gradient-to-r from-neutral-950/50 via-transparent to-neutral-950/50" />

    <!-- Content -->
    <div class="relative z-10 py-20 sm:py-28 px-6">
      <div class="max-w-5xl mx-auto min-md:px-6 flex flex-col items-center text-center">
        <!-- Rotating content -->
        <div
          class="h-[160px] sm:h-[140px] flex flex-col items-center justify-center gap-5 w-full"
          :class="{
            'carousel-hidden-left': isTransitioning && slideDirection === 'left',
            'carousel-hidden-right': isTransitioning && slideDirection === 'right',
            'carousel-visible': !isTransitioning,
          }"
        >
          <!-- Label -->
          <span class="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-primary-400 drop-shadow-sm">
            {{ [t('explore.labels.collab'), t('explore.labels.crafting'), t('explore.labels.blog'), t('explore.labels.sponsor'), t('explore.labels.motto')][currentSlide] }}
          </span>

          <!-- Title -->
          <h2
            :class="cn(
              'text-2xl sm:text-4xl font-bold text-white max-w-2xl leading-tight drop-shadow-md',
              currentSlide === 2 ? 'font-mono' : '',
            )"
          >
            {{ slides[currentSlide].title }}
          </h2>

          <!-- Description -->
          <p class="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed drop-shadow-sm">
            {{ slides[currentSlide].description }}
          </p>

          <!-- CTA -->
          <UButton
            v-if="slides[currentSlide].cta"
            :to="slides[currentSlide].cta!.href"
            target="_blank"
            color="primary"
            variant="solid"
            size="md"
            :icon="slides[currentSlide].cta!.icon"
            class="mt-1"
          >
            {{ slides[currentSlide].cta!.label }}
          </UButton>
        </div>

        <!-- Controls -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button
            v-for="(_, index) in slides"
            :key="index"
            type="button"
            :aria-label="`Slide ${index + 1} of ${slides.length}${currentSlide === index ? ' (current)' : ''}`"
            :class="cn(
              'h-0.5',
              currentSlide === index
                ? 'bg-primary-500'
                : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500',
            )"
            :style="{
              width: currentSlide === index ? '32px' : '16px',
              transition: 'width 300ms ease, background-color 300ms ease',
            }"
            @click="goToSlide(index)"
          />
          <button
            type="button"
            :aria-label="isPaused ? 'Resume carousel' : 'Pause carousel'"
            class="ml-1 flex items-center justify-center w-5 h-5 text-white/50 hover:text-white transition-colors"
            @click="togglePause"
          >
            <UIcon :name="isPaused ? 'i-heroicons-play' : 'i-heroicons-pause'" class="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
