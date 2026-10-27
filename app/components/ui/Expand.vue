<script setup lang="ts">
// A collapse that opens on its height, progressively (grid rows 0fr → 1fr: no measuring,
// any content). The content fades and blurs in step with the height, on the same curve and
// for the same time, and that time follows the height: a long list takes longer than a
// line, at the same speed. Closed, the content is inert: out of the tab order and the
// accessibility tree, as it is out of sight.
const props = defineProps<{ open: boolean }>()

const content = ref<HTMLElement>()
const duration = ref<string>()

// Before the render that toggles it, so the new time applies to this very change
watch(
  () => props.open,
  () => {
    const height = content.value?.scrollHeight ?? 0
    duration.value = `${Math.round(Math.min(800, 250 + height * 0.9))}ms`
  },
  { flush: 'pre' },
)
</script>

<template>
  <div
    class="expand"
    :data-open="open || undefined"
    :style="duration ? { '--expand-duration': duration } : undefined"
  >
    <div ref="content" class="expand-content" :inert="!open">
      <slot />
    </div>
  </div>
</template>
