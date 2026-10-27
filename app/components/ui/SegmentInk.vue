<script setup lang="ts">
// The active segment's fill as one pill that glides from segment to segment, like the
// strip's ink on /experience. Dropped inside a .segmented control, it follows the segment
// marked aria-selected, aria-pressed or aria-current: the control has nothing to wire.
// Before it mounts (server render), the active segment keeps its own fill.
// preview: the href of a segment to show instead of the active one, while it is previewed
// (the navbar: the page whose menu the notch has open), back to the active one after
const props = defineProps<{ preview?: string | null }>()

const el = ref<HTMLElement>()
const box = ref<Record<string, string>>()
const placed = ref(false)
let observers: { disconnect(): void }[] = []

function place() {
  const control = el.value?.parentElement
  const previewed = props.preview
    ? control?.querySelector<HTMLElement>(`.segment[href="${props.preview}"]`)
    : null
  const active =
    previewed ??
    control?.querySelector<HTMLElement>(
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
watch(() => props.preview, place)
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
