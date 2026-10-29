<script setup lang="ts">
// An article's picture (markdown ![alt](src)), in place of Nuxt UI's ProseImg: its zoom was a
// second viewer, wired on the <img> itself, out of the keyboard's reach. A click opens the
// picture full size in the site's one viewer (UiLightbox), as /experience's illustrations
// do. Rendered inside a <p>: only phrasing content in the button.
// A plain <img>, not NuxtImg: ipx re-encoded every request, no cache, no resize, no format
// change, and served each file heavier than committed (a PNG8 regrown to truecolor, the gwm
// demo GIF 1.49 MB and ~4.5 s of CPU for 884 KB). Optimise the file in public/ instead.
import { useI18n } from '#imports'

defineProps<{
  src: string
  alt: string
  width?: string | number
  height?: string | number
}>()

const { t } = useI18n()
const lightbox = useLightbox()
</script>

<template>
  <button
    type="button"
    class="group/zoom relative block w-full cursor-zoom-in overflow-hidden rounded-[1rem] bg-(--placeholder) ring-1 ring-(--card-border)"
    :aria-label="t('lightbox.open', { name: alt })"
    @click="lightbox.open(src, alt)"
  >
    <img :src="src" :alt="alt" :width="width" :height="height" class="block h-auto w-full" />
    <span
      class="icon-btn absolute top-2 right-2 size-7 bg-(--card-bg) opacity-0 transition-opacity group-hover/zoom:opacity-100 group-focus-visible/zoom:opacity-100"
      aria-hidden="true"
    >
      <UIcon name="i-lucide-maximize-2" class="size-3.5" />
    </span>
  </button>
</template>
