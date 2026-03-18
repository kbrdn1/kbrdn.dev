<script setup lang="ts">
// Layout wrapper with dotted background, header and footer
const { t } = useI18n()
</script>

<template>
  <div class="relative min-h-screen text-neutral-100 flex flex-col">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded">
      {{ t('nav.skipToContent') || 'Skip to content' }}
    </a>
    <LayoutDottedBackground />
    <LayoutHeader />

    <main id="main-content" tabindex="-1" class="flex-1 relative z-10 pt-14">
      <slot />
    </main>

    <LayoutFooter />
  </div>
</template>
