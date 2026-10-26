<script setup lang="ts">
// Dotted grid background pattern component
// Uses CSS pattern from main.css for performance

// In blur mode the dither fills the screen, unfaded: it is what the glass blurs. The canvas
// reads its props once, so it remounts when the fade changes.
const colorMode = useColorMode()
const fade = computed(() => (colorMode.value === 'blur' ? 'none' : 'down'))
</script>

<template>
  <div
    class="fixed inset-0 -z-10 dotted-background bg-[#f0eeeb] dark:bg-[#121212]"
    aria-hidden="true"
  />
  <!-- Backdrop and dither are not inside the -z-10 layer: the minimal layout's opaque
       root would cover them. At z-0 they paint above every layout root and under main
       (z-10). The backdrop is the space outside the 80rem column: a grid, and a border
       along the column continuing the header's, both fading out downwards. The +1px
       puts each border on the header's own. -->
  <div
    class="pointer-events-none fixed inset-0 z-0 hidden xl:block [mask-image:linear-gradient(#000,transparent_min(95vh,900px))]"
    aria-hidden="true"
  >
    <div
      class="absolute inset-y-0 left-0 w-[calc(50%-40rem+1px)] grid-background-blog border-r border-neutral-200 dark:border-neutral-800"
    />
    <div
      class="absolute inset-y-0 right-0 w-[calc(50%-40rem+1px)] grid-background-blog border-l border-neutral-200 dark:border-neutral-800"
    />
  </div>
  <UiDitherCanvas
    :key="fade"
    interactive
    :fade="fade"
    class="fixed inset-x-0 top-0 z-0 h-[85vh] w-full [mask-image:linear-gradient(to_bottom,#000_65%,transparent)] blur:h-screen blur:[mask-image:none]"
  />
</template>
