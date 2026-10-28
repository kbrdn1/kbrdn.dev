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
    de part et d'autre, sur une grille de 96 à 45°, chaque coin arrondi d'un rayon de 4.
    La barre suit currentColor : pas de <style> ici, il fuiterait dans le document.
    Version autonome pour le favicon : public/favicon.svg ; variantes : public/images/logo/
  -->
  <svg :width="size" :height="size" viewBox="0 0 96 96" aria-hidden="true" class="shrink-0">
    <path
      d="M62.83 1.17A4 4 0 0 1 65.66 0L86.34 0A4 4 0 0 1 89.17 6.83L6.83 89.17A4 4 0 0 1 0 86.34L0 65.66A4 4 0 0 1 1.17 62.83Z"
      fill="currentColor"
    />
    <path
      d="M0 9.66A4 4 0 0 1 6.83 6.83L21.17 21.17A4 4 0 0 1 21.17 26.83L6.83 41.17A4 4 0 0 1 0 38.34ZM53.17 58.83A4 4 0 0 1 58.83 58.83L89.17 89.17A4 4 0 0 1 86.34 96L65.66 96A4 4 0 0 1 62.83 94.83L42.83 74.83A4 4 0 0 1 42.83 69.17Z"
      fill="#d4825d"
    />
  </svg>
</template>
