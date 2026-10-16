<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

// Grouped like safzan.dev's stack: a category, then its tools. Tool names are not translated.
const stack = [
  {
    key: 'languages',
    tools: [
      ['TypeScript', 'i-simple-icons-typescript'],
      ['PHP', 'i-simple-icons-php'],
      ['Rust', 'i-simple-icons-rust'],
      ['Go', 'i-simple-icons-go'],
    ],
  },
  {
    key: 'frontend',
    tools: [
      ['Vue', 'i-simple-icons-vuedotjs'],
      ['Nuxt', 'i-simple-icons-nuxt'],
      ['Tailwind CSS', 'i-simple-icons-tailwindcss'],
      ['Astro', 'i-simple-icons-astro'],
    ],
  },
  {
    key: 'backend',
    tools: [
      ['Laravel', 'i-simple-icons-laravel'],
      ['Bun', 'i-simple-icons-bun'],
      ['Node.js', 'i-simple-icons-nodedotjs'],
    ],
  },
  {
    key: 'infrastructure',
    tools: [
      ['Docker', 'i-simple-icons-docker'],
      ['GitHub Actions', 'i-simple-icons-githubactions'],
      ['AWS', 'i-simple-icons-amazonwebservices'],
      ['Cloudflare', 'i-simple-icons-cloudflare'],
      ['Linux', 'i-simple-icons-linux'],
    ],
  },
  {
    key: 'workflow',
    tools: [
      ['Git', 'i-simple-icons-git'],
      ['Neovim', 'i-simple-icons-neovim'],
      ['Zed', 'i-simple-icons-zedindustries'],
      ['Ghostty', 'i-simple-icons-ghostty'],
      ['tmux', 'i-simple-icons-tmux'],
      ['Claude Code', 'i-simple-icons-claude'],
    ],
  },
] as const
</script>

<template>
  <UiAnimatedSection animation="fadeInUp">
    <div class="space-y-6">
      <!-- Section Header -->
      <div class="space-y-1">
        <span class="text-[11px] font-mono uppercase tracking-widest text-primary-500">
          {{ t('skills.featured') }}
        </span>
        <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-100">
          {{ t('skills.title') }}
        </h2>
      </div>

      <dl class="space-y-4">
        <div
          v-for="group in stack"
          :key="group.key"
          class="grid gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4"
        >
          <dt class="text-sm text-neutral-500 dark:text-neutral-400">
            {{ t(`skills.stack.${group.key}`) }}
          </dt>
          <dd class="flex flex-wrap gap-x-5 gap-y-2.5">
            <span
              v-for="[name, icon] in group.tools"
              :key="name"
              class="inline-flex items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200"
            >
              <UIcon
                :name="icon"
                class="size-4 shrink-0 text-neutral-500 dark:text-neutral-400"
                aria-hidden="true"
              />
              {{ name }}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  </UiAnimatedSection>
</template>
