<script setup lang="ts">
// Blog layout with blog-specific header navigation
</script>

<template>
  <div class="relative min-h-screen text-neutral-100 flex flex-col">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded">
      Skip to content
    </a>
    <LayoutDottedBackground />
    <LayoutBlogHeader />

    <main id="main-content" class="flex-1 relative z-10 pt-14">
      <HomeBanner />
      <slot />
    </main>

    <LayoutFooter class="relative z-10" />
  </div>
</template>
