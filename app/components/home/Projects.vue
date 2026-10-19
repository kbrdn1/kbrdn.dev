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
// light-background variant when the logo needs one. The others show their primary language.
// ponytail: curated list, one line per newly pinned repo with a logo; detect logo files
// through the repo tree API if the pinned set starts changing often.
const LOGOS: Record<string, { dark: string; light?: string }> = {
  'gwm-cli': { dark: 'docs/_assets/logo.svg', light: 'docs/_assets/logo-light.svg' },
  'kbrdn.dev': { dark: 'public/favicon.svg' },
}
const LANGUAGE_ICONS: Record<string, string> = {
  Astro: 'i-simple-icons-astro',
  Go: 'i-simple-icons-go',
  JavaScript: 'i-simple-icons-javascript',
  Lua: 'i-simple-icons-lua',
  PHP: 'i-simple-icons-php',
  Python: 'i-simple-icons-python',
  Rust: 'i-simple-icons-rust',
  Shell: 'i-simple-icons-gnubash',
  TypeScript: 'i-simple-icons-typescript',
  Vue: 'i-simple-icons-vuedotjs',
}

function logo(repo: PinnedRepo): { dark: string; light: string } | null {
  const paths = LOGOS[repo.name]
  if (!paths) return null
  const raw = (path: string) => `https://raw.githubusercontent.com/kbrdn1/${repo.name}/HEAD/${path}`
  return { dark: raw(paths.dark), light: raw(paths.light ?? paths.dark) }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-end justify-between">
      <div>
        <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-100">
          <UiScrambleText :text="t('projects.title')" />
        </h2>
      </div>
      <a
        href="https://github.com/kbrdn1?tab=repositories"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-primary-500 transition-colors"
      >
        <UiScrambleText :text="t('projects.viewAll')" effect="link" />
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3.5 h-3.5" />
      </a>
    </div>

    <!-- Loading skeleton: same cards, same grid, same paddings as the loaded list -->
    <ul
      v-if="status === 'pending' || status === 'idle'"
      class="grid gap-3 sm:grid-cols-2"
      aria-hidden="true"
    >
      <li
        v-for="i in 6"
        :key="i"
        class="relative flex flex-col gap-2 p-4 border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50"
      >
        <!-- Rows sized like the real ones: name 24px, two-line description 32px, footer 16px -->
        <div class="flex h-6 items-center gap-2">
          <UiSkeleton class="size-5" />
          <UiSkeleton class="h-4 w-32" />
        </div>
        <div>
          <div class="flex h-4 items-center"><UiSkeleton class="h-3 w-full" /></div>
          <div class="flex h-4 items-center"><UiSkeleton class="h-3 w-2/3" /></div>
        </div>
        <div class="mt-auto flex h-4 items-center gap-4">
          <UiSkeleton class="h-3 w-16" />
          <UiSkeleton class="h-3 w-8" />
        </div>
        <UiSkeleton class="absolute inset-x-0 bottom-0 h-1" />
      </li>
    </ul>

    <!-- Pinned repositories, compact like GitHub's own pinned grid -->
    <ul v-else-if="repos.length" class="grid gap-3 sm:grid-cols-2">
      <li
        v-for="repo in repos"
        :key="repo.name"
        class="group/card relative isolate flex flex-col gap-2 overflow-hidden p-4 border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 transition-colors hover:border-primary-500/50"
      >
        <UiPixelCanvas />
        <div class="flex items-center justify-between gap-3">
          <!-- The whole card opens the repository -->
          <a
            :href="repo.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex min-w-0 items-center gap-2 font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100 hover:text-primary-500 transition-colors after:absolute after:inset-0"
          >
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
              class="size-5 shrink-0 text-neutral-500"
              aria-hidden="true"
            />
            <span class="truncate">{{ repo.name }}</span>
          </a>
          <div class="flex shrink-0 items-center gap-3 text-neutral-500">
            <a
              v-if="repo.homepage"
              :href="repo.homepage"
              target="_blank"
              rel="noopener noreferrer"
              class="relative z-10 hover:text-primary-500 transition-colors"
              :aria-label="`${t('projects.demo')} — ${repo.name}`"
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
        <div class="mt-auto flex items-center gap-4 font-mono text-xs text-neutral-500">
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
        <!-- Share of the code by language, GitHub colours, flush against the bottom border.
             No pointer events: a click there still opens the repository. -->
        <div
          v-if="repo.languages.length"
          class="pointer-events-none absolute inset-x-0 bottom-0 flex h-1 overflow-hidden bg-neutral-200 dark:bg-neutral-800"
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
    <p v-else class="flex items-center gap-3 text-sm text-neutral-500">
      <UiMascot mood="sad" :size="40" />
      {{ t('github.error') }}
    </p>
  </div>
</template>
