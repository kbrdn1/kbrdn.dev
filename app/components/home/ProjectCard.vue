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
  language?: string
}

const props = withDefaults(defineProps<Props>(), {
  tags: () => [],
  stats: () => [],
  techStack: () => [],
  language: ''
})

// Calculate total for tech stack bar
const techStackTotal = computed(() =>
  props.techStack.reduce((sum, tech) => sum + tech.percentage, 0)
)

// Primary language from tech stack
const primaryLanguage = computed(() => {
  if (props.language) return props.language
  if (props.techStack.length) return props.techStack[0].name
  return ''
})
</script>

<template>
  <div
    :class="cn(
      'group relative p-6',
      'bg-white/50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800',
      'hover:border-primary-500/50 hover:shadow-sm transition-all duration-200'
    )"
  >
    <div class="flex flex-col lg:flex-row lg:gap-8">
      <!-- Left: Project info -->
      <div class="flex-1 min-w-0 space-y-4">
        <!-- Category label -->
        <span
          v-if="primaryLanguage"
          class="inline-block text-[11px] font-mono uppercase tracking-widest text-primary-500"
        >
          {{ primaryLanguage }}
        </span>

        <!-- Title -->
        <h3 class="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {{ name }}
        </h3>

        <!-- Description -->
        <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {{ description }}
        </p>

        <!-- Tags -->
        <div v-if="tags.length" class="flex flex-wrap gap-2">
          <span
            v-for="tag in tags"
            :key="tag"
            :class="cn(
              'px-3 py-1 text-xs font-mono uppercase tracking-wider whitespace-nowrap',
              'border border-neutral-300 dark:border-neutral-700',
              'text-neutral-600 dark:text-neutral-400',
              'hover:bg-primary-500/10 hover:border-primary-500/30 hover:text-primary-500',
              'transition-colors duration-150 cursor-default'
            )"
          >
            {{ tag }}
          </span>
        </div>

        <!-- Stats -->
        <div v-if="stats.length" class="flex items-baseline gap-6">
          <div v-for="stat in stats" :key="stat.label" class="flex items-baseline gap-2">
            <span class="text-xs text-neutral-500 uppercase tracking-wider font-mono">
              {{ stat.label }}
            </span>
            <span class="text-lg font-bold text-neutral-900 dark:text-neutral-100 font-mono">
              {{ stat.value }}
            </span>
            <span
              v-if="stat.trend"
              :class="cn(
                'text-xs font-mono',
                stat.trend > 0 ? 'text-primary-500' : 'text-red-500'
              )"
            >
              {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Tech stack + actions -->
      <div class="flex flex-col justify-between gap-4 mt-6 lg:mt-0 lg:w-72 flex-shrink-0">
        <!-- Tech Stack Bar -->
        <div v-if="techStack.length" class="space-y-2">
          <!-- Bar -->
          <div class="h-2 flex overflow-hidden">
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
          <div class="flex flex-wrap gap-x-3 gap-y-1">
            <div
              v-for="tech in techStack"
              :key="tech.name"
              class="flex items-center gap-1.5 text-xs group/tech cursor-default"
            >
              <span
                class="w-2 h-2 flex-shrink-0"
                :style="{ backgroundColor: tech.color }"
              />
              <span class="text-neutral-500 uppercase tracking-wider text-[11px]">{{ tech.name }}</span>
              <span class="text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">{{ tech.percentage }}%</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <UButton
            v-if="githubUrl"
            :to="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            color="neutral"
            size="sm"
            icon="i-simple-icons-github"
            :label="t('projects.viewProject')"
            class="font-mono uppercase tracking-wider text-[11px] transition-transform duration-200 hover:scale-105 active:scale-95"
          />
          <UButton
            v-if="demoUrl"
            :to="demoUrl"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            color="primary"
            size="sm"
            icon="i-heroicons-arrow-top-right-on-square"
            :label="t('projects.demo')"
            class="font-mono uppercase tracking-wider text-[11px] transition-transform duration-200 hover:scale-105 active:scale-95"
          />
        </div>
      </div>
    </div>
  </div>
</template>
