<script setup lang="ts">
// The head every page shares: language, canonical, Open Graph frame, the site's JSON-LD
useSiteSeo()
</script>

<template>
  <UApp>
    <!-- A navigation slower than a moment (the first to a content page loads Nuxt Content's
         database in the browser) shows a thin bar along the top, in the site's orange -->
    <NuxtLoadingIndicator color="var(--color-primary-500)" :height="2" />
    <!-- Says the new page's title to screen readers on client-side navigation -->
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Outside the layout so the music survives page and layout changes. -->
    <LayoutMusicDock />
    <UiPixelCursor />
    <UiLightbox />
  </UApp>
</template>
