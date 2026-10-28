<script setup lang="ts">
// The open source work, shown on /experience and /activity. A card of figures (projects,
// contributions and reports: a count, a tick bar coloured by status, a legend), then the
// lists one at a time, after disarto's integrations list: a segmented control and a search
// field, rows with an icon tile, a title and mono meta, a status tag, the summary, the
// install channels as pills and the links in underlined mono.
import { useI18n } from '#imports'

const props = defineProps<{ headingId: string }>()

const { t } = useI18n()

const projects = OPEN_SOURCE_PROJECTS
const contributions = UPSTREAM.filter((u) => u.kind !== 'report')
const reports = UPSTREAM.filter((u) => u.kind === 'report')

const TABS = ['projectsLabel', 'upstreamLabel', 'reportsLabel'] as const
const tab = ref<(typeof TABS)[number]>('projectsLabel')
const groups = [
  { key: 'projectsLabel', statuses: projects.map((p) => p.status) },
  { key: 'upstreamLabel', statuses: contributions.map((c) => c.kind) },
  { key: 'reportsLabel', statuses: reports.map((r) => r.kind) },
] as const
const tally = (statuses: readonly string[]) =>
  [...new Set(statuses)].map((s) => [s, statuses.filter((x) => x === s).length] as const)

function switchTab(delta: number) {
  const next = TABS[(TABS.indexOf(tab.value) + delta + TABS.length) % TABS.length]!
  tab.value = next
  document.getElementById(`${props.headingId}-tab-${next}`)?.focus()
}

// The search narrows the active list: names, repositories and summaries
const query = ref('')
const matches = (...texts: string[]) =>
  texts.join(' ').toLowerCase().includes(query.value.trim().toLowerCase())
const shownProjects = computed(() =>
  projects.filter((p) =>
    matches(p.name, p.language, t(`experiencePage.openSource.projects.${p.key}`)),
  ),
)
const shownUpstream = computed(() =>
  (tab.value === 'reportsLabel' ? reports : contributions).filter((u) =>
    matches(u.repo, t(`experiencePage.openSource.upstream.${u.key}`)),
  ),
)
const shown = computed(() =>
  tab.value === 'projectsLabel' ? shownProjects.value.length : shownUpstream.value.length,
)
const total = computed(
  () =>
    ({ projectsLabel: projects, upstreamLabel: contributions, reportsLabel: reports })[tab.value]
      .length,
)

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
  released: 'text-green-800 dark:text-green-500',
  merged: 'text-green-800 dark:text-green-500',
  inDevelopment: 'text-primary-800 dark:text-primary-500',
  review: 'text-primary-800 dark:text-primary-500',
  archived: 'text-neutral-600 dark:text-neutral-400',
  report: 'text-sky-800 dark:text-sky-500',
}

// "PR #403295" / "ISSUE #2689", from the link: the number is not stored on its own
const reference = (url: string) =>
  `${url.includes('/pull/') ? 'PR' : 'ISSUE'} #${url.split('/').pop()}`
</script>

<template>
  <UiPanel>
    <div class="flex min-h-12 items-center px-4 py-2">
      <h2 :id="headingId" class="text-[17px] text-neutral-900 dark:text-neutral-100">
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
        <div v-for="group in groups" :key="group.key" class="sm:px-5 sm:first:pl-0 sm:last:pr-0">
          <p class="eyebrow">{{ t(`experiencePage.openSource.${group.key}`) }}</p>
          <p class="mt-1 text-4xl tracking-tight text-neutral-900 dark:text-neutral-100">
            <UiRollingNumber :value="group.statuses.length" />
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
              <span :class="cn('size-1.5 rounded-full', STATUS_BAR[status])" aria-hidden="true" />
              {{ t(`experiencePage.openSource.status.${status}`) }}:
              <span class="text-neutral-900 dark:text-neutral-100">{{ count }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- The lists, one at a time, after disarto's integrations list -->
    <div class="panel-card mt-1 p-2 sm:p-3">
      <div class="flex flex-wrap items-center gap-2 border-b border-(--card-border) pb-2 sm:pb-3">
        <div class="segmented flex min-w-0 flex-1" role="tablist" aria-label="Open source">
          <button
            v-for="key in TABS"
            :id="`${headingId}-tab-${key}`"
            :key="key"
            type="button"
            role="tab"
            class="segment h-auto min-h-7 min-w-0 flex-1 py-1 text-center leading-tight whitespace-normal"
            :aria-selected="tab === key"
            :aria-controls="`${headingId}-panel`"
            :tabindex="tab === key ? 0 : -1"
            @click="tab = key"
            @keydown.right.prevent="switchTab(1)"
            @keydown.left.prevent="switchTab(-1)"
          >
            {{ t(`experiencePage.openSource.${key}`) }}
          </button>
          <UiSegmentInk />
        </div>
        <label class="relative w-full sm:w-56">
          <span class="sr-only">{{ t('experiencePage.openSource.search') }}</span>
          <UIcon
            name="i-heroicons-magnifying-glass-20-solid"
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500"
            aria-hidden="true"
          />
          <input
            v-model="query"
            type="search"
            class="field min-h-9 py-1.5 pl-9"
            :placeholder="t('experiencePage.openSource.search')"
          />
        </label>
      </div>

      <div :id="`${headingId}-panel`" role="tabpanel" :aria-labelledby="`${headingId}-tab-${tab}`">
        <UiAutoHeight>
          <!-- Both lists stay mounted, only their rows change: on a tab switch or a search,
               the rows that go close one after the other while the new ones open -->
          <!-- Projects -->
          <TransitionGroup
            tag="ul"
            :css="false"
            @enter="rowEnter"
            @leave="rowLeave"
            class="divide-y divide-(--card-border) empty:hidden"
          >
            <li
              v-for="(project, i) in tab === 'projectsLabel' ? shownProjects : []"
              :key="project.key"
              class="relative isolate flex gap-4 overflow-hidden px-2 py-4 sm:px-3"
              :style="{ '--i': i }"
            >
              <UiPixelCanvas />
              <span class="icon-box size-11">
                <UIcon
                  :name="LANGUAGE_ICONS[project.language] ?? 'i-lucide-book-marked'"
                  class="size-5 text-neutral-500"
                  aria-hidden="true"
                />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h3 class="text-lg text-neutral-900 dark:text-neutral-100">
                      {{ project.name }}
                    </h3>
                    <p class="eyebrow mt-0.5">
                      {{ t('experiencePage.openSource.lot') }}
                      {{ String(projects.indexOf(project) + 1).padStart(2, '0') }} ·
                      {{ project.language }}
                    </p>
                  </div>
                  <span :class="cn('tag shrink-0', STATUS_CLASS[project.status])">
                    {{ t(`experiencePage.openSource.status.${project.status}`) }}
                  </span>
                </div>
                <p class="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {{ t(`experiencePage.openSource.projects.${project.key}`) }}
                </p>
                <div class="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <ul v-if="'channels' in project" class="flex flex-wrap gap-1.5">
                    <li
                      v-for="channel in project.channels"
                      :key="channel"
                      class="inline-flex h-7 items-center rounded-full border border-(--control-border) px-2.5 text-xs text-neutral-700 dark:text-neutral-300"
                    >
                      {{ channel }}
                    </li>
                  </ul>
                  <p class="eyebrow relative z-10 ml-auto flex items-center gap-2">
                    <a
                      v-if="'site' in project"
                      :href="project.site"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="underline underline-offset-4 hover:text-(--accent-text)"
                    >
                      {{ t('experiencePage.openSource.site') }} <span aria-hidden="true">↗</span>
                    </a>
                    <span v-if="'site' in project" aria-hidden="true">/</span>
                    <a
                      :href="project.repo"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="underline underline-offset-4 hover:text-(--accent-text)"
                    >
                      {{ t('experiencePage.openSource.repo') }} <span aria-hidden="true">↗</span>
                    </a>
                  </p>
                </div>
              </div>
            </li>
          </TransitionGroup>

          <!-- Contributions and reports -->
          <TransitionGroup
            tag="ul"
            :css="false"
            @enter="rowEnter"
            @leave="rowLeave"
            class="divide-y divide-(--card-border) empty:hidden"
          >
            <li
              v-for="(item, i) in tab === 'projectsLabel' ? [] : shownUpstream"
              :key="item.key"
              class="flex gap-4 px-2 py-4 sm:px-3"
              :style="{ '--i': i }"
            >
              <span class="icon-box size-11">
                <UIcon
                  :name="UPSTREAM_ICON[item.kind]!"
                  class="size-5 text-neutral-500"
                  aria-hidden="true"
                />
              </span>
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h3 class="truncate text-lg text-neutral-900 dark:text-neutral-100">
                      {{ item.repo }}
                    </h3>
                    <p class="eyebrow mt-0.5">{{ reference(item.url) }}</p>
                  </div>
                  <span :class="cn('tag shrink-0', STATUS_CLASS[item.kind])">
                    {{ t(`experiencePage.openSource.status.${item.kind}`) }}
                  </span>
                </div>
                <p class="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {{ t(`experiencePage.openSource.upstream.${item.key}`) }}
                </p>
                <p class="eyebrow mt-3 text-right">
                  <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="underline underline-offset-4 hover:text-(--accent-text)"
                  >
                    {{ t('experiencePage.openSource.view') }} <span aria-hidden="true">↗</span>
                  </a>
                </p>
              </div>
            </li>
          </TransitionGroup>

          <!-- A live region from the start: the empty result is announced as the search narrows -->
          <div role="status">
            <p v-if="shown === 0" class="eyebrow py-10 text-center">
              {{ t('experiencePage.openSource.noResults') }}
            </p>
          </div>
        </UiAutoHeight>
      </div>
    </div>

    <template #meta>
      <UiRollingNumber :value="shown" /> / <UiRollingNumber :value="total" />
    </template>
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
</template>
