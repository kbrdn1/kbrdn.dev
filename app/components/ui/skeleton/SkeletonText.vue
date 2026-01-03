<script setup lang="ts">
/**
 * Skeleton Text Component
 *
 * Renders multiple skeleton lines to simulate text content.
 * Automatically varies line widths for realistic appearance.
 *
 * @example
 * <UiSkeletonText :lines="3" />
 * <UiSkeletonText :lines="2" size="lg" />
 */

interface Props {
  /** Number of lines to display */
  lines?: number
  /** Text size variant */
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  /** Line width pattern: 'varied' randomizes, 'full' uses 100% */
  widthPattern?: 'varied' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  lines: 1,
  size: 'base',
  widthPattern: 'varied'
})

const sizeClasses = {
  xs: 'h-2.5',
  sm: 'h-3',
  base: 'h-4',
  lg: 'h-5',
  xl: 'h-6'
}

const gapClasses = {
  xs: 'gap-1.5',
  sm: 'gap-2',
  base: 'gap-2.5',
  lg: 'gap-3',
  xl: 'gap-3.5'
}

// Predefined width patterns for natural-looking text
const widthPatterns = ['w-full', 'w-11/12', 'w-10/12', 'w-9/12', 'w-8/12', 'w-7/12']

function getLineWidth(index: number): string {
  if (props.widthPattern === 'full') return 'w-full'
  // Last line is usually shorter
  if (index === props.lines - 1) return widthPatterns[Math.floor(Math.random() * 3) + 3]
  // Other lines vary between full and 10/12
  return widthPatterns[Math.floor(Math.random() * 2)]
}
</script>

<template>
  <div :class="cn('flex flex-col', gapClasses[size])">
    <UiSkeleton
      v-for="i in lines"
      :key="i"
      :class="cn(sizeClasses[size], getLineWidth(i))"
    />
  </div>
</template>
