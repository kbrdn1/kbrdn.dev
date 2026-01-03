<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

interface ProjectConfig {
  repo: string
  displayName?: string
  description?: string
  tags?: string[]
  demoUrl?: string
}

// Configure which repos to show and their display settings
const projectConfigs: ProjectConfig[] = [
  {
    repo: 'LazyCurl',
    displayName: 'LazyCurl',
    description: 'TUI HTTP Client',
    tags: ['cli', 'open-source']
  },
  {
    repo: 'kbrdn.dev-old',
    displayName: 'Portfolio v1',
    description: 'Previous Website',
    tags: ['astro', 'archive'],
    demoUrl: 'https://old.kbrdn.dev'
  },
  {
    repo: 'dotfiles',
    displayName: 'Dotfiles',
    description: 'OS X Config',
    tags: ['config', 'shell']
  },
  {
    repo: 'poduim',
    displayName: 'Podium',
    description: 'Tournament Manager',
    tags: ['vue', 'app']
  }
]

// Fetch real GitHub data
const { data: repos, status } = useGitHubRepos(
  'kbrdn1',
  projectConfigs.map(p => p.repo)
)

// Merge GitHub data with display config
const projects = computed(() => {
  if (!repos.value) return []

  return projectConfigs
    .map(config => {
      const repoData = repos.value?.find(
        r => r.name.toLowerCase() === config.repo.toLowerCase()
      )
      if (!repoData) return null

      return {
        name: config.displayName || repoData.name,
        description: config.description || repoData.description,
        tags: config.tags || repoData.topics.slice(0, 2),
        stats: [
          { label: t('projects.stats.stars'), value: formatNumber(repoData.stars) },
          { label: t('projects.stats.forks'), value: formatNumber(repoData.forks) }
        ].filter(s => Number(s.value) > 0 || s.label === t('projects.stats.stars')),
        techStack: repoData.languages,
        githubUrl: repoData.url,
        demoUrl: config.demoUrl || repoData.homepage
      }
    })
    .filter(Boolean)
})

// Format numbers (1000 -> 1k)
function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  }
  return num.toString()
}

// Expand state
const isExpanded = ref(false)
const DEFAULT_PROJECTS = 2

const visibleProjects = computed(() => {
  return isExpanded.value ? projects.value : projects.value.slice(0, DEFAULT_PROJECTS)
})

const canExpand = computed(() => projects.value.length > DEFAULT_PROJECTS)
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-100">{{ t('projects.title') }}</h2>
      <a
        href="https://github.com/kbrdn1?tab=repositories"
        target="_blank"
        rel="noopener noreferrer"
        class="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
      >
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-5 h-5" />
      </a>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="status === 'pending' || status === 'idle'" class="space-y-3">
      <div
        v-for="i in 2"
        :key="i"
        class="p-4 border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 space-y-4"
      >
        <!-- Header skeleton -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          <div class="flex items-center gap-3">
            <UiSkeleton class="h-5 w-24" />
            <UiSkeleton class="h-4 w-4 hidden sm:block" />
            <UiSkeleton class="h-4 w-32 hidden sm:block" />
          </div>
          <div class="flex items-center gap-2">
            <UiSkeleton class="h-6 w-14" />
            <UiSkeleton class="h-6 w-14" />
            <UiSkeleton class="h-6 w-6" />
          </div>
        </div>
        <!-- Stats skeleton -->
        <div class="flex gap-8">
          <div class="space-y-1">
            <UiSkeleton class="h-3 w-12" />
            <UiSkeleton class="h-6 w-8" />
          </div>
          <div class="space-y-1">
            <UiSkeleton class="h-3 w-12" />
            <UiSkeleton class="h-6 w-8" />
          </div>
        </div>
        <!-- Tech bar skeleton -->
        <div class="space-y-2">
          <UiSkeleton class="h-2 w-full" />
          <div class="flex gap-4">
            <UiSkeleton class="h-3 w-20" />
            <UiSkeleton class="h-3 w-16" />
            <UiSkeleton class="h-3 w-14" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="status === 'error'" class="text-sm text-neutral-500">
      {{ t('common.error') }}
    </div>

    <!-- Projects Grid with Stagger Animation -->
    <template v-else-if="projects.length">
      <UiStaggerContainer :stagger-delay="100" :base-delay="0" class="space-y-3">
        <UiStaggerItem
          v-for="(project, index) in visibleProjects"
          :key="project.name"
          :index="index"
        >
          <HomeProjectCard
          :name="project.name"
          :description="project.description"
          :tags="project.tags"
          :stats="project.stats"
          :tech-stack="project.techStack"
          :github-url="project.githubUrl"
          :demo-url="project.demoUrl"
          />
        </UiStaggerItem>
      </UiStaggerContainer>

      <!-- Show more/less button -->
      <button
        v-if="canExpand"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-primary-500 bg-neutral-100/50 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-primary-500/30 transition-all uppercase tracking-wider"
        @click="isExpanded = !isExpanded"
      >
        <UIcon
          :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
          class="w-4 h-4"
        />
        {{ isExpanded ? t('common.showLess') : t('common.showMore') }}
      </button>
    </template>

    <!-- Empty state (no projects found) -->
    <div v-else class="text-sm text-neutral-500">
      {{ t('common.error') }}
    </div>
  </div>
</template>
