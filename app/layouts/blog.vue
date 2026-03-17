<script setup lang="ts">
// Blog layout with blog-specific header navigation
</script>

<template>
  <div class="relative min-h-screen text-neutral-100 flex flex-col">
    <LayoutDottedBackground />
    <LayoutBlogHeader />

    <main class="flex-1 relative z-10 pt-14">
      <HomeBanner />
      <slot />
    </main>

    <LayoutFooter class="relative z-10" />
  </div>
</template>
