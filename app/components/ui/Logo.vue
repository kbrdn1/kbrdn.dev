<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number | string
  }>(),
  { size: 16 },
)
</script>

<template>
  <!--
    Monogramme K : une barre montante, et la branche coupée en deux pièces orange
    de part et d'autre, sur une grille de 96 à 45°.
    La barre suit currentColor — pas de <style> ici, il fuiterait dans le document.
    Version autonome pour le favicon : public/favicon.svg ; variantes : public/images/logo/
  -->
  <svg :width="size" :height="size" viewBox="0 0 96 96" aria-hidden="true" class="shrink-0">
    <path d="M64 0H96L0 96V64Z" fill="currentColor" />
    <path d="M0 0L24 24L0 48ZM56 56L96 96H64L40 72Z" fill="#d4825d" />
  </svg>
</template>
