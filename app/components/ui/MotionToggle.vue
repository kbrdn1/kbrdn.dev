<script setup lang="ts">
import { useI18n } from '#imports'

// The site's pause: every animation (scenes, critter, mascots, rotating titles, the dither)
// stops and restarts from here, like under the system's reduced motion (RGAA 13.8). A toggle
// button: one label, its state in aria-pressed.
const { t } = useI18n()
const { paused, toggle } = useMotionPause()
</script>

<template>
  <ClientOnly>
    <UTooltip :text="t('motion.pause')">
      <button
        type="button"
        class="icon-btn cursor-pointer"
        :aria-label="t('motion.pause')"
        :aria-pressed="paused"
        @click="toggle"
      >
        <UIcon
          :name="paused ? 'i-heroicons-play-20-solid' : 'i-heroicons-pause-20-solid'"
          class="h-4 w-4"
          aria-hidden="true"
        />
      </button>
    </UTooltip>
    <template #fallback>
      <div class="size-9" />
    </template>
  </ClientOnly>
</template>
