<script setup lang="ts">
// The head every page shares: language, canonical, Open Graph frame, the site's JSON-LD
useSiteSeo()
</script>

<template>
  <UApp>
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
