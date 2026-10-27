<script setup lang="ts">
// Follows its content's height smoothly instead of jumping: a list refilled by a tab, a
// filter, a search or a page grows and shrinks progressively while its new rows come in.
// The height is measured (ResizeObserver); before mounting it is left to the content.
const content = ref<HTMLElement>()
const height = ref<string>()
let observer: ResizeObserver | undefined

onMounted(() => {
  if (!content.value) return
  observer = new ResizeObserver(([entry]) => {
    const size = entry?.borderBoxSize[0]?.blockSize
    if (size !== undefined) height.value = `${size}px`
  })
  observer.observe(content.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="auto-height" :style="{ height }">
    <div ref="content" class="flow-root">
      <slot />
    </div>
  </div>
</template>
