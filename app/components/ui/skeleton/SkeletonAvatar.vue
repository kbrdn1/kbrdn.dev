<script setup lang="ts">
/**
 * Skeleton Avatar Component
 *
 * A skeleton placeholder for avatar images.
 * Supports different sizes and shapes (circle/square).
 *
 * @example
 * <UiSkeletonAvatar size="lg" />
 * <UiSkeletonAvatar size="md" :rounded="false" />
 */

interface Props {
  /** Avatar size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Use rounded-full (circle) or rounded-lg (square) */
  rounded?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  rounded: true
})

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
}
</script>

<template>
  <UiSkeleton
    :class="cn(
      sizeClasses[size],
      rounded ? 'rounded-full' : 'rounded-lg'
    )"
  />
</template>
