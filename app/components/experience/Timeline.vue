<script setup lang="ts">
// The list behind /experience's timeline (ExperienceEntry rows): one rail down the side,
// filled in the accent as the reading goes, up to the middle of the screen. From md only:
// on a phone the entries stack, and the sticky strip of roles says where the reader is.
const list = ref<HTMLElement>()
const progress = ref(0)
let frame = 0

function measure() {
  frame = 0
  const box = list.value?.getBoundingClientRect()
  if (!box) return
  progress.value = Math.min(1, Math.max(0, (window.innerHeight / 2 - box.top) / box.height))
}
const schedule = () => {
  if (!frame) frame = requestAnimationFrame(measure)
}

onMounted(() => {
  measure()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
})
</script>

<template>
  <ol ref="list" class="panel-card relative px-4 pt-6 pb-1 sm:px-6 sm:pt-8">
    <!-- Lined up with the points: the padding, the years column, the gap, half the rail -->
    <span
      class="pointer-events-none absolute top-8 bottom-8 left-[6.75rem] hidden w-px -translate-x-1/2 bg-(--card-border) md:block"
      aria-hidden="true"
    >
      <span
        class="absolute inset-0 origin-top bg-primary-500"
        :style="{ transform: `scaleY(${progress})` }"
      />
    </span>
    <slot />
  </ol>
</template>
