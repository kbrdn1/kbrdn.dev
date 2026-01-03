<script setup lang="ts">
// Minimal layout without header/footer for landing pages
</script>

<template>
  <div class="relative min-h-screen text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-950">
    <LayoutDottedBackground />
    <main class="relative z-10">
      <slot />
    </main>
  </div>
</template>
