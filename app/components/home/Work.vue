<script setup lang="ts">
// The home's featured projects, Pro tab: what Kylian built at Jewely x Flippad, the projects
// of /experience (app/utils/career.ts), in the same cards as the pinned repositories (Perso):
// the product's logo and the name, the public site, the summary, one mono line (its
// frameworks, client, years), and the share of its code by language. The card leads to the
// project on /experience. An odd count leaves a hole beside the last card: a hatched card
// fills it, the next project, maybe the reader's.
import { useI18n } from '#imports'

const { t } = useI18n()
</script>

<template>
  <ul class="grid gap-1 sm:grid-cols-2">
    <li
      v-for="project in PROJECTS"
      :key="project.id"
      class="panel-card group/card relative isolate flex flex-col gap-2 overflow-hidden p-4 transition-colors hover:border-primary-500/50"
    >
      <UiPixelCanvas />
      <div class="flex items-center justify-between gap-3">
        <!-- The whole card opens the project on /experience -->
        <NuxtLinkLocale
          :to="{ name: 'experience', hash: `#${project.id}` }"
          class="flex min-w-0 items-center gap-3 text-[15px] text-neutral-900 transition-colors after:absolute after:inset-0 hover:text-primary-500 dark:text-neutral-100"
        >
          <span class="icon-box size-8 overflow-hidden">
            <NuxtImg
              v-if="project.logo"
              :src="project.logo"
              alt=""
              width="32"
              height="32"
              class="size-full object-cover"
            />
            <UIcon
              v-else
              name="i-lucide-briefcase"
              class="size-4 shrink-0 text-neutral-500"
              aria-hidden="true"
            />
          </span>
          <span class="truncate">{{ project.name }}</span>
        </NuxtLinkLocale>
        <div class="flex shrink-0 items-center gap-3 text-neutral-500">
          <a
            v-if="project.site"
            :href="project.site"
            target="_blank"
            rel="noopener noreferrer"
            class="relative z-10 transition-colors hover:text-primary-500"
            :aria-label="`${t(`experiencePage.work.${project.key}.site`)}: ${project.name}`"
          >
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="size-4" aria-hidden="true" />
          </a>
          <!-- The whole card is the link to /experience: this mark only says so -->
          <UIcon
            name="i-lucide-briefcase"
            class="size-4 transition-colors group-hover/card:text-primary-500"
            aria-hidden="true"
          />
        </div>
      </div>
      <p class="line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
        {{ t(`experiencePage.work.${project.key}.summary`) }}
      </p>
      <div
        class="mt-auto flex items-center gap-4 font-mono text-xs text-neutral-500 dark:text-neutral-400"
      >
        <!-- Two frameworks and the years leave little room on a phone: both names shrink -->
        <span class="inline-flex min-w-0 items-center gap-1.5">
          <span
            class="size-2.5 shrink-0"
            :style="{
              backgroundColor:
                FRAMEWORK_COLORS[project.stack[0]!.split(' ')[0]!] ??
                project.languages[0]?.color ??
                undefined,
            }"
            aria-hidden="true"
          />
          <span class="truncate">{{ project.stack.join(' · ') }}</span>
        </span>
        <span class="inline-flex min-w-0 items-center gap-1">
          <UIcon name="i-lucide-building-2" class="size-3.5 shrink-0" aria-hidden="true" />
          <span class="truncate">{{ t(`experiencePage.work.${project.key}.client`) }}</span>
        </span>
        <span class="ml-auto inline-flex shrink-0 items-center gap-1 tabular-nums">
          <UIcon name="i-lucide-calendar" class="size-3.5" aria-hidden="true" />
          {{ yearSpan(project.startDate, project.endDate) }}
        </span>
      </div>
      <UiLanguageBar :languages="project.languages" />
    </li>
    <li
      v-if="PROJECTS.length % 2"
      class="panel-card hatched relative hidden flex-col items-center justify-center gap-2 p-6 text-center sm:flex"
    >
      <p class="eyebrow">{{ t('projects.next.eyebrow') }}</p>
      <NuxtLinkLocale
        to="/contact"
        class="text-sm text-neutral-600 underline-offset-4 after:absolute after:inset-0 hover:text-(--accent-text) hover:underline dark:text-neutral-400"
      >
        {{ t('projects.next.text') }} <span aria-hidden="true">→</span>
      </NuxtLinkLocale>
    </li>
  </ul>
</template>
