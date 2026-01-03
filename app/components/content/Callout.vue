<script setup lang="ts">
/**
 * Callout MDC Component
 * Usage in markdown: ::callout{icon="rocket" color="primary"}
 * Your callout content here
 * ::
 */

interface Props {
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'i-heroicons-light-bulb',
  color: 'primary',
  title: undefined,
})

const colorClasses = {
  primary: 'border-primary-500 bg-primary-500/10',
  secondary: 'border-secondary-500 bg-secondary-500/10',
  success: 'border-success-500 bg-success-500/10',
  warning: 'border-warning-500 bg-warning-500/10',
  error: 'border-error-500 bg-error-500/10',
  neutral: 'border-neutral-500 bg-neutral-500/10',
} as const

const iconColorClasses = {
  primary: 'text-primary-500',
  secondary: 'text-secondary-500',
  success: 'text-success-500',
  warning: 'text-warning-500',
  error: 'text-error-500',
  neutral: 'text-neutral-500',
} as const
</script>

<template>
  <div
    class="my-4 rounded-lg border-l-4 p-4"
    :class="colorClasses[props.color]"
  >
    <div class="flex items-start gap-3">
      <UIcon
        :name="props.icon"
        class="size-6 shrink-0"
        :class="iconColorClasses[props.color]"
      />
      <div class="min-w-0 flex-1">
        <p
          v-if="props.title"
          class="mb-2 font-semibold"
          :class="iconColorClasses[props.color]"
        >
          {{ props.title }}
        </p>
        <div class="prose prose-sm dark:prose-invert">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
