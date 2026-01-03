# Animation & Skeleton Implementation Plan

## 📦 Composants Créés (Phase 1)

### Skeleton Components
```
app/components/ui/skeleton/
├── Skeleton.vue          # Base skeleton avec animations pulse/shimmer
├── SkeletonText.vue      # Lignes de texte placeholder
├── SkeletonAvatar.vue    # Avatar placeholder (rond/carré)
└── SkeletonCard.vue      # Cards préfabriquées (project, accordion, hero, stats)
```

### Animation Components
```
app/components/ui/
├── AnimatedSection.vue   # Wrapper avec fade-in au scroll
├── StaggerContainer.vue  # Container pour animations séquentielles
└── StaggerItem.vue       # Enfant avec délai stagger
```

---

## 🎯 Phase 2: Intégration Skeletons

### Hero Section
```vue
<template>
  <ClientOnly>
    <HomeHero ... />
    <template #fallback>
      <UiSkeletonCard variant="hero" />
    </template>
  </ClientOnly>
</template>
```

### GitHub Chart
```vue
<template>
  <div v-if="status === 'pending'">
    <UiSkeletonCard variant="stats" />
  </div>
  <template v-else>
    <!-- Actual content -->
  </template>
</template>
```

### Projects
```vue
<template>
  <div v-if="status === 'pending' || status === 'idle'">
    <UiSkeletonCard variant="project" />
    <UiSkeletonCard variant="project" />
  </div>
  <template v-else>
    <!-- Actual content -->
  </template>
</template>
```

### Experiences & Studies
```vue
<template>
  <div v-if="loading">
    <UiSkeletonCard variant="accordion" />
    <UiSkeletonCard variant="accordion" />
  </div>
  <template v-else>
    <!-- Actual content -->
  </template>
</template>
```

---

## 🎬 Phase 3: Animations d'Entrée

### Usage AnimatedSection
```vue
<UiAnimatedSection animation="fadeInUp" :delay="0">
  <HomeHero />
</UiAnimatedSection>

<UiAnimatedSection animation="fadeInUp" :delay="100">
  <HomeBio />
</UiAnimatedSection>

<UiAnimatedSection animation="fadeInUp" :delay="200">
  <HomeActions />
</UiAnimatedSection>
```

### Usage Stagger pour listes
```vue
<UiStaggerContainer :stagger-delay="100">
  <UiStaggerItem v-for="(exp, i) in experiences" :key="exp.id" :index="i">
    <AccordionItem :experience="exp" />
  </UiStaggerItem>
</UiStaggerContainer>
```

---

## ⚡ Phase 4: Animations Interactives

### Accordion (déjà implémenté)
```vue
<Transition
  enter-active-class="transition-all duration-200 ease-out"
  leave-active-class="transition-all duration-150 ease-in"
  enter-from-class="opacity-0 max-h-0"
  enter-to-class="opacity-100 max-h-[500px]"
  leave-from-class="opacity-100 max-h-[500px]"
  leave-to-class="opacity-0 max-h-0"
>
  <div v-if="isExpanded">...</div>
</Transition>
```

### Hover Effects (CSS)
```css
/* ProjectCard hover */
.project-card {
  @apply transition-all duration-200;
}
.project-card:hover {
  @apply border-primary-500/30 shadow-lg shadow-primary-500/5;
  transform: translateY(-2px);
}

/* Tech badge hover */
.tech-badge:hover {
  @apply bg-primary-500/10 text-primary-400 border-primary-500/30;
}

/* Social button hover */
.social-btn:hover {
  transform: scale(1.05);
}
```

### GitHub Cell Pulse
```vue
<div
  class="contribution-cell"
  @mouseenter="showTooltip"
  @mouseleave="hideTooltip"
>
  <!-- Pulse ring on hover -->
</div>

<style>
.contribution-cell:hover {
  @apply ring-2 ring-primary-500/50;
  animation: pulse-ring 0.3s ease-out;
}

@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(var(--primary-500), 0.4); }
  100% { box-shadow: 0 0 0 4px rgba(var(--primary-500), 0); }
}
</style>
```

---

## 📱 Phase 5: Optimisations

### Reduced Motion
```vue
<script setup>
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
</script>

<template>
  <UiAnimatedSection
    :animation="prefersReducedMotion ? 'fadeIn' : 'fadeInUp'"
    :duration="prefersReducedMotion ? 0 : 500"
  >
    ...
  </UiAnimatedSection>
</template>
```

### Performance
- Utiliser `will-change` avec parcimonie
- Préférer `transform` et `opacity` (GPU-accelerated)
- Éviter les animations sur `height` (utiliser `max-height`)
- Désactiver animations hors viewport (Intersection Observer)

---

## 📋 Checklist d'Implémentation

### Phase 1 ✅
- [x] Skeleton.vue - Base component
- [x] SkeletonText.vue - Text lines
- [x] SkeletonAvatar.vue - Avatar placeholder
- [x] SkeletonCard.vue - Card variants
- [x] AnimatedSection.vue - Scroll animation
- [x] StaggerContainer.vue - Stagger parent
- [x] StaggerItem.vue - Stagger child

### Phase 2 ✅
- [x] Intégrer skeleton dans Hero (via ClientOnly fallback)
- [x] Intégrer skeleton dans GitHubChart
- [x] Intégrer skeleton dans Projects
- [x] Intégrer skeleton dans Experiences
- [x] Intégrer skeleton dans Studies

### Phase 3 ✅
- [x] Wrap sections avec AnimatedSection
- [x] Ajouter stagger aux listes (Experiences, Studies, Projects, Socials, Bio)
- [x] Configurer délais progressifs (100ms pour cards, 50ms pour boutons)

### Phase 4 ✅
- [x] Hover effects sur ProjectCard (lift + shadow + border glow)
- [x] Hover effects sur tech badges (color transition)
- [x] Hover effects sur boutons (scale effect)
- [x] Hover effects sur GitHub cells (scale + ring)
- [x] Hover effects sur accordion headers (left border + chevron color)
- [x] Hover effects sur tech legend items (scale + highlight)

### Phase 5 ✅
- [x] Support reduced-motion (composable + CSS media queries)
- [x] Optimisation will-change (ajout/suppression dynamique)
- [x] GPU acceleration hints (classes utilitaires)
- [x] Accessibilité skeletons (aria-hidden, role=presentation)
- [x] Reduced-motion dans AnimatedSection, StaggerContainer, StaggerItem
- [x] Reduced-motion dans Skeleton (disable shimmer/pulse)

---

## 🎨 Tokens d'Animation

```ts
// Durées recommandées
const durations = {
  fast: 150,      // Hover, toggles
  normal: 300,    // Transitions UI
  slow: 500,      // Entrées sections
  slower: 700     // Animations complexes
}

// Easings
const easings = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',  // ease-out
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
}

// Stagger delays
const staggers = {
  fast: 50,
  normal: 100,
  slow: 150
}
```
