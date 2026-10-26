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
  handle: '@kbrdn1',
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
  <UiPanel>
    <!-- The card: status, name and rotating title on the left, avatar on the right -->
    <div
      class="panel-card flex flex-col gap-8 p-5 sm:p-8 md:flex-row md:items-center md:justify-between md:gap-12"
    >
      <div class="min-w-0 flex-1">
        <span v-if="isHirable" class="tag mb-4 text-green-700 dark:text-green-500">
          <span class="relative flex size-1.5" aria-hidden="true">
            <span
              class="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75"
            />
            <span class="relative inline-flex size-1.5 rounded-full bg-current" />
          </span>
          {{ t('hero.availableForHire') }}
        </span>

        <h1
          class="mb-2 text-4xl tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100"
          :aria-label="name"
        >
          <UiScrambleText :text="name" />
        </h1>

        <!-- Rotating title -->
        <p
          class="text-xl text-primary-500 sm:text-2xl"
          style="font-family: 'Fenix', serif"
          :class="isTransitioning ? 'hero-title-hidden' : 'hero-title-visible'"
        >
          {{ currentTitle }}
        </p>
      </div>

      <div class="flex shrink-0 justify-center md:justify-end">
        <div
          v-if="imageError"
          class="flex size-40 items-center justify-center rounded-2xl bg-neutral-200 sm:size-48 dark:bg-neutral-800"
        >
          <span class="text-4xl font-semibold text-primary-500 sm:text-5xl">{{ initials }}</span>
        </div>
        <NuxtImg
          v-else
          :src="avatarUrl"
          :alt="name"
          width="192"
          height="192"
          class="size-40 object-cover sm:size-48"
          format="webp"
          loading="lazy"
          @error="imageError = true"
        />
      </div>
    </div>

    <!-- Footer: handle and city in mono, then the socials and the call to action -->
    <template #meta>{{ handle }} · {{ t('footer.location.city') }}</template>
    <template #footer>
      <HomeSocials :links="socials" />
      <UTooltip :text="t('hero.bookCallDisabled')">
        <button type="button" class="btn btn-primary btn-sm btn-disabled-striped" disabled>
          <UIcon name="i-heroicons-calendar-days" class="size-4" aria-hidden="true" />
          {{ t('hero.bookCall') }}
        </button>
      </UTooltip>
    </template>
  </UiPanel>
</template>
