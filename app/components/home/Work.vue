<script setup lang="ts">
// The home's featured projects, Pro tab: what Kylian built at Jewely x Flippad, the projects
// of /experience (app/utils/career.ts), one card each like the pinned repositories, the card
// leading to the project on /experience. An odd count leaves a hole beside the last card: a
// hatched card fills it, the next project, maybe the reader's.
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
      <div class="flex items-center gap-3">
        <NuxtImg
          v-if="project.image"
          :src="project.image"
          alt=""
          width="64"
          height="40"
          class="h-8 w-12 shrink-0 rounded-[0.5rem] object-cover ring-1 ring-(--card-border)"
        />
        <!-- The whole card opens the project on /experience -->
        <NuxtLink
          :to="`/experience#${project.id}`"
          class="min-w-0 text-[15px] text-neutral-900 transition-colors after:absolute after:inset-0 hover:text-primary-500 dark:text-neutral-100"
        >
          <span class="block truncate">{{ project.name }}</span>
          <span class="eyebrow block truncate">
            {{ t(`experiencePage.work.${project.key}.client`) }}
          </span>
        </NuxtLink>
        <span class="eyebrow ml-auto shrink-0 tabular-nums">
          {{ yearSpan(project.startDate, project.endDate) }}
        </span>
      </div>
      <p class="line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
        {{ t(`experiencePage.work.${project.key}.summary`) }}
      </p>
      <ul class="mt-auto flex flex-wrap gap-1.5" :aria-label="t('experiencePage.stack')">
        <li
          v-for="tool in project.technologies.slice(0, 4)"
          :key="tool"
          class="inline-flex h-5 items-center rounded-full border border-(--control-border) px-2 font-mono text-[10px] text-neutral-600 dark:text-neutral-400"
        >
          {{ tool }}
        </li>
      </ul>
    </li>
    <li
      v-if="PROJECTS.length % 2"
      class="panel-card hatched relative hidden flex-col items-center justify-center gap-2 p-6 text-center sm:flex"
    >
      <p class="eyebrow">{{ t('projects.next.eyebrow') }}</p>
      <NuxtLink
        to="/contact"
        class="text-sm text-neutral-600 underline-offset-4 after:absolute after:inset-0 hover:text-(--accent-text) hover:underline dark:text-neutral-400"
      >
        {{ t('projects.next.text') }} →
      </NuxtLink>
    </li>
  </ul>
</template>
