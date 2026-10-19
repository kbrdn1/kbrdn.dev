<script setup lang="ts">
// The home's Parcours section, now a short teaser: one line per role and degree,
// the full story and the open source work live on /experience.
import { useI18n } from '#imports'

const { t } = useI18n()

const rows = computed(() => [
  ...EXPERIENCES.map((e) => ({
    id: e.id,
    years: `${e.startDate.slice(0, 4)}–${e.endDate?.slice(0, 4) ?? ''}`,
    name: e.company,
    detail: t(`experiences.${e.key}.role`),
  })),
  ...STUDIES.map((s) => ({
    id: s.id,
    years: `${s.startDate.slice(0, 4)}–${s.endDate?.slice(0, 4) ?? ''}`,
    name: s.school,
    detail: `${s.level} · ${t(`studies.${s.key}.degree`)}`,
  })),
])
</script>

<template>
  <div>
    <p class="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
      {{ t('experiencePage.teaser') }}
    </p>
    <ul class="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
      <li v-for="row in rows" :key="row.id">
        <NuxtLink
          :to="`/experience#${row.id}`"
          class="group relative isolate -mx-3 flex items-center gap-6 overflow-hidden px-3 py-3 transition-colors"
        >
          <UiPixelCanvas />
          <span class="w-24 shrink-0 font-mono text-xs text-neutral-500">{{ row.years }}</span>
          <span
            class="min-w-0 truncate text-sm font-medium text-neutral-900 group-hover:text-primary-500 dark:text-neutral-100"
          >
            {{ row.name }}
          </span>
          <span class="ml-auto hidden truncate text-xs text-neutral-500 sm:block">
            {{ row.detail }}
          </span>
        </NuxtLink>
      </li>
    </ul>
    <NuxtLink
      to="/experience"
      class="mt-5 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-primary-500 hover:text-primary-400"
    >
      <UiScrambleText :text="t('experiencePage.teaserCta')" effect="link" /> →
    </NuxtLink>
  </div>
</template>
