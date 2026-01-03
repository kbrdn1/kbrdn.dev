<script setup lang="ts">
// Layout wrapper with dotted background, header and footer
</script>

<template>
  <div class="relative min-h-screen text-neutral-100 flex flex-col">
    <LayoutDottedBackground />
    <LayoutHeader />

    <main class="flex-1 relative z-10 pt-14">
      <slot />
    </main>

    <LayoutFooter />
  </div>
</template>
