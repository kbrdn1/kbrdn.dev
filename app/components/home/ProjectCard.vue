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

const techStackTotal = computed(() =>
  props.techStack.reduce((sum, tech) => sum + tech.percentage, 0)
)

const primaryLanguage = computed(() => {
  if (props.language) return props.language
  if (props.techStack.length) return props.techStack[0].name
  return ''
})
</script>

<template>
  <div
    :class="cn(
      'group relative overflow-hidden',
      'border border-neutral-200 dark:border-neutral-800',
      'hover:border-primary-500/40 transition-all duration-300',
    )"
  >
    <!-- Tech stack bar as top accent -->
    <div v-if="techStack.length" class="h-1 flex">
      <div
        v-for="tech in techStack"
        :key="tech.name"
        :style="{
          width: `${(tech.percentage / techStackTotal) * 100}%`,
          backgroundColor: tech.color,
        }"
      />
    </div>

    <div class="p-5">
      <!-- Header: language + actions -->
      <div class="flex items-start justify-between gap-4 mb-3">
        <div class="min-w-0">
          <!-- Language badge -->
          <span
            v-if="primaryLanguage"
            class="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-primary-500 mb-1"
          >
            {{ primaryLanguage }}
          </span>
          <!-- Title -->
          <h3 class="text-lg font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
            {{ name }}
          </h3>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1.5 shrink-0">
          <a
            v-if="githubUrl"
            :href="githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            :class="cn(
              'flex items-center justify-center w-8 h-8',
              'border border-neutral-200 dark:border-neutral-800',
              'text-neutral-500 hover:text-primary-500 hover:border-primary-500/50',
              'transition-all',
            )"
            :title="t('projects.viewProject')"
            :aria-label="`${name} - ${t('projects.viewProject')}`"
          >
            <UIcon name="i-simple-icons-github" class="w-4 h-4" aria-hidden="true" />
          </a>
          <a
            v-if="demoUrl"
            :href="demoUrl"
            target="_blank"
            rel="noopener noreferrer"
            :class="cn(
              'flex items-center justify-center w-8 h-8',
              'border border-primary-500/30',
              'text-primary-500 hover:bg-primary-500/10 hover:border-primary-500/50',
              'transition-all',
            )"
            :title="t('projects.demo')"
            :aria-label="`${name} - ${t('projects.demo')}`"
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      <!-- Description -->
      <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
        {{ description }}
      </p>

      <!-- Stats + Tags row -->
      <div class="flex items-center justify-between gap-4">
        <!-- Stats -->
        <div v-if="stats.length" class="flex items-baseline gap-4">
          <div v-for="stat in stats" :key="stat.label" class="flex items-baseline gap-1.5">
            <span class="text-[10px] text-neutral-500 uppercase tracking-wider font-mono">
              {{ stat.label }}
            </span>
            <span class="text-sm font-bold text-neutral-900 dark:text-neutral-100 font-mono">
              {{ stat.value }}
            </span>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="tags.length" class="flex flex-wrap gap-1.5 justify-end">
          <span
            v-for="tag in tags"
            :key="tag"
            :class="cn(
              'px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider',
              'border border-neutral-200 dark:border-neutral-800',
              'text-neutral-500',
              'hover:bg-primary-500/10 hover:border-primary-500/30 hover:text-primary-500',
              'transition-colors cursor-default',
            )"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Tech legend -->
      <div v-if="techStack.length" class="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/50">
        <div
          v-for="tech in techStack"
          :key="tech.name"
          class="flex items-center gap-1 text-[10px]"
        >
          <span class="w-1.5 h-1.5 shrink-0" :style="{ backgroundColor: tech.color }" />
          <span class="text-neutral-400 font-mono">{{ tech.name }} {{ tech.percentage }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
