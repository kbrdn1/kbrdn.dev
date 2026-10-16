<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Outside the layout so the music survives page and layout changes. -->
    <LayoutMusicDock />
  </UApp>
</template>
