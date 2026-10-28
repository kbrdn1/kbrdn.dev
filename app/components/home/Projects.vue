<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

interface PinnedRepo {
  name: string
  description: string
  url: string
  homepage: string | null
  stars: number
  forks: number
  language: string | null
  languageColor: string | null
  languages: { name: string; color: string | null; percentage: number }[]
}

// The repositories pinned on the GitHub profile, in their pinned order.
const { data: repos, status } = useAsyncData<PinnedRepo[]>(
  'github-pinned-kbrdn1',
  () => $fetch('/api/github/pinned', { query: { username: 'kbrdn1' } }),
  { default: () => [], server: false },
)

// "Rust 99 %, Shell 1 %": what the language bar shows, for screen readers
function languageSummary(repo: PinnedRepo): string {
  return repo.languages.map((lang) => `${lang.name} ${Math.round(lang.percentage)} %`).join(', ')
}

// Logos of the repositories that ship one, served raw from their default branch, with a
// light-background variant when the logo needs one: a path from `/` is this site's own file.
// The others show their primary language. This site's logo is its own, never main's: main
// lags dev, and the favicon follows the system's colour scheme, not the site's.
// ponytail: curated list, one line per newly pinned repo with a logo; detect logo files
// through the repo tree API if the pinned set starts changing often.
const LOGOS: Record<string, { dark: string; light?: string }> = {
  'gwm-cli': { dark: 'docs/_assets/logo.svg', light: 'docs/_assets/logo-light.svg' },
  'kbrdn.dev': { dark: '/images/logo/k-light.svg', light: '/images/logo/k-dark.svg' },
}

function logo(repo: PinnedRepo): { dark: string; light: string } | null {
  const paths = LOGOS[repo.name]
  if (!paths) return null
  const raw = (path: string) =>
    path.startsWith('/')
      ? path
      : `https://raw.githubusercontent.com/kbrdn1/${repo.name}/HEAD/${path}`
  return { dark: raw(paths.dark), light: raw(paths.light ?? paths.dark) }
}
</script>

<template>
  <!-- The panel around it (index.vue) carries the title and the link to GitHub -->
  <div>
    <!-- Loading skeleton: same cards, same grid, same paddings as the loaded list -->
    <ul
      v-if="status === 'pending' || status === 'idle'"
      class="grid gap-1 sm:grid-cols-2"
      aria-hidden="true"
    >
      <li v-for="i in 6" :key="i" class="panel-card flex flex-col gap-2 p-4">
        <!-- Rows sized like the real ones: name 32px, two-line description 32px, footer 16px,
             language ticks 12px -->
        <div class="flex h-8 items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="icon-box size-8"><UiSkeleton class="size-4 rounded" /></span>
            <UiSkeleton class="h-4 w-32" />
          </div>
          <UiSkeleton circle class="size-4" />
        </div>
        <div>
          <div class="flex h-4 items-center"><UiSkeleton class="h-3 w-full" /></div>
          <div class="flex h-4 items-center"><UiSkeleton class="h-3 w-2/3" /></div>
        </div>
        <div class="mt-auto flex h-4 items-center gap-4">
          <UiSkeleton class="h-3 w-16" />
          <UiSkeleton class="h-3 w-8" />
        </div>
        <UiSkeleton class="ticks h-3 w-full" />
      </li>
    </ul>

    <!-- Pinned repositories, compact like GitHub's own pinned grid -->
    <ul v-else-if="repos.length" class="grid gap-1 sm:grid-cols-2">
      <li
        v-for="repo in repos"
        :key="repo.name"
        class="panel-card group/card relative isolate flex flex-col gap-2 overflow-hidden p-4 transition-colors hover:border-primary-500/50"
      >
        <UiPixelCanvas />
        <div class="flex items-center justify-between gap-3">
          <!-- The whole card opens the repository -->
          <a
            :href="repo.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex min-w-0 items-center gap-3 text-[15px] text-neutral-900 dark:text-neutral-100 hover:text-primary-500 transition-colors after:absolute after:inset-0"
          >
            <span class="icon-box size-8">
              <template v-if="logo(repo)">
                <img
                  :src="logo(repo)!.light"
                  alt=""
                  width="20"
                  height="20"
                  class="size-5 shrink-0 dark:hidden"
                />
                <img
                  :src="logo(repo)!.dark"
                  alt=""
                  width="20"
                  height="20"
                  class="hidden size-5 shrink-0 dark:block"
                />
              </template>
              <UIcon
                v-else
                :name="LANGUAGE_ICONS[repo.language ?? ''] ?? 'i-lucide-book-marked'"
                class="size-4 shrink-0 text-neutral-500"
                aria-hidden="true"
              />
            </span>
            <span class="truncate">{{ repo.name }}</span>
          </a>
          <div class="flex shrink-0 items-center gap-3 text-neutral-500">
            <a
              v-if="repo.homepage"
              :href="repo.homepage"
              target="_blank"
              rel="noopener noreferrer"
              class="relative z-10 hover:text-primary-500 transition-colors"
              :aria-label="`${t('projects.demo')} : ${repo.name}`"
            >
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="size-4"
                aria-hidden="true"
              />
            </a>
            <!-- The whole card is the repository link: this mark only says so -->
            <UIcon
              name="i-simple-icons-github"
              class="size-4 transition-colors group-hover/card:text-primary-500"
              aria-hidden="true"
            />
          </div>
        </div>
        <p
          v-if="repo.description"
          class="line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400"
        >
          {{ repo.description }}
        </p>
        <div
          class="mt-auto flex items-center gap-4 font-mono text-xs text-neutral-500 dark:text-neutral-400"
        >
          <span v-if="repo.language" class="inline-flex items-center gap-1.5">
            <span
              class="size-2.5"
              :style="{ backgroundColor: repo.languageColor ?? undefined }"
              aria-hidden="true"
            />
            {{ repo.language }}
          </span>
          <span class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-star" class="size-3.5" aria-hidden="true" />
            {{ repo.stars }}
            <span class="sr-only">{{ t('projects.stats.stars') }}</span>
          </span>
          <span v-if="repo.forks" class="inline-flex items-center gap-1">
            <UIcon name="i-lucide-git-fork" class="size-3.5" aria-hidden="true" />
            {{ repo.forks }}
            <span class="sr-only">{{ t('projects.stats.forks') }}</span>
          </span>
        </div>
        <!-- Share of the code by language, GitHub colours, cut into ticks.
             No pointer events: a click there still opens the repository. -->
        <div
          v-if="repo.languages.length"
          class="ticks pointer-events-none flex h-3 overflow-hidden bg-neutral-200 dark:bg-neutral-800"
          role="img"
          :aria-label="languageSummary(repo)"
        >
          <span
            v-for="lang in repo.languages"
            :key="lang.name"
            class="h-full"
            :style="{ width: `${lang.percentage}%`, backgroundColor: lang.color ?? undefined }"
          />
        </div>
      </li>
    </ul>

    <!-- Error / nothing pinned -->
    <p v-else class="panel-card flex items-center gap-3 p-5 text-sm text-neutral-500">
      <UiMascot mood="sad" :size="40" />
      {{ t('github.error') }}
    </p>
  </div>
</template>
