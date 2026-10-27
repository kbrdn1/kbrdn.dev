<script setup lang="ts">
// /experience: the career laid out like isrod.eu/fr/experience (intro, a strip of every
// role and degree, one spread each), then the open source work, all from checked facts
// (app/utils/career.ts and the experiences.* / studies.* texts).
import { useI18n } from '#imports'

const { t, locale } = useI18n()

useSeoMeta({
  title: () => t('experiencePage.seoTitle'),
  description: () => t('experiencePage.seoDescription'),
  ogTitle: () => t('experiencePage.seoTitle'),
  ogDescription: () => t('experiencePage.seoDescription'),
  twitterCard: 'summary_large_image',
})

if (import.meta.server) {
  defineOgImage('Default', {
    title: t('experiencePage.ogTitle'),
    subtitle: t('experiencePage.ogSubtitle'),
    statusText: t('hero.availableForHire'),
    avatarUrl: `${useRequestURL().origin}/images/avatar.png`,
  })
}

const period = (start: string, end: string | null) =>
  `${formatMonth(start, locale.value)} — ${end ? formatMonth(end, locale.value) : t('experiences.present')}`

// Every role and degree, most recent first, for the strip at the top.
const timeline = computed(() =>
  [
    ...EXPERIENCES.map((e) => ({
      id: e.id,
      start: e.startDate,
      end: e.endDate,
      name: e.company,
      logo: e.logo,
      detail: t(`experiences.${e.key}.role`),
    })),
    ...STUDIES.map((s) => ({
      id: s.id,
      start: s.startDate,
      end: s.endDate,
      name: s.school,
      logo: s.logo,
      detail: t(`studies.${s.key}.degree`),
    })),
  ].sort((a, b) => b.start.localeCompare(a.start)),
)

const list = (key: string, count: number) =>
  Array.from({ length: count }, (_, i) => t(`${key}.${i}`))

const projects = OPEN_SOURCE_PROJECTS
const contributions = UPSTREAM.filter((u) => u.kind !== 'report')
const reports = UPSTREAM.filter((u) => u.kind === 'report')

// Open source: three groups, counted in a stat card (a tick bar per group, one segment per
// item in its status colour, and a legend), listed one at a time through a segmented control
const OS_TABS = ['projectsLabel', 'upstreamLabel', 'reportsLabel'] as const
const osTab = ref<(typeof OS_TABS)[number]>('projectsLabel')
const osGroups = [
  { key: 'projectsLabel', statuses: projects.map((p) => p.status) },
  { key: 'upstreamLabel', statuses: contributions.map((c) => c.kind) },
  { key: 'reportsLabel', statuses: reports.map((r) => r.kind) },
] as const
const tally = (statuses: readonly string[]) =>
  [...new Set(statuses)].map((s) => [s, statuses.filter((x) => x === s).length] as const)

function switchOsTab(delta: number) {
  const next = OS_TABS[(OS_TABS.indexOf(osTab.value) + delta + OS_TABS.length) % OS_TABS.length]!
  osTab.value = next
  document.getElementById(`os-tab-${next}`)?.focus()
}

const UPSTREAM_ICON: Record<string, string> = {
  merged: 'i-lucide-git-merge',
  review: 'i-lucide-git-pull-request',
  report: 'i-lucide-circle-dot',
}

const STATUS_BAR: Record<string, string> = {
  released: 'bg-green-600 dark:bg-green-500',
  merged: 'bg-green-600 dark:bg-green-500',
  inDevelopment: 'bg-primary-500',
  review: 'bg-primary-500',
  archived: 'bg-neutral-400 dark:bg-neutral-600',
  report: 'bg-sky-500',
}

// Status tag colours: the tag tints itself from its text colour
const STATUS_CLASS: Record<string, string> = {
  released: 'text-green-700 dark:text-green-500',
  merged: 'text-green-700 dark:text-green-500',
  inDevelopment: 'text-primary-500',
  review: 'text-primary-500',
  archived: 'text-neutral-500',
  report: 'text-sky-500',
}
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-20 sm:px-6">
    <!-- Intro, open on the page like the home's hero -->
    <section class="py-4 sm:py-8">
      <p class="eyebrow">{{ t('experiencePage.eyebrow') }}</p>
      <h1
        class="mt-4 max-w-3xl text-5xl tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-100"
        :aria-label="t('experiencePage.title')"
      >
        <UiScrambleText :text="t('experiencePage.title')" />
      </h1>
      <p class="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ t('experiencePage.intro') }}
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href="#open-source" class="btn btn-primary">
          {{ t('experiencePage.ctaOpenSource') }}
        </a>
        <NuxtLink to="/blog" class="btn btn-outline">
          <UiScrambleText :text="t('experiencePage.ctaBlog')" effect="link" />
          <UIcon name="i-heroicons-arrow-right-20-solid" class="size-4" aria-hidden="true" />
        </NuxtLink>
      </div>
    </section>

    <!-- Strip: every role and degree, one small card each -->
    <UiPanel :title="t('experiencePage.timeline')">
      <nav :aria-label="t('experiencePage.timeline')" class="overflow-x-auto">
        <ol class="flex min-w-max gap-1">
          <li v-for="(item, i) in timeline" :key="item.id">
            <a
              :href="`#${item.id}`"
              class="panel-card group block w-60 p-4 transition-colors hover:border-primary-500/50"
            >
              <span class="eyebrow block">
                {{ String(i + 1).padStart(2, '0') }} · {{ item.start.slice(0, 4) }}–{{
                  item.end ? item.end.slice(0, 4) : ''
                }}
              </span>
              <span class="mt-3 flex items-center gap-3">
                <NuxtImg
                  :src="item.logo"
                  alt=""
                  width="32"
                  height="32"
                  class="size-8 shrink-0 rounded-lg object-cover ring-1 ring-(--card-border)"
                />
                <span class="min-w-0">
                  <span
                    class="block truncate text-sm text-neutral-900 group-hover:text-primary-500 dark:text-neutral-100"
                  >
                    {{ item.name }}
                  </span>
                  <span class="block truncate text-xs text-neutral-500">{{ item.detail }}</span>
                </span>
              </span>
            </a>
          </li>
        </ol>
      </nav>
    </UiPanel>

    <!-- Experience -->
    <section id="experience" aria-labelledby="experience-heading" class="scroll-mt-28">
      <UiPanel>
        <h2
          id="experience-heading"
          class="flex min-h-12 items-center px-4 text-[17px] text-neutral-900 dark:text-neutral-100"
        >
          <UiScrambleText :text="t('experiencePage.experienceLabel')" />
        </h2>
        <div class="space-y-1">
          <ExperienceSpread
            v-for="(exp, i) in EXPERIENCES"
            :id="exp.id"
            :key="exp.id"
            :index="i + 1"
            :title="exp.company"
            :logo="exp.logo"
            :meta="`${period(exp.startDate, exp.endDate)} · ${t(`experiences.${exp.key}.role`)} · ${t(`experiences.${exp.key}.type`)}`"
            :summary="t(`experiencePage.summaries.${exp.key}`)"
            :stack="exp.technologies"
            :items-label="t('experiencePage.missions')"
            :items="list(`experiences.${exp.key}.tasks`, exp.tasksCount)"
          />
        </div>
      </UiPanel>
    </section>

    <!-- Education -->
    <section id="education" aria-labelledby="education-heading" class="scroll-mt-28">
      <UiPanel>
        <h2
          id="education-heading"
          class="flex min-h-12 items-center px-4 text-[17px] text-neutral-900 dark:text-neutral-100"
        >
          <UiScrambleText :text="t('experiencePage.educationLabel')" />
        </h2>
        <div class="space-y-1">
          <ExperienceSpread
            v-for="(study, i) in STUDIES"
            :id="study.id"
            :key="study.id"
            :index="i + 1"
            :title="study.school"
            :logo="study.logo"
            :meta="`${period(study.startDate, study.endDate)} · ${study.level} · ${t(`studies.${study.key}.degree`)}`"
            :summary="t(`experiencePage.summaries.${study.key}`)"
            :stack="study.technologies"
            :items-label="t('experiencePage.skills')"
            :items="list(`studies.${study.key}.skills`, study.skillsCount)"
          />
        </div>
      </UiPanel>
    </section>

    <!-- Open source -->
    <section id="open-source" aria-labelledby="open-source-heading" class="scroll-mt-28">
      <UiPanel>
        <div class="flex min-h-12 items-center px-4 py-2">
          <h2 id="open-source-heading" class="text-[17px] text-neutral-900 dark:text-neutral-100">
            <UiScrambleText :text="t('experiencePage.openSource.title')" />
          </h2>
        </div>

        <!-- The numbers, after disarto's occupancy card -->
        <div class="panel-card p-5 sm:p-6">
          <p class="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {{ t('experiencePage.openSource.intro') }}
          </p>
          <div
            class="mt-6 grid gap-6 border-t border-dashed border-(--card-border) pt-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-dashed sm:divide-(--card-border)"
          >
            <div
              v-for="group in osGroups"
              :key="group.key"
              class="sm:px-5 sm:first:pl-0 sm:last:pr-0"
            >
              <p class="eyebrow">{{ t(`experiencePage.openSource.${group.key}`) }}</p>
              <p class="mt-1 text-4xl tracking-tight text-neutral-900 dark:text-neutral-100">
                {{ group.statuses.length }}
              </p>
              <div class="mt-3 flex h-3 gap-1" aria-hidden="true">
                <span
                  v-for="(status, i) in group.statuses"
                  :key="i"
                  :class="cn('ticks h-full flex-1', STATUS_BAR[status])"
                />
              </div>
              <ul class="mt-3 space-y-1">
                <li
                  v-for="[status, count] in tally(group.statuses)"
                  :key="status"
                  class="eyebrow flex items-center gap-2"
                >
                  <span
                    :class="cn('size-1.5 rounded-full', STATUS_BAR[status])"
                    aria-hidden="true"
                  />
                  {{ t(`experiencePage.openSource.status.${status}`) }}:
                  <span class="text-neutral-900 dark:text-neutral-100">{{ count }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- The lists, one at a time, after disarto's ground station rows -->
        <div class="panel-card mt-1 p-2 sm:p-3">
          <div class="segmented flex w-full" role="tablist" aria-label="Open source">
            <button
              v-for="tab in OS_TABS"
              :id="`os-tab-${tab}`"
              :key="tab"
              type="button"
              role="tab"
              class="segment flex-1"
              :aria-selected="osTab === tab"
              :aria-controls="`os-panel-${tab}`"
              :tabindex="osTab === tab ? 0 : -1"
              @click="osTab = tab"
              @keydown.right.prevent="switchOsTab(1)"
              @keydown.left.prevent="switchOsTab(-1)"
            >
              {{ t(`experiencePage.openSource.${tab}`) }}
            </button>
          </div>

          <ul
            v-show="osTab === 'projectsLabel'"
            id="os-panel-projectsLabel"
            role="tabpanel"
            aria-labelledby="os-tab-projectsLabel"
            class="mt-2 divide-y divide-dashed divide-(--card-border)"
          >
            <li
              v-for="(project, i) in projects"
              :key="project.key"
              class="row relative isolate flex items-start gap-4 overflow-hidden p-3"
            >
              <UiPixelCanvas />
              <span class="icon-box size-10">
                <UIcon
                  :name="LANGUAGE_ICONS[project.language] ?? 'i-lucide-book-marked'"
                  class="size-5 text-neutral-500"
                  aria-hidden="true"
                />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 class="text-[15px] text-neutral-900 dark:text-neutral-100">
                    {{ project.name }}
                  </h3>
                  <span :class="cn('tag', STATUS_CLASS[project.status])">
                    {{ t(`experiencePage.openSource.status.${project.status}`) }}
                  </span>
                </div>
                <p class="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {{ t(`experiencePage.openSource.projects.${project.key}`) }}
                </p>
                <p class="eyebrow mt-2 leading-relaxed">
                  {{ t('experiencePage.openSource.lot') }} {{ String(i + 1).padStart(2, '0') }} ·
                  {{ project.language
                  }}<template v-if="'channels' in project">
                    · {{ project.channels.join(' · ') }}</template
                  >
                </p>
              </div>
              <div class="relative z-10 flex shrink-0 items-center">
                <a
                  v-if="'site' in project"
                  :href="project.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="icon-btn"
                  :aria-label="`${t('experiencePage.openSource.site')} — ${project.name}`"
                >
                  <UIcon
                    name="i-heroicons-arrow-up-right-20-solid"
                    class="size-4"
                    aria-hidden="true"
                  />
                </a>
                <a
                  :href="project.repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="icon-btn"
                  :aria-label="`${t('experiencePage.openSource.repo')} — ${project.name}`"
                >
                  <UIcon name="i-simple-icons-github" class="size-4" aria-hidden="true" />
                </a>
              </div>
            </li>
          </ul>

          <ul
            v-for="group in [
              { key: 'upstreamLabel', items: contributions },
              { key: 'reportsLabel', items: reports },
            ]"
            v-show="osTab === group.key"
            :id="`os-panel-${group.key}`"
            :key="group.key"
            role="tabpanel"
            :aria-labelledby="`os-tab-${group.key}`"
            class="mt-2 divide-y divide-dashed divide-(--card-border)"
          >
            <li v-for="item in group.items" :key="item.key">
              <a
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                class="row group flex items-center gap-4 p-3"
              >
                <span class="icon-box size-10">
                  <UIcon
                    :name="UPSTREAM_ICON[item.kind]!"
                    class="size-4 text-neutral-500"
                    aria-hidden="true"
                  />
                </span>
                <span class="min-w-0 flex-1">
                  <span
                    class="block font-mono text-xs text-neutral-900 group-hover:text-primary-500 dark:text-neutral-100"
                  >
                    {{ item.repo }}
                  </span>
                  <span class="mt-0.5 block text-sm text-neutral-600 dark:text-neutral-400">
                    {{ t(`experiencePage.openSource.upstream.${item.key}`) }}
                  </span>
                </span>
                <span :class="cn('tag shrink-0', STATUS_CLASS[item.kind])">
                  {{ t(`experiencePage.openSource.status.${item.kind}`) }}
                </span>
                <UIcon
                  name="i-heroicons-arrow-up-right-20-solid"
                  class="size-4 shrink-0 text-neutral-500 group-hover:text-primary-500"
                  aria-hidden="true"
                />
              </a>
            </li>
          </ul>
        </div>

        <template #meta>github.com/kbrdn1</template>
        <template #footer>
          <a
            href="https://github.com/kbrdn1"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline btn-sm"
          >
            <UIcon name="i-simple-icons-github" class="size-4" aria-hidden="true" />
            <UiScrambleText :text="t('experiencePage.openSource.viewAll')" effect="link" />
          </a>
        </template>
      </UiPanel>
    </section>

    <!-- Availability -->
    <UiPanel>
      <div class="panel-card flex items-center gap-5 p-6 sm:p-8">
        <UiMascot mood="hoodie-cool" :size="72" />
        <div>
          <span class="tag text-green-700 dark:text-green-500">
            <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
            {{ t('hero.availableForHire') }}
          </span>
          <p class="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            {{ t('experiencePage.availability') }}
          </p>
        </div>
      </div>
      <template #meta>{{ t('footer.location.city') }}</template>
      <template #footer>
        <a href="mailto:hello@kbrdn.dev" class="btn btn-primary btn-sm">
          <UIcon name="i-heroicons-envelope" class="size-4" aria-hidden="true" />
          hello@kbrdn.dev
        </a>
      </template>
    </UiPanel>
  </div>
</template>
