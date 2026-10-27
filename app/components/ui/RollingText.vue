<script setup lang="ts">
// Text that rolls like UiRollingNumber's reels when it changes: each character climbs out
// while the new one rises into its place, blurred while it moves, the columns starting left
// to right. The new text sets the width from the first frame, so nothing around it jumps.
// Screen readers get the plain text; under reduced motion it just changes.
const props = defineProps<{ text: string }>()

// Per character, capped so a long line still lands quickly (ms)
const STAGGER = 22
const STAGGER_MAX = 380
const ROLL = 520

const before = ref(props.text)
const rolling = ref(false)
const reducedMotion = useReducedMotion()
let settle: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.text,
  async (_, previous) => {
    clearTimeout(settle)
    if (reducedMotion.value) return
    // Restart from the text on screen, even mid-roll
    rolling.value = false
    before.value = previous
    await nextTick()
    rolling.value = true
    settle = setTimeout(() => (rolling.value = false), ROLL + STAGGER_MAX)
  },
)
onBeforeUnmount(() => clearTimeout(settle))

const columns = computed(() =>
  Array.from({ length: Math.max(before.value.length, props.text.length) }, (_, i) => ({
    out: before.value[i] ?? '',
    in: props.text[i] ?? '',
    delay: Math.min(i * STAGGER, STAGGER_MAX),
  })),
)
</script>

<template>
  <span class="rolling-text">
    <span class="sr-only">{{ text }}</span>
    <span v-if="rolling" aria-hidden="true">
      <span
        v-for="(column, i) in columns"
        :key="i"
        class="rolling-text-column"
        :style="{ '--delay': `${column.delay}ms`, '--roll': `${ROLL}ms` }"
      >
        <span class="rolling-text-out">{{ column.out }}</span>
        <span class="rolling-text-in">{{ column.in }}</span>
      </span>
    </span>
    <span v-else aria-hidden="true">{{ text }}</span>
  </span>
</template>

<style scoped>
.rolling-text {
  white-space: pre;
}

/* One reel per character: the new one in the flow (it sets the width), the old one over it,
   both clipped to the line's height */
.rolling-text-column {
  position: relative;
  display: inline-block;
  height: 1lh;
  overflow-y: clip;
  vertical-align: top;
}

.rolling-text-in,
.rolling-text-out {
  display: block;
  animation: var(--roll) var(--ease-out-quint) var(--delay) both;
}

.rolling-text-in {
  animation-name: rolling-text-in;
}

.rolling-text-out {
  position: absolute;
  top: 0;
  left: 0;
  animation-name: rolling-text-out;
}

@keyframes rolling-text-in {
  from {
    translate: 0 1lh;
    filter: blur(3px);
  }
  to {
    translate: 0 0;
    filter: blur(0);
  }
}

@keyframes rolling-text-out {
  from {
    translate: 0 0;
    filter: blur(0);
  }
  to {
    translate: 0 -1lh;
    filter: blur(3px);
  }
}
</style>
