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
    logo: e.logo,
    detail: t(`experiences.${e.key}.role`),
  })),
  ...STUDIES.map((s) => ({
    id: s.id,
    years: `${s.startDate.slice(0, 4)}–${s.endDate?.slice(0, 4) ?? ''}`,
    name: s.school,
    logo: s.logo,
    detail: `${s.level} · ${t(`studies.${s.key}.degree`)}`,
  })),
])
</script>

<template>
  <div>
    <p class="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
      {{ t('experiencePage.teaser') }}
    </p>
    <ul class="mt-4 divide-y divide-dashed divide-neutral-200 dark:divide-neutral-800">
      <li v-for="row in rows" :key="row.id">
        <NuxtLink
          :to="`/experience#${row.id}`"
          class="group relative isolate -mx-3 flex items-center gap-6 overflow-hidden px-3 py-3 transition-colors"
        >
          <UiPixelCanvas />
          <span class="eyebrow w-24 shrink-0">{{ row.years }}</span>
          <NuxtImg
            :src="row.logo"
            alt=""
            width="28"
            height="28"
            class="size-7 shrink-0 rounded-lg object-cover ring-1 ring-(--card-border)"
          />
          <span
            class="min-w-0 truncate text-sm text-neutral-900 group-hover:text-primary-500 dark:text-neutral-100"
          >
            {{ row.name }}
          </span>
          <span class="ml-auto hidden truncate text-xs text-neutral-500 sm:block">
            {{ row.detail }}
          </span>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
