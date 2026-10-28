<script setup lang="ts">
// A number whose digits roll like slot machine reels, blurred while they spin: one full
// turn when it first comes into view, the reels stopping left to right, then straight to
// the new digit whenever the value changes. Each reel holds 0-9 twice and rests in the
// second lap: the server renders the final value there, and the spawn turn starts from
// the same digit one lap back, so nothing blinks before hydration. Screen readers get the
// plain value; the reels' digits are generated content (components.css), out of the copied
// and crawled text. Under reduced motion the number stays still.
const props = defineProps<{ value: number | string }>()

const text = computed(() => String(props.value))
const root = ref<HTMLElement>()
const lap = ref(1)
const instant = ref(false)
const spinning = ref(false)
let observer: IntersectionObserver | undefined
let settle: ReturnType<typeof setTimeout> | undefined

// Longest reel: 0.9s, plus 0.15s per reel before it (components.css)
function blurFor() {
  spinning.value = true
  clearTimeout(settle)
  settle = setTimeout(() => (spinning.value = false), 900 + text.value.length * 150)
}

async function spawn() {
  instant.value = true
  lap.value = 0
  await nextTick()
  void root.value?.offsetHeight
  instant.value = false
  lap.value = 1
  blurFor()
}

watch(text, blurFor)

onMounted(() => {
  if (!root.value || isMotionReduced()) return
  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      observer?.disconnect()
      spawn()
    },
    { threshold: 0.6 },
  )
  observer.observe(root.value)
})
onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(settle)
})
</script>

<template>
  <span ref="root" class="rolling-number">
    <span class="sr-only">{{ text }}</span>
    <span aria-hidden="true" class="inline-flex">
      <!-- Keyed from the right, so the units keep their reel when the number grows -->
      <template v-for="(char, i) in text" :key="text.length - i">
        <span
          v-if="char >= '0' && char <= '9'"
          :class="cn('reel', instant && 'is-instant', spinning && 'is-spinning')"
          :style="{ '--i': i }"
        >
          <span class="reel-strip" :style="{ translate: `0 calc(${-(+char + 10 * lap)} * 1lh)` }" />
        </span>
        <span v-else class="whitespace-pre">{{ char }}</span>
      </template>
    </span>
  </span>
</template>
