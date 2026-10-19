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
      detail: t(`experiences.${e.key}.role`),
    })),
    ...STUDIES.map((s) => ({
      id: s.id,
      start: s.startDate,
      end: s.endDate,
      name: s.school,
      detail: t(`studies.${s.key}.degree`),
    })),
  ].sort((a, b) => b.start.localeCompare(a.start)),
)

const list = (key: string, count: number) =>
  Array.from({ length: count }, (_, i) => t(`${key}.${i}`))

const projects = OPEN_SOURCE_PROJECTS
const contributions = UPSTREAM.filter((u) => u.kind !== 'report')
const reports = UPSTREAM.filter((u) => u.kind === 'report')

const STATUS_CLASS: Record<string, string> = {
  released:
    'text-green-700 dark:text-green-500 border-green-600/40 dark:border-green-500/30 bg-green-600/5 dark:bg-green-500/5',
  merged:
    'text-green-700 dark:text-green-500 border-green-600/40 dark:border-green-500/30 bg-green-600/5 dark:bg-green-500/5',
  inDevelopment: 'text-primary-500 border-primary-500/40 bg-primary-500/5',
  review: 'text-primary-500 border-primary-500/40 bg-primary-500/5',
  archived: 'text-neutral-500 border-neutral-300 dark:border-neutral-700 bg-neutral-500/5',
  report: 'text-sky-500 border-sky-500/40 bg-sky-500/5',
}
</script>

<template>
  <div class="mx-auto w-full max-w-5xl px-6 pb-20">
    <!-- Intro -->
    <section class="pt-14 pb-10">
      <p class="font-mono text-[11px] uppercase tracking-widest text-primary-500">
        {{ t('experiencePage.eyebrow') }}
      </p>
      <h1
        class="mt-4 max-w-3xl text-4xl font-bold leading-tight text-neutral-900 sm:text-5xl dark:text-neutral-100"
        :aria-label="t('experiencePage.title')"
      >
        <UiScrambleText :text="t('experiencePage.title')" />
      </h1>
      <p class="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ t('experiencePage.intro') }}
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a
          href="#open-source"
          class="inline-flex items-center gap-2 bg-primary-500 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-primary-600"
        >
          {{ t('experiencePage.ctaOpenSource') }}
        </a>
        <NuxtLink
          to="/blog"
          class="inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider text-sky-500 transition-colors hover:text-sky-400"
        >
          <UiScrambleText :text="t('experiencePage.ctaBlog')" effect="link" /> →
        </NuxtLink>
      </div>
    </section>

    <!-- Strip: every role and degree -->
    <nav
      :aria-label="t('experiencePage.timeline')"
      class="-mx-6 overflow-x-auto border-y border-neutral-200 px-6 dark:border-neutral-800"
    >
      <ol class="flex min-w-max divide-x divide-neutral-200 dark:divide-neutral-800">
        <li v-for="(item, i) in timeline" :key="item.id">
          <a
            :href="`#${item.id}`"
            class="group block w-48 px-4 py-4 transition-colors hover:bg-primary-500/5"
          >
            <span class="block font-mono text-[10px] tracking-widest text-neutral-500">
              {{ String(i + 1).padStart(2, '0') }} · {{ item.start.slice(0, 4) }}–{{
                item.end ? item.end.slice(0, 4) : ''
              }}
            </span>
            <span
              class="mt-1 block truncate text-sm font-medium text-neutral-900 group-hover:text-primary-500 dark:text-neutral-100"
            >
              {{ item.name }}
            </span>
            <span class="block truncate text-xs text-neutral-500">{{ item.detail }}</span>
          </a>
        </li>
      </ol>
    </nav>

    <!-- Experience -->
    <section id="experience" aria-labelledby="experience-heading" class="scroll-mt-24 pt-14">
      <h2
        id="experience-heading"
        class="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500"
      >
        <UiScrambleText :text="t('experiencePage.experienceLabel')" />
      </h2>
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
    </section>

    <!-- Education -->
    <section id="education" aria-labelledby="education-heading" class="scroll-mt-24 pt-14">
      <h2
        id="education-heading"
        class="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500"
      >
        <UiScrambleText :text="t('experiencePage.educationLabel')" />
      </h2>
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
    </section>

    <!-- Open source -->
    <section id="open-source" aria-labelledby="open-source-heading" class="scroll-mt-24 pt-20">
      <p class="font-mono text-[11px] uppercase tracking-widest text-primary-500">
        {{ t('experiencePage.openSource.eyebrow') }}
      </p>
      <h2
        id="open-source-heading"
        class="mt-3 max-w-2xl text-3xl font-semibold text-neutral-900 dark:text-neutral-100"
      >
        <UiScrambleText :text="t('experiencePage.openSource.title')" />
      </h2>
      <p class="mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ t('experiencePage.openSource.intro') }}
      </p>

      <h3 class="mt-10 font-mono text-[11px] uppercase tracking-widest text-neutral-500">
        {{ t('experiencePage.openSource.projectsLabel') }}
      </h3>
      <ul class="mt-4 grid gap-3 sm:grid-cols-2">
        <li
          v-for="(project, i) in projects"
          :key="project.key"
          class="relative isolate flex flex-col gap-3 overflow-hidden border border-neutral-200 bg-white/50 p-5 transition-colors hover:border-primary-500/50 dark:border-neutral-800 dark:bg-neutral-950/50"
        >
          <UiPixelCanvas />
          <div class="flex items-center justify-between gap-3">
            <span class="font-mono text-[10px] tracking-widest text-neutral-500">
              {{ t('experiencePage.openSource.lot') }} {{ String(i + 1).padStart(2, '0') }} ·
              {{ project.language }}
            </span>
            <span
              :class="
                cn(
                  'border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider',
                  STATUS_CLASS[project.status],
                )
              "
            >
              {{ t(`experiencePage.openSource.status.${project.status}`) }}
            </span>
          </div>
          <h4 class="font-mono text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {{ project.name }}
          </h4>
          <p class="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {{ t(`experiencePage.openSource.projects.${project.key}`) }}
          </p>
          <p
            v-if="'channels' in project"
            class="font-mono text-[11px] leading-relaxed text-neutral-500"
          >
            {{ t('experiencePage.openSource.install') }} {{ project.channels.join(' · ') }}
          </p>
          <div class="mt-auto flex gap-4 pt-1 font-mono text-xs uppercase tracking-wider">
            <a
              v-if="'site' in project"
              :href="project.site"
              target="_blank"
              rel="noopener noreferrer"
              class="relative z-10 text-primary-500 hover:text-primary-400"
            >
              <UiScrambleText :text="t('experiencePage.openSource.site')" effect="link" /> ↗
            </a>
            <a
              :href="project.repo"
              target="_blank"
              rel="noopener noreferrer"
              class="relative z-10 text-neutral-500 hover:text-primary-500"
            >
              <UiScrambleText :text="t('experiencePage.openSource.repo')" effect="link" /> ↗
            </a>
          </div>
        </li>
      </ul>

      <div class="mt-12 grid gap-10 md:grid-cols-2">
        <div
          v-for="group in [
            { key: 'upstreamLabel', items: contributions },
            { key: 'reportsLabel', items: reports },
          ]"
          :key="group.key"
        >
          <h3 class="font-mono text-[11px] uppercase tracking-widest text-neutral-500">
            {{ t(`experiencePage.openSource.${group.key}`) }}
          </h3>
          <ul class="mt-3 divide-y divide-neutral-200 dark:divide-neutral-800">
            <li v-for="item in group.items" :key="item.key">
              <a
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-start justify-between gap-4 py-3"
              >
                <span class="min-w-0">
                  <span
                    class="block font-mono text-xs text-neutral-900 group-hover:text-primary-500 dark:text-neutral-100"
                  >
                    {{ item.repo }}
                  </span>
                  <span class="mt-0.5 block text-sm text-neutral-600 dark:text-neutral-400">
                    {{ t(`experiencePage.openSource.upstream.${item.key}`) }}
                  </span>
                </span>
                <span
                  :class="
                    cn(
                      'shrink-0 border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider',
                      STATUS_CLASS[item.kind],
                    )
                  "
                >
                  {{ t(`experiencePage.openSource.status.${item.kind}`) }}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <a
        href="https://github.com/kbrdn1"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-primary-500"
      >
        <UIcon name="i-simple-icons-github" class="size-4" aria-hidden="true" />
        <UiScrambleText :text="t('experiencePage.openSource.viewAll')" effect="link" />
      </a>
    </section>

    <!-- Availability -->
    <section
      class="mt-20 flex flex-col gap-6 border border-neutral-200 p-8 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800"
    >
      <div class="flex items-center gap-5">
        <UiMascot mood="hoodie-cool" :size="72" />
        <div>
          <span
            class="inline-flex items-center gap-2 border border-green-600/40 bg-green-600/5 px-3 py-1 font-mono text-xs uppercase tracking-wider text-green-700 dark:border-green-500/30 dark:bg-green-500/5 dark:text-green-500"
          >
            <span class="size-1.5 rounded-full bg-green-600 dark:bg-green-500" aria-hidden="true" />
            {{ t('hero.availableForHire') }}
          </span>
          <p class="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            {{ t('experiencePage.availability') }}
          </p>
        </div>
      </div>
      <a
        href="mailto:hello@kbrdn.dev"
        class="inline-flex items-center justify-center gap-2 bg-primary-500 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white transition-colors hover:bg-primary-600"
      >
        hello@kbrdn.dev
      </a>
    </section>
  </div>
</template>
