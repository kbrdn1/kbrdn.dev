<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

interface Props {
  name: string
  titles: string[]
  handle?: string
  avatarUrl?: string
  isHirable?: boolean
  calendarLink?: string
  socials: { platform: string; url: string; label: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: '/images/avatar.png',
  isHirable: true,
  calendarLink: 'https://cal.com',
})

const initials = computed(() => {
  return props.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const imageError = ref(false)

const currentTitleIndex = ref(0)
const isTransitioning = ref(false)

const currentTitle = computed(() => props.titles[currentTitleIndex.value] || '')

let interval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (props.titles.length > 1) {
    interval = setInterval(() => {
      isTransitioning.value = true
      setTimeout(() => {
        currentTitleIndex.value = (currentTitleIndex.value + 1) % props.titles.length
        isTransitioning.value = false
      }, 300)
    }, 3000)
  }
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <div class="max-w-5xl mx-auto w-full min-md:px-6">
    <!-- Split layout: text left, avatar right -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-12">
      <!-- Left side: text content -->
      <div class="flex-1 min-w-0">
        <!-- Available badge -->
        <div v-if="isHirable" class="mb-4">
          <span
            :class="
              cn(
                'inline-flex items-center gap-2 px-3 py-1',
                'text-xs font-mono uppercase tracking-wider',
                'text-green-700 dark:text-green-500',
                'border border-green-600/40 dark:border-green-500/30',
                'bg-green-600/5 dark:bg-green-500/5',
              )
            "
          >
            <span class="relative flex h-2 w-2" aria-hidden="true">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
                aria-hidden="true"
              />
              <span
                class="relative inline-flex rounded-full h-2 w-2 bg-green-600 dark:bg-green-500"
                aria-hidden="true"
              />
            </span>
            {{ t('hero.availableForHire') }}
          </span>
        </div>

        <!-- Name -->
        <h1
          class="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2"
          :aria-label="name"
        >
          <UiScrambleText :text="name" />
        </h1>

        <!-- Rotating title -->
        <p
          class="text-xl sm:text-2xl text-primary-500 mb-6"
          style="font-family: 'Fenix', serif"
          :class="isTransitioning ? 'hero-title-hidden' : 'hero-title-visible'"
        >
          {{ currentTitle }}
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap items-center gap-3">
          <UTooltip :text="t('hero.bookCallDisabled')">
            <UButton
              color="primary"
              variant="solid"
              size="md"
              icon="i-heroicons-calendar-days"
              class="btn-disabled-striped"
              disabled
            >
              {{ t('hero.bookCall') }}
            </UButton>
          </UTooltip>
          <HomeSocials :links="socials" />
        </div>
      </div>

      <!-- Right side: avatar -->
      <div class="flex-shrink-0 flex justify-center md:justify-end">
        <div class="relative">
          <div
            v-if="imageError"
            :class="
              cn(
                'w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center',
                'bg-neutral-200 dark:bg-neutral-800',
              )
            "
          >
            <span class="text-4xl sm:text-5xl font-semibold text-primary-500">{{ initials }}</span>
          </div>
          <NuxtImg
            v-else
            :src="avatarUrl"
            :alt="name"
            width="192"
            height="192"
            :class="cn('w-40 h-40 sm:w-48 sm:h-48 object-cover')"
            format="webp"
            loading="lazy"
            @error="imageError = true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
