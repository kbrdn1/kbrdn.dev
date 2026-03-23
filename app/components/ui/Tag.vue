<script setup lang="ts">
const TAG_COLORS: Record<string, string> = {
  go: 'border-cyan-400/30 text-cyan-400 bg-cyan-400/10',
  rust: 'border-orange-400/30 text-orange-400 bg-orange-400/10',
  nuxt: 'border-green-400/30 text-green-400 bg-green-400/10',
  laravel: 'border-red-400/30 text-red-400 bg-red-400/10',
  typescript: 'border-blue-400/30 text-blue-400 bg-blue-400/10',
  react: 'border-sky-400/30 text-sky-400 bg-sky-400/10',
  vue: 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10',
  'open-source': 'border-purple-400/30 text-purple-400 bg-purple-400/10',
  project: 'border-primary-400/30 text-primary-400 bg-primary-400/10',
  career: 'border-amber-400/30 text-amber-400 bg-amber-400/10',
  tui: 'border-violet-400/30 text-violet-400 bg-violet-400/10',
  dotfiles: 'border-lime-400/30 text-lime-400 bg-lime-400/10',
  terminal: 'border-emerald-400/30 text-emerald-400 bg-emerald-400/10',
  macos: 'border-slate-400/30 text-slate-400 bg-slate-400/10',
}

const FALLBACK_COLORS = [
  'border-sky-400/30 text-sky-400 bg-sky-400/10',
  'border-rose-400/30 text-rose-400 bg-rose-400/10',
  'border-teal-400/30 text-teal-400 bg-teal-400/10',
  'border-indigo-400/30 text-indigo-400 bg-indigo-400/10',
  'border-fuchsia-400/30 text-fuchsia-400 bg-fuchsia-400/10',
]

function hashTag(tag: string): number {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) - hash) + tag.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const VARIANT_CLASSES = {
  light: 'border-white/30 text-white/80 bg-white/8',
  primary: 'border-primary-500/30 text-primary-500 bg-primary-500/10 dark:border-primary-400/30 dark:text-primary-400 dark:bg-primary-400/10',
  sky: 'border-sky-400/30 text-sky-400 bg-sky-400/10',
  status: 'border-primary-500/30 text-primary-500 bg-primary-500/8 dark:border-primary-400/30 dark:text-primary-400 dark:bg-primary-400/8',
  default: 'border-neutral-300/50 text-neutral-600 bg-neutral-200/30 dark:border-neutral-600/50 dark:text-neutral-400 dark:bg-neutral-800/40',
} as const

const props = withDefaults(defineProps<{
  label: string
  variant?: 'default' | 'light' | 'primary' | 'sky' | 'status' | 'auto'
  tooltip?: boolean
}>(), {
  variant: 'default',
  tooltip: true,
})

const variantClasses = computed(() => {
  if (props.variant === 'auto') {
    const key = props.label.toLowerCase()
    return TAG_COLORS[key] || FALLBACK_COLORS[hashTag(key) % FALLBACK_COLORS.length]
  }
  return VARIANT_CLASSES[props.variant] || VARIANT_CLASSES.default
})
</script>

<template>
  <UTooltip v-if="tooltip" :text="label">
    <span
      :class="cn(
        'inline-block font-mono text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-wider border',
        variantClasses,
      )"
    >
      {{ label }}
    </span>
  </UTooltip>
  <span
    v-else
    :class="cn(
      'inline-block font-mono text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-wider border',
      variantClasses,
    )"
  >
    {{ label }}
  </span>
</template>
