<script setup lang="ts">
/**
 * Alert MDC Component
 * Usage in markdown: ::alert{type="info"}
 * Your alert content here
 * ::
 */

interface Props {
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: undefined,
})

const colorMap = {
  info: 'primary',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const

const iconMap = {
  info: 'i-heroicons-information-circle',
  success: 'i-heroicons-check-circle',
  warning: 'i-heroicons-exclamation-triangle',
  error: 'i-heroicons-x-circle',
} as const
</script>

<template>
  <UAlert
    :color="colorMap[props.type]"
    :icon="iconMap[props.type]"
    :title="props.title"
    class="my-4"
  >
    <template #description>
      <slot />
    </template>
  </UAlert>
</template>
