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

const iconMap = {
  info: 'i-heroicons-information-circle',
  success: 'i-heroicons-check-circle',
  warning: 'i-heroicons-exclamation-triangle',
  error: 'i-heroicons-x-circle',
} as const

const styleMap = {
  info: 'border-primary-500/30 bg-primary-500/5 text-primary-600 dark:text-primary-400',
  success: 'border-green-500/30 bg-green-500/5 text-green-600 dark:text-green-400',
  warning: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-600 dark:text-yellow-400',
  error: 'border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400',
} as const

const iconColorMap = {
  info: 'text-primary-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
} as const
</script>

<template>
  <div
    :class="cn(
      'my-6 flex items-start gap-3 px-4 py-3 border text-sm',
      styleMap[props.type],
    )"
  >
    <UIcon :name="iconMap[props.type]" :class="cn('w-5 h-5 shrink-0 mt-0.5', iconColorMap[props.type])" aria-hidden="true" />
    <div>
      <p v-if="props.title" class="font-medium mb-1">{{ props.title }}</p>
      <div class="text-neutral-600 dark:text-neutral-300 [&_a]:text-primary-500 [&_a]:underline [&_a]:underline-offset-2 [&_p]:m-0 [&_p]:inline">
        <slot />
      </div>
    </div>
  </div>
</template>
