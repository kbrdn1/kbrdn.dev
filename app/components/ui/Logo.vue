<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number | string;
  }>(),
  { size: 16 },
);
</script>

<template>
  <!--
    Monogramme @kbrdn1 : le montant gauche du cadre sert de barre au K.
    Cadre en rects pleins (et non en stroke) pour rester rendable par satori.
    La masse neutre suit currentColor — pas de <style> ici, il fuiterait dans le document.
    Version autonome pour le favicon : public/favicon.svg
  -->
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    aria-hidden="true"
    class="shrink-0"
  >
    <g fill="currentColor">
      <rect x="2" y="2" width="28" height="4" />
      <rect x="2" y="2" width="4" height="28" />
      <rect x="26" y="2" width="4" height="14" />
      <rect x="2" y="26" width="14" height="4" />
    </g>
    <path d="M19 9 L7 16 L19 23 V19 L14 16 L19 13 Z" fill="#d4825d" />
  </svg>
</template>
