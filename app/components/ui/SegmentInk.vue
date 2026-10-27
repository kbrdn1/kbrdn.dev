<script setup lang="ts">
// The active segment's fill as one pill that glides from segment to segment, like the
// strip's ink on /experience. Dropped inside a .segmented control, it follows the segment
// marked aria-selected, aria-pressed or aria-current: the control has nothing to wire.
// Before it mounts (server render), the active segment keeps its own fill.
const el = ref<HTMLElement>()
const box = ref<Record<string, string>>()
const placed = ref(false)
let observers: { disconnect(): void }[] = []

function place() {
  const active = el.value?.parentElement?.querySelector<HTMLElement>(
    '.segment:is([aria-selected="true"], [aria-pressed="true"], [aria-current="page"])',
  )
  box.value = active
    ? {
        left: `${active.offsetLeft}px`,
        top: `${active.offsetTop}px`,
        width: `${active.offsetWidth}px`,
        height: `${active.offsetHeight}px`,
      }
    : undefined
}

onMounted(() => {
  const control = el.value?.parentElement
  if (!control) return
  place()
  control.dataset.ink = ''
  // Lands in place first, glides afterwards
  requestAnimationFrame(() => (placed.value = true))
  const mutations = new MutationObserver(place)
  mutations.observe(control, {
    subtree: true,
    attributeFilter: ['aria-selected', 'aria-pressed', 'aria-current'],
  })
  const resize = new ResizeObserver(place)
  resize.observe(control)
  observers = [mutations, resize]
})
onBeforeUnmount(() => observers.forEach((o) => o.disconnect()))
</script>

<template>
  <span
    ref="el"
    class="segment-ink"
    :class="{ 'transition-none': !placed }"
    :style="box"
    :hidden="!box"
    aria-hidden="true"
  />
</template>
