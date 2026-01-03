<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

interface TechStack {
  name: string
  percentage: number
  color: string
}

interface Stat {
  label: string
  value: string | number
  trend?: number
}

interface Props {
  name: string
  description: string
  tags?: string[]
  stats?: Stat[]
  techStack?: TechStack[]
  githubUrl?: string
  demoUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [],
  stats: () => [],
  techStack: () => []
})

// Calculate total for tech stack bar
const techStackTotal = computed(() =>
  props.techStack.reduce((sum, tech) => sum + tech.percentage, 0)
)
</script>

<template>
  <div
    :class="cn(
      'group relative p-4 space-y-4',
      'bg-white/50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800',
      'hover:border-primary-500/30 hover:shadow-lg hover:shadow-primary-500/5',
      'hover:-translate-y-0.5 transition-all duration-200'
    )"
  >
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <span class="text-neutral-900 dark:text-neutral-100 font-medium truncate">{{ name }}</span>
        <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 text-neutral-400 dark:text-neutral-600 flex-shrink-0 hidden sm:block" />
        <span class="text-neutral-600 dark:text-neutral-400 text-sm truncate hidden sm:block">{{ description }}</span>
      </div>

      <!-- Description mobile -->
      <p class="text-neutral-600 dark:text-neutral-400 text-sm sm:hidden">{{ description }}</p>

      <div class="flex items-center gap-2 flex-shrink-0">
        <!-- Tags -->
        <div class="flex items-center gap-1.5 overflow-x-auto">
          <span
            v-for="tag in tags"
            :key="tag"
            :class="cn(
              'px-2 py-0.5 text-xs font-mono whitespace-nowrap',
              'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700',
              'hover:bg-primary-500/10 hover:text-primary-400 hover:border-primary-500/30',
              'transition-colors duration-150 cursor-default'
            )"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Menu -->
        <UDropdownMenu
          :items="[
            [
              { label: 'GitHub', icon: 'i-simple-icons-github', to: githubUrl, target: '_blank', disabled: !githubUrl },
              { label: 'Demo', icon: 'i-heroicons-arrow-top-right-on-square', to: demoUrl, target: '_blank', disabled: !demoUrl }
            ]
          ]"
          :ui="{ content: 'w-40' }"
        >
          <UButton
            icon="i-heroicons-ellipsis-vertical"
            color="neutral"
            variant="ghost"
            size="xs"
          />
        </UDropdownMenu>
      </div>
    </div>

    <!-- Stats -->
    <div v-if="stats.length" class="flex items-baseline gap-6 sm:gap-8">
      <div v-for="stat in stats" :key="stat.label">
        <p class="text-xs text-neutral-500 uppercase tracking-wider mb-1">
          {{ stat.label }}
        </p>
        <p class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
          {{ stat.value }}
          <span
            v-if="stat.trend"
            :class="cn(
              'text-sm ml-1',
              stat.trend > 0 ? 'text-primary-500' : 'text-red-500'
            )"
          >
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </span>
        </p>
      </div>
    </div>

    <!-- Tech Stack Bar -->
    <div v-if="techStack.length" class="space-y-2">
      <!-- Bar -->
      <div class="h-2 flex">
        <div
          v-for="tech in techStack"
          :key="tech.name"
          :style="{
            width: `${(tech.percentage / techStackTotal) * 100}%`,
            backgroundColor: tech.color
          }"
        />
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-1">
        <div
          v-for="tech in techStack"
          :key="tech.name"
          class="flex items-center gap-1.5 text-xs group/tech cursor-default transition-transform duration-150 hover:scale-105"
        >
          <span
            class="w-2.5 h-2.5 transition-transform duration-150 group-hover/tech:scale-125"
            :style="{ backgroundColor: tech.color }"
          />
          <span class="text-neutral-500 uppercase tracking-wider group-hover/tech:text-neutral-700 dark:group-hover/tech:text-neutral-300 transition-colors">{{ tech.name }}</span>
          <span class="text-neutral-600 dark:text-neutral-400 font-mono group-hover/tech:text-neutral-900 dark:group-hover/tech:text-neutral-200 transition-colors">{{ tech.percentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
