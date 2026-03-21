<script setup lang="ts">
defineProps<{
  label: string
  variant?: 'default' | 'light'
}>()
</script>

<template>
  <span
    :class="[
      'inline-block font-mono text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1',
      variant === 'light'
        ? 'border border-white/20 text-white/60'
        : 'border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400',
    ]"
  >
    {{ label }}
  </span>
</template>
