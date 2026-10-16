<script setup lang="ts">
// Dotted grid background pattern component
// Uses CSS pattern from main.css for performance
</script>

<template>
  <div
    class="fixed inset-0 -z-10 dotted-background bg-[#f0eeeb] dark:bg-neutral-950"
    aria-hidden="true"
  />
  <!-- Not inside the -z-10 layer: the minimal layout's opaque root would cover it.
       Positioned at z-0 it paints above every layout root, under main (z-10). -->
  <UiDitherCanvas
    interactive
    fade="down"
    class="fixed inset-x-0 top-0 z-0 h-[65vh] w-full [mask-image:linear-gradient(to_bottom,#000_60%,transparent)]"
  />
</template>
