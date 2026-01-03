<script setup lang="ts">
/**
 * Skeleton Card Component
 *
 * A complete skeleton card with configurable sections.
 * Use for project cards, experience cards, etc.
 *
 * @example
 * <UiSkeletonCard variant="project" />
 * <UiSkeletonCard variant="accordion" />
 */

interface Props {
  /** Card variant determines layout */
  variant?: 'default' | 'project' | 'accordion' | 'hero' | 'stats'
}

withDefaults(defineProps<Props>(), {
  variant: 'default'
})
</script>

<template>
  <!-- Default Card -->
  <div
    v-if="variant === 'default'"
    class="p-4 border border-neutral-800 bg-neutral-900/50 space-y-3"
  >
    <UiSkeleton class="h-5 w-1/3" />
    <UiSkeletonText :lines="2" size="sm" />
    <div class="flex gap-2">
      <UiSkeleton class="h-6 w-16" />
      <UiSkeleton class="h-6 w-16" />
      <UiSkeleton class="h-6 w-16" />
    </div>
  </div>

  <!-- Project Card -->
  <div
    v-else-if="variant === 'project'"
    class="p-4 border border-neutral-800 bg-neutral-950/50 space-y-4"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UiSkeleton class="h-5 w-24" />
        <UiSkeleton class="h-4 w-4" />
        <UiSkeleton class="h-4 w-32" />
      </div>
      <div class="flex items-center gap-2">
        <UiSkeleton class="h-6 w-12" />
        <UiSkeleton class="h-6 w-12" />
        <UiSkeleton class="h-6 w-6" />
      </div>
    </div>
    <!-- Stats -->
    <div class="flex gap-8">
      <div class="space-y-1">
        <UiSkeleton class="h-3 w-12" />
        <UiSkeleton class="h-7 w-8" />
      </div>
      <div class="space-y-1">
        <UiSkeleton class="h-3 w-12" />
        <UiSkeleton class="h-7 w-8" />
      </div>
    </div>
    <!-- Tech bar -->
    <div class="space-y-2">
      <UiSkeleton class="h-2 w-full" />
      <div class="flex gap-4">
        <UiSkeleton class="h-3 w-16" />
        <UiSkeleton class="h-3 w-16" />
        <UiSkeleton class="h-3 w-16" />
      </div>
    </div>
  </div>

  <!-- Accordion Card -->
  <div
    v-else-if="variant === 'accordion'"
    class="border border-neutral-800 bg-neutral-900/50"
  >
    <div class="flex items-center gap-3 px-4 py-3">
      <UiSkeletonAvatar size="sm" :rounded="false" />
      <div class="flex-1 space-y-1">
        <UiSkeleton class="h-4 w-32" />
        <UiSkeleton class="h-3 w-48" />
      </div>
      <UiSkeleton class="h-3 w-24" />
      <UiSkeleton class="h-4 w-4" />
    </div>
  </div>

  <!-- Hero Section -->
  <div
    v-else-if="variant === 'hero'"
    class="flex items-start gap-4"
  >
    <UiSkeletonAvatar size="xl" :rounded="false" />
    <div class="flex-1 space-y-2">
      <div class="flex items-center gap-2">
        <UiSkeleton class="h-4 w-4" />
        <UiSkeleton class="h-7 w-40" />
      </div>
      <UiSkeleton class="h-4 w-32" />
    </div>
    <div class="flex items-center gap-2">
      <UiSkeleton class="h-8 w-8" />
      <UiSkeleton class="h-8 w-12" />
      <UiSkeleton class="h-8 w-8" />
      <UiSkeleton class="h-8 w-8" />
    </div>
  </div>

  <!-- Stats Card -->
  <div
    v-else-if="variant === 'stats'"
    class="space-y-4"
  >
    <div class="flex flex-col sm:flex-row gap-4 sm:gap-8">
      <div class="space-y-1">
        <UiSkeleton class="h-3 w-24" />
        <UiSkeleton class="h-10 w-20" />
      </div>
      <div class="space-y-1">
        <UiSkeleton class="h-3 w-20" />
        <UiSkeleton class="h-10 w-16" />
      </div>
    </div>
    <!-- Grid -->
    <div class="space-y-2">
      <div class="flex gap-1">
        <UiSkeleton v-for="i in 12" :key="i" class="h-3 flex-1" />
      </div>
      <div class="flex gap-[3px]">
        <div v-for="w in 52" :key="w" class="flex flex-col gap-[3px]">
          <UiSkeleton v-for="d in 7" :key="d" class="w-3 h-3" />
        </div>
      </div>
    </div>
  </div>
</template>
