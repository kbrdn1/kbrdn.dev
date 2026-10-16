<script setup lang="ts">
// Text that decodes out of random glyphs on mount (useScrambleText). The real text keeps its
// place in the layout, hidden while the scrambled copy is drawn over it, so glyphs of another
// width never re-wrap the line and shift the page. The server renders the real text only.
// Give the parent heading the real text as its aria-label: the copy is aria-hidden.
const props = defineProps<{ text: string }>()
const scrambled = useScrambleText(() => props.text)
</script>

<template>
  <span class="relative block">
    <span :class="{ invisible: scrambled !== text }">{{ text }}</span>
    <span v-if="scrambled !== text" aria-hidden="true" class="absolute inset-0">
      {{ scrambled }}
    </span>
  </span>
</template>
