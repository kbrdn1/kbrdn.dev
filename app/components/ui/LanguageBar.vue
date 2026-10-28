<script setup lang="ts">
// Share of a project's code by language, GitHub colours, cut into ticks: the home's cards, a
// pinned repository (Perso) as a client project (Pro). No pointer events: a click there still
// opens the card's link.
import type { Language } from '~/utils/career'

const props = defineProps<{ languages: Language[] }>()

// "Rust 99 %, Shell 1 %": what the bar shows, for screen readers
const summary = computed(() =>
  props.languages.map((lang) => `${lang.name} ${Math.round(lang.percentage)} %`).join(', '),
)
</script>

<template>
  <div
    class="ticks pointer-events-none flex h-3 overflow-hidden bg-neutral-200 dark:bg-neutral-800"
    role="img"
    :aria-label="summary"
  >
    <span
      v-for="lang in languages"
      :key="lang.name"
      class="h-full"
      :style="{ width: `${lang.percentage}%`, backgroundColor: lang.color ?? undefined }"
    />
  </div>
</template>
