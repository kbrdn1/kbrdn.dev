<script setup lang="ts">
// Minimal layout with header but no footer, for landing pages
</script>

<template>
  <div class="relative min-h-screen text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-950">
    <LayoutDottedBackground />
    <LayoutHeader />
    <main class="relative z-10 pt-14">
      <slot />
    </main>
  </div>
</template>
