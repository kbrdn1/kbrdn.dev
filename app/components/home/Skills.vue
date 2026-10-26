<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

// Grouped like safzan.dev's stack: a category, then its tools, each linking to its official
// site. Tool names are not translated.
const stack = [
  {
    key: 'languages',
    tools: [
      ['TypeScript', 'i-simple-icons-typescript', 'https://www.typescriptlang.org'],
      ['PHP', 'i-simple-icons-php', 'https://www.php.net'],
      ['Rust', 'i-simple-icons-rust', 'https://www.rust-lang.org'],
      ['Go', 'i-simple-icons-go', 'https://go.dev'],
    ],
  },
  {
    key: 'frontend',
    tools: [
      ['Vue', 'i-simple-icons-vuedotjs', 'https://vuejs.org'],
      ['Nuxt', 'i-simple-icons-nuxt', 'https://nuxt.com'],
      ['Tailwind CSS', 'i-simple-icons-tailwindcss', 'https://tailwindcss.com'],
      ['Astro', 'i-simple-icons-astro', 'https://astro.build'],
    ],
  },
  {
    key: 'backend',
    tools: [
      ['Laravel', 'i-simple-icons-laravel', 'https://laravel.com'],
      ['Bun', 'i-simple-icons-bun', 'https://bun.sh'],
      ['Node.js', 'i-simple-icons-nodedotjs', 'https://nodejs.org'],
    ],
  },
  {
    key: 'infrastructure',
    tools: [
      ['Docker', 'i-simple-icons-docker', 'https://www.docker.com'],
      ['GitHub Actions', 'i-simple-icons-githubactions', 'https://github.com/features/actions'],
      ['AWS', 'i-simple-icons-amazonwebservices', 'https://aws.amazon.com'],
      ['Cloudflare', 'i-simple-icons-cloudflare', 'https://www.cloudflare.com'],
      ['Linux', 'i-simple-icons-linux', 'https://www.kernel.org'],
    ],
  },
  {
    key: 'workflow',
    tools: [
      ['Git', 'i-simple-icons-git', 'https://git-scm.com'],
      ['Neovim', 'i-simple-icons-neovim', 'https://neovim.io'],
      ['Zed', 'i-simple-icons-zedindustries', 'https://zed.dev'],
      ['Ghostty', 'i-simple-icons-ghostty', 'https://ghostty.org'],
      ['tmux', 'i-simple-icons-tmux', 'https://github.com/tmux/tmux'],
      ['Herdr', 'i-kbrdn-herdr', 'https://herdr.dev'],
      ['Claude Code', 'i-simple-icons-claude', 'https://www.anthropic.com/claude-code'],
    ],
  },
] as const
</script>

<template>
  <UiAnimatedSection animation="fadeInUp">
    <div class="space-y-6">
      <dl class="divide-y divide-dashed divide-neutral-200 dark:divide-neutral-800">
        <div
          v-for="group in stack"
          :key="group.key"
          class="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-4"
        >
          <dt class="eyebrow pt-0.5">
            {{ t(`skills.stack.${group.key}`) }}
          </dt>
          <dd class="flex flex-wrap gap-x-5 gap-y-2.5">
            <a
              v-for="[name, icon, url] in group.tools"
              :key="name"
              :href="url"
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex items-center gap-2 text-sm text-neutral-800 dark:text-neutral-200 transition-colors hover:text-primary-500"
            >
              <UIcon
                :name="icon"
                class="size-4 shrink-0 text-neutral-500 dark:text-neutral-400 transition-colors group-hover:text-primary-500"
                aria-hidden="true"
              />
              {{ name }}
            </a>
          </dd>
        </div>
      </dl>
    </div>
  </UiAnimatedSection>
</template>
