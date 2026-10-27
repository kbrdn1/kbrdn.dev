<script setup lang="ts">
// /activity: the open source work (shared with /experience) and the recent public GitHub
// activity, read live through /api/github/activity and told in plain words, day by day,
// after disarto's trading journal. Fetched client side: the feed is never stale in a cache.
import { useI18n } from '#imports'

const { t, locale } = useI18n()

useSeoMeta({
  title: () => t('activityPage.seoTitle'),
  description: () => t('activityPage.seoDescription'),
  ogTitle: () => t('activityPage.seoTitle'),
  ogDescription: () => t('activityPage.seoDescription'),
  twitterCard: 'summary_large_image',
})

if (import.meta.server) {
  defineOgImage('Default', {
    title: t('activityPage.ogTitle'),
    subtitle: t('activityPage.ogSubtitle'),
    statusText: t('hero.availableForHire'),
    avatarUrl: `${useRequestURL().origin}/images/avatar.png`,
  })
}

const { data, status } = useFetch('/api/github/activity', {
  server: false,
  lazy: true,
  default: () => null,
})
const items = computed(() => data.value?.items ?? [])

// The feed grows by 20 entries at a time
const PAGE = 20
const limit = ref(PAGE)

// Days in the reader's own timezone, newest first; today and yesterday by name
const lang = computed(() => (locale.value === 'fr' ? 'fr-FR' : 'en-US'))
const dayKey = (iso: string) => new Date(iso).toLocaleDateString('en-CA')
function dayLabel(key: string) {
  const today = new Date()
  const yesterday = new Date(today.getTime() - 86_400_000)
  if (key === today.toLocaleDateString('en-CA')) return t('activityPage.today')
  if (key === yesterday.toLocaleDateString('en-CA')) return t('activityPage.yesterday')
  return new Date(`${key}T12:00:00`).toLocaleDateString(lang.value, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}
const days = computed(() => {
  const groups: { key: string; label: string; items: typeof items.value }[] = []
  for (const item of items.value.slice(0, limit.value)) {
    const key = dayKey(item.at)
    if (groups.at(-1)?.key !== key) groups.push({ key, label: dayLabel(key), items: [] })
    groups.at(-1)!.items.push(item)
  }
  return groups
})
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString(lang.value, { hour: '2-digit', minute: '2-digit' })

// Before a title: French sets a space before the colon, English doesn't
const colon = computed(() => (locale.value === 'fr' ? ' : ' : ': '))

// "il y a 13 h" / "13 hours ago"
function ago(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000)
  const rtf = new Intl.RelativeTimeFormat(lang.value, { numeric: 'auto' })
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
  if (Math.abs(minutes) < 60 * 24) return rtf.format(Math.round(minutes / 60), 'hour')
  return rtf.format(Math.round(minutes / 60 / 24), 'day')
}

type Item = (typeof items.value)[number]

// What an entry says, in plain words
function describe(item: Item): string {
  const p = { ref: item.ref, number: item.number, count: item.count }
  switch (item.type) {
    case 'push':
      return t(item.count > 1 ? 'activityPage.events.pushes' : 'activityPage.events.push', p)
    case 'pr':
    case 'issue':
      return t(`activityPage.events.${item.type}.${item.action}`, p)
    case 'comment':
      return t(item.count > 1 ? 'activityPage.events.comments' : 'activityPage.events.comment', p)
    case 'create':
      return t(`activityPage.events.${item.action}`, p)
    default:
      return t(`activityPage.events.${item.type}`, p)
  }
}

const ICON: Record<string, string> = {
  push: 'i-lucide-git-commit-horizontal',
  pr: 'i-lucide-git-pull-request',
  issue: 'i-lucide-circle-dot',
  comment: 'i-lucide-message-square',
  release: 'i-lucide-tag',
  create: 'i-lucide-folder-plus',
  star: 'i-lucide-star',
  fork: 'i-lucide-git-fork',
}
const icon = (item: Item) =>
  item.type === 'pr' && item.action === 'merged'
    ? 'i-lucide-git-merge'
    : item.type === 'issue' && item.action === 'closed'
      ? 'i-lucide-circle-check'
      : ICON[item.type]!

// Type tag colours: the tag tints itself from its text colour
const TAG: Record<string, string> = {
  push: 'text-neutral-500',
  pr: 'text-purple-600 dark:text-purple-500',
  issue: 'text-green-700 dark:text-green-500',
  comment: 'text-sky-600 dark:text-sky-500',
  release: 'text-primary-600 dark:text-primary-500',
  create: 'text-primary-600 dark:text-primary-500',
  star: 'text-yellow-700 dark:text-yellow-500',
  fork: 'text-neutral-500',
}
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-20 sm:px-6">
    <!-- Intro, open on the page like the home's hero -->
    <section class="py-4 sm:py-8">
      <p class="eyebrow">{{ t('activityPage.eyebrow') }}</p>
      <h1
        class="mt-4 max-w-3xl text-5xl tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-100"
        :aria-label="t('activityPage.title')"
      >
        <UiScrambleText :text="t('activityPage.title')" />
      </h1>
      <p class="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ t('activityPage.intro') }}
      </p>
      <!-- Client only: relative times and the reader's own clock -->
      <ClientOnly>
        <p v-if="data && items.length" class="eyebrow mt-6 flex flex-wrap items-center gap-x-2">
          <span class="relative flex size-1.5" aria-hidden="true">
            <span
              class="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-75"
            />
            <span class="relative inline-flex size-1.5 rounded-full bg-green-500" />
          </span>
          {{ t('activityPage.lastActivity', { ago: ago(items[0]!.at) }) }}
          <span aria-hidden="true">·</span>
          {{ t('activityPage.checked', { time: time(data.checkedAt) }) }}
        </p>
      </ClientOnly>
    </section>

    <!-- Open source, shared with /experience -->
    <section aria-labelledby="activity-open-source-heading">
      <ActivityOpenSource heading-id="activity-open-source-heading" />
    </section>

    <!-- Contributions over the year, the home page's chart -->
    <section aria-label="GitHub">
      <HomeGitHubChart username="kbrdn1" />
    </section>

    <!-- The feed, after disarto's trading journal: days, then one row per entry -->
    <section aria-labelledby="activity-feed-heading">
      <UiPanel>
        <div class="flex min-h-12 flex-wrap items-center gap-x-2 px-4 py-2">
          <h2 id="activity-feed-heading" class="text-[17px] text-neutral-900 dark:text-neutral-100">
            <UiScrambleText :text="t('activityPage.feedTitle')" />
          </h2>
          <span v-if="items.length" class="eyebrow">
            / {{ t('activityPage.feedCount', { count: items.length }) }}
          </span>
        </div>

        <div class="panel-card p-2 sm:p-3">
          <!-- Loading: rows shaped like the real ones -->
          <ul v-if="status === 'pending' || status === 'idle'" class="space-y-1" aria-hidden="true">
            <li v-for="i in 6" :key="i" class="flex items-center gap-3 px-2 py-3">
              <UiSkeleton class="size-9 rounded-[0.625rem]" />
              <div class="flex-1 space-y-2">
                <UiSkeleton class="h-3.5 w-40" />
                <UiSkeleton class="h-3 w-64" />
              </div>
              <UiSkeleton class="h-3 w-12" />
            </li>
          </ul>

          <!-- Error -->
          <p
            v-else-if="status === 'error' || !items.length"
            class="flex items-center justify-center gap-3 py-10 text-sm text-neutral-500"
          >
            <UiMascot mood="sad" :size="40" />
            {{ t('github.error') }}
          </p>

          <div v-else>
            <section v-for="day in days" :key="day.key" :aria-label="day.label">
              <h3
                class="eyebrow border-b border-dashed border-(--card-border) px-2 pt-3 pb-2 first:pt-1"
              >
                {{ day.label }}
              </h3>
              <ul class="divide-y divide-(--card-border)">
                <li v-for="item in day.items" :key="item.id">
                  <a
                    :href="item.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="row group flex items-start gap-3 px-2 py-3"
                  >
                    <span class="icon-box size-9">
                      <UIcon
                        :name="icon(item)"
                        class="size-4 text-neutral-500"
                        aria-hidden="true"
                      />
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span
                          class="truncate text-[15px] text-neutral-900 transition-colors group-hover:text-(--accent-text) dark:text-neutral-100"
                        >
                          {{ item.repo }}
                        </span>
                        <span :class="cn('tag h-5 px-2 text-[10px]', TAG[item.type])">
                          {{ t(`activityPage.types.${item.type}`) }}
                        </span>
                      </span>
                      <span class="mt-0.5 block text-sm text-neutral-600 dark:text-neutral-400">
                        {{ describe(item)
                        }}<template v-if="item.title">{{ colon }}{{ item.title }}</template>
                      </span>
                    </span>
                    <span class="eyebrow shrink-0 pt-1 tabular-nums">{{ time(item.at) }}</span>
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>

        <template #meta>
          <template v-if="items.length">
            {{ Math.min(limit, items.length) }} / {{ items.length }}
          </template>
        </template>
        <template #footer>
          <button
            v-if="limit < items.length"
            type="button"
            class="btn btn-outline btn-sm"
            @click="limit += PAGE"
          >
            {{ t('activityPage.showMore') }}
          </button>
          <a
            href="https://github.com/kbrdn1"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary btn-sm"
          >
            <UIcon name="i-simple-icons-github" class="size-4" aria-hidden="true" />
            {{ t('activityPage.more') }}
            <UIcon name="i-heroicons-arrow-up-right-20-solid" class="size-4" aria-hidden="true" />
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
