<script setup lang="ts">
// Minimal layout with header but no footer, for landing pages
const { t } = useI18n()
</script>

<template>
  <div class="relative min-h-screen text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-950">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded">
      {{ t('nav.skipToContent') || 'Skip to content' }}
    </a>
    <LayoutDottedBackground />
    <LayoutHeader />
    <main id="main-content" tabindex="-1" class="relative z-10 pt-14">
      <slot />
    </main>
  </div>
</template>
