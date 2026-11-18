<script setup lang="ts">
// A figure after Monocode's stat: its label, its value rolling in, then a signed change if any
// (Monocode's delta: ▲ or ▼ in the good or the bad colour) and its trend as a dithered sparkline.
// Numbers come already written in the page's language: this shows them as given.
defineProps<{
  label: string
  value: string
  /** After the value, smaller: "/ jour" */
  unit?: string
  /** A signed change: "+12 %", "−3" */
  delta?: string
  /** A fall is the good news (response times, errors) */
  lowerIsBetter?: boolean
  trend?: number[]
  /** What the sparkline draws, for screen readers */
  trendLabel?: string
}>()

const falls = (delta: string) => /^[-−]/.test(delta)
</script>

<template>
  <div>
    <p class="eyebrow mb-1">{{ label }}</p>
    <p class="text-4xl tracking-tight text-neutral-900 dark:text-neutral-100">
      <UiRollingNumber :value="value" />
      <span v-if="unit" class="text-base text-neutral-500 dark:text-neutral-400">{{ unit }}</span>
    </p>
    <p
      v-if="delta"
      :class="
        cn(
          'mt-1 font-mono text-xs',
          falls(delta) !== lowerIsBetter
            ? 'text-red-700 dark:text-red-500'
            : 'text-green-800 dark:text-green-500',
        )
      "
    >
      <span aria-hidden="true">{{ falls(delta) ? '▼' : '▲' }}</span> {{ delta }}
    </p>
    <UiDitherChart
      v-if="trend && trend.length > 1"
      class="mt-3"
      :chart="{ kind: 'trend', values: trend }"
      :label="trendLabel"
    />
  </div>
</template>
