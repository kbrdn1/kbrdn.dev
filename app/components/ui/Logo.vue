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
    La barre suit currentColor : pas de <style> dans le SVG, il fuiterait dans le document.
    Version autonome pour le favicon : public/favicon.svg ; variantes : public/images/logo/
  -->
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 96 96"
    aria-hidden="true"
    class="logo shrink-0 overflow-visible"
  >
    <!-- Le svg imbriqué clippe la barre quand elle sort du cadre ; les pièces, elles, en débordent -->
    <svg width="96" height="96" overflow="hidden">
      <path
        class="bar"
        d="M62.83 1.17A4 4 0 0 1 65.66 0L86.34 0A4 4 0 0 1 89.17 6.83L6.83 89.17A4 4 0 0 1 0 86.34L0 65.66A4 4 0 0 1 1.17 62.83Z"
        fill="currentColor"
      />
    </svg>
    <path
      class="tri"
      d="M0 9.66A4 4 0 0 1 6.83 6.83L21.17 21.17A4 4 0 0 1 21.17 26.83L6.83 41.17A4 4 0 0 1 0 38.34Z"
      fill="#d4825d"
    />
    <path
      class="leg"
      d="M53.17 58.83A4 4 0 0 1 58.83 58.83L89.17 89.17A4 4 0 0 1 86.34 96L65.66 96A4 4 0 0 1 62.83 94.83L42.83 74.83A4 4 0 0 1 42.83 69.17Z"
      fill="#d4825d"
    />
  </svg>
</template>

<style scoped>
/* Au survol ou au focus du lien / bouton qui porte le logo, ou du logo seul : la barre file
   le long de sa diagonale, sort par le haut, revient par le bas, et en repassant recoupe la
   branche, dont les pièces s'écartent puis reviennent. Mouvement réduit et bouton pause :
   la règle globale d'accessibility.css ramène la durée à 0. */
:is(a, button):is(:hover, :focus-visible) .bar,
.logo:hover .bar {
  animation: bar 820ms;
}
:is(a, button):is(:hover, :focus-visible) .tri,
.logo:hover .tri {
  animation: tri 820ms cubic-bezier(0.2, 0.7, 0.3, 1);
}
:is(a, button):is(:hover, :focus-visible) .leg,
.logo:hover .leg {
  animation: leg 820ms cubic-bezier(0.2, 0.7, 0.3, 1);
}

/* En px : sur un élément SVG, ce sont des unités de la grille de 96 */
@keyframes bar {
  0% {
    transform: none;
    animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.5);
  }
  38% {
    transform: translate(80px, -80px);
    animation-timing-function: steps(1, end);
  }
  38.01% {
    transform: translate(-80px, 80px);
    animation-timing-function: cubic-bezier(0.15, 0.6, 0.3, 1);
  }
  70% {
    transform: translate(2px, -2px);
  }
  84% {
    transform: none;
  }
}
@keyframes tri {
  0%,
  60% {
    transform: none;
  }
  72% {
    transform: translate(-7px, -7px);
  }
  85% {
    transform: translate(2px, 2px);
  }
  94% {
    transform: translate(-0.6px, -0.6px);
  }
}
@keyframes leg {
  0%,
  62% {
    transform: none;
  }
  74% {
    transform: translate(7px, 7px);
  }
  87% {
    transform: translate(-2px, -2px);
  }
  95% {
    transform: translate(0.6px, 0.6px);
  }
}
</style>
