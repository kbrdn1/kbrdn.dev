<script setup lang="ts">
// The home's Parcours section, a short teaser of /experience: its timeline in one line per
// stop (a role and, under it, its projects; then the degrees), the same points on the same
// rail. The full story and the open source work live on /experience; the figures sit in the
// home's About.
import { useI18n } from '#imports'

const { t } = useI18n()

interface Row {
  id: string
  kind: 'role' | 'project' | 'degree'
  years: string
  name: string
  logo?: string
  detail: string
}

// The client, unless it is the product itself (Assmat Facile): then the role says more
const projectDetail = (p: (typeof PROJECTS)[number]) => {
  const client = t(`experiencePage.work.${p.key}.client`)
  return client === p.name ? t(`experiencePage.work.${p.key}.role`) : client
}

const rows = computed<Row[]>(() => [
  ...EXPERIENCES.flatMap((e): Row[] => [
    {
      id: e.id,
      kind: 'role',
      years: yearSpan(e.startDate, e.endDate),
      name: e.company,
      logo: e.logo,
      detail: t(`experiences.${e.key}.role`),
    },
    ...PROJECTS.filter((p) => p.parent === e.id).map((p): Row => ({
      id: p.id,
      kind: 'project',
      years: yearSpan(p.startDate, p.endDate),
      name: p.name,
      detail: projectDetail(p),
    })),
  ]),
  ...STUDIES.map((s): Row => ({
    id: s.id,
    kind: 'degree',
    years: yearSpan(s.startDate, s.endDate),
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

    <!-- The rail runs behind the points, as on /experience -->
    <div class="relative mt-3">
      <span
        class="absolute top-4 bottom-4 left-[7.375rem] hidden w-px -translate-x-1/2 bg-(--card-border) sm:block"
        aria-hidden="true"
      />
      <ol>
        <li v-for="row in rows" :key="row.id">
          <NuxtLink
            :to="`/experience#${row.id}`"
            class="group relative isolate -mx-3 flex items-center gap-4 overflow-hidden px-3 py-2.5 transition-colors"
          >
            <UiPixelCanvas />
            <span class="eyebrow hidden w-24 shrink-0 tabular-nums sm:block">{{ row.years }}</span>
            <span class="hidden w-3 shrink-0 justify-center sm:flex" aria-hidden="true">
              <span
                :class="
                  cn(
                    'shrink-0',
                    row.kind === 'role' && 'size-3 rounded-full bg-primary-500',
                    row.kind === 'project' &&
                      'size-2 rounded-full border border-primary-500 bg-(--card-bg)',
                    row.kind === 'degree' &&
                      'size-2.5 rotate-45 border border-(--label) bg-(--card-bg)',
                  )
                "
              />
            </span>
            <NuxtImg
              v-if="row.logo"
              :src="row.logo"
              alt=""
              width="28"
              height="28"
              class="size-7 shrink-0 rounded-lg object-cover ring-1 ring-(--card-border)"
            />
            <span v-else class="w-7 shrink-0 text-center text-sm text-(--label)" aria-hidden="true">
              ↳
            </span>
            <span class="min-w-0">
              <span
                :class="
                  cn(
                    'block truncate text-neutral-900 group-hover:text-primary-500 dark:text-neutral-100',
                    row.kind === 'project' ? 'text-[13px]' : 'text-sm',
                  )
                "
              >
                {{ row.name }}
              </span>
              <span class="eyebrow block truncate sm:hidden">{{ row.years }}</span>
            </span>
            <span
              class="ml-auto hidden truncate text-xs text-neutral-500 md:block dark:text-neutral-400"
            >
              {{ row.detail }}
            </span>
          </NuxtLink>
        </li>
      </ol>
    </div>
  </div>
</template>
