<script setup lang="ts">
/**
 * Base Skeleton Component
 *
 * A flexible skeleton loading placeholder with pulse animation.
 * Use this as a base for building more complex skeleton layouts.
 *
 * @example
 * <UiSkeleton class="h-4 w-32" />
 * <UiSkeleton class="h-12 w-12 rounded-full" />
 */

interface Props {
  /** Apply rounded-full for circular skeletons */
  circle?: boolean
  /** Custom animation class override */
  animation?: 'pulse' | 'shimmer' | 'none'
}

withDefaults(defineProps<Props>(), {
  circle: false,
  animation: 'pulse'
})

const animationClasses = {
  pulse: 'animate-pulse',
  shimmer: 'animate-shimmer',
  none: ''
}
</script>

<template>
  <div
    :class="cn(
      'bg-neutral-200 dark:bg-neutral-800',
      circle ? 'rounded-full' : 'rounded',
      animationClasses[animation]
    )"
    role="presentation"
    aria-hidden="true"
  />
</template>

<style>
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-shimmer {
  background: linear-gradient(
    90deg,
    rgb(229 229 229) 0%,
    rgb(245 245 245) 50%,
    rgb(229 229 229) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  will-change: background-position;
}

:root.dark .animate-shimmer {
  background: linear-gradient(
    90deg,
    rgb(38 38 38) 0%,
    rgb(64 64 64) 50%,
    rgb(38 38 38) 100%
  );
  background-size: 200% 100%;
}

/* Reduced motion: disable shimmer animation */
@media (prefers-reduced-motion: reduce) {
  .animate-shimmer {
    animation: none;
    background: rgb(229 229 229);
    will-change: auto;
  }

  :root.dark .animate-shimmer {
    background: rgb(38 38 38);
  }

  .animate-pulse {
    animation: none;
  }
}
</style>
