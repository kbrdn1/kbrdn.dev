<script setup lang="ts">
import { useI18n } from '#imports'
import type { DitherChartSpec } from '~/components/ui/DitherChart.vue'

const { t, locale } = useI18n()

interface Props {
  username?: string
}

const props = withDefaults(defineProps<Props>(), {
  username: 'kbrdn1',
})

const { data: contributions, status } = useGitHubContributions(props.username, 5)

// Tab state: "recent" is the rolling year ending today, as on a GitHub profile
const tabs = ['recent', 'annual', 'monthly'] as const
type Tab = (typeof tabs)[number]
const activeTab = ref<Tab>('recent')

// Expand state
const isExpanded = ref(false)

// Reset expand state when switching tabs
watch(activeTab, () => {
  isExpanded.value = false
})

// Default limits
const DEFAULT_YEARS = 2
const DEFAULT_MONTHS = 3
const EXPANDED_MONTHS = 12

// Month names in the page's language: short over the grids, long for the monthly view
const monthName = (month: number, format: 'short' | 'long') =>
  new Date(2000, month, 1).toLocaleDateString(locale.value, { month: format })

// The API's dates ("2026-11-18") read at UTC midnight, written in the page's language
const utc = (date: Date, format: Intl.DateTimeFormatOptions) =>
  date.toLocaleDateString(locale.value, { ...format, timeZone: 'UTC' })
const shortMonth = (date: Date) => utc(date, { month: 'short' })

// Days as a dithered heatmap: the hovered (or keyboard-selected) day and its count in the readout
function heatmap({
  values,
  days,
  columns,
}: {
  values: (number | null)[][]
  days: (string | null)[][]
  columns?: string[]
}): DitherChartSpec {
  return {
    kind: 'heatmap',
    values,
    columns,
    color: 'accent',
    readout: (row, column) => ({
      title: utc(new Date(days[row]![column]!), {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      rows: [
        [
          'accent',
          t('github.readout', values[row]![column] ?? 0),
          (values[row]![column] ?? 0).toLocaleString(locale.value),
        ],
      ],
    }),
  }
}

// Group contributions by month for monthly view (last 12 months)
const monthlyData = computed(() => {
  if (!contributions.value?.years) return []

  const months: {
    name: string
    period: string
    year: number
    contributions: number
    chart: DitherChartSpec
  }[] = []

  // Group all days by month from all years
  const grouped = new Map<string, { contributionCount: number; date: string }[]>()

  contributions.value.years.forEach((yearData) => {
    yearData.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        // The date's own month ("2026-11-18"), as the heatmaps read it: not the reader's local
        // one, which west of UTC filed each month's first day under the month before
        const key = day.date.slice(0, 7)
        if (!grouped.has(key)) {
          grouped.set(key, [])
        }
        grouped.get(key)!.push(day)
      })
    })
  })

  // Convert to array and sort by date (most recent first)
  const sortedKeys = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a))

  // Take last 12 months
  sortedKeys.slice(0, 12).forEach((key) => {
    const [year = 0, number = 1] = key.split('-').map(Number)
    const month = number - 1
    const days = grouped.get(key)!.sort((a, b) => a.date.localeCompare(b.date))
    const total = days.reduce((sum, d) => sum + d.contributionCount, 0)

    months.push({
      name: monthName(month, 'long').toLocaleUpperCase(locale.value),
      period: `${monthName(month, 'long')} ${year}`,
      year,
      contributions: total,
      // One row of days, as wide as the month
      chart: heatmap({
        values: [days.map((d) => d.contributionCount)],
        days: [days.map((d) => d.date)],
      }),
    })
  })

  return months
})

// Grids to draw: the rolling year for "recent", calendar years (expandable) for "annual"
const visibleCalendars = computed(() => {
  const data = contributions.value
  if (!data?.years) return []
  if (activeTab.value === 'recent') {
    // The stat above already says "last 12 months": the header gives the actual span
    const days = data.recent.weeks.flatMap((week) => week.contributionDays)
    const format = (date?: string) =>
      date
        ? new Date(date).toLocaleDateString(locale.value, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
          })
        : ''
    return [
      {
        key: 'recent',
        label: `${format(days[0]?.date)} – ${format(days.at(-1)?.date)}`,
        total: data.recent.totalContributions,
        chart: heatmap(calendarGrid(data.recent.weeks, shortMonth)),
      },
    ]
  }
  const limit = isExpanded.value ? data.years.length : DEFAULT_YEARS
  return data.years.slice(0, limit).map((year) => ({
    key: String(year.year),
    label: String(year.year),
    total: year.totalContributions,
    chart: heatmap(calendarGrid(year.weeks, shortMonth)),
  }))
})

const visibleMonths = computed(() => {
  const limit = isExpanded.value ? EXPANDED_MONTHS : DEFAULT_MONTHS
  return monthlyData.value.slice(0, limit)
})

const canExpandYears = computed(() => {
  return (contributions.value?.years?.length || 0) > DEFAULT_YEARS
})

const canExpandMonths = computed(() => {
  return monthlyData.value.length > DEFAULT_MONTHS
})

// Stats follow the tab: the rolling year for "recent", every fetched year otherwise. Written in
// the page's language: "27,2" in French
const stats = computed(() => {
  const data = contributions.value
  if (!data) return { total: '0', avgPerDay: '0' }

  const recent = activeTab.value === 'recent'
  const total = recent ? data.recent.totalContributions : data.totalContributions
  const calendars = recent ? [data.recent] : data.years
  const totalDays = calendars.reduce(
    (days, calendar) =>
      days + calendar.weeks.reduce((n, week) => n + week.contributionDays.length, 0),
    0,
  )

  return {
    total: total.toLocaleString(locale.value),
    avgPerDay: (totalDays > 0 ? total / totalDays : 0).toLocaleString(locale.value, {
      minimumFractionDigits: totalDays > 0 ? 1 : 0,
      maximumFractionDigits: 1,
    }),
  }
})

// Under "last 12 months": the monthly view's twelve totals, oldest first, and in words
const lastMonths = computed(() => [...monthlyData.value].reverse())
const trendLabel = computed(() =>
  t('github.trendLabel', {
    values: lastMonths.value
      .map((month) => `${month.period} ${month.contributions.toLocaleString(locale.value)}`)
      .join(', '),
  }),
)

// Arrow keys cycle through the tabs, focus following within this tablist only: other tab sets
// on the page (featured projects, open source) carry an aria-selected too
const tablist = ref<HTMLElement>()
function switchTab(step: 1 | -1) {
  const index = tabs.indexOf(activeTab.value)
  activeTab.value = tabs[(index + step + tabs.length) % tabs.length]!
  nextTick(() => tablist.value?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus())
}
</script>

<template>
  <UiPanel :title="t('github.title')">
    <template #actions>
      <!-- Tabs: a segmented control, the active view filled -->
      <div ref="tablist" class="segmented" role="tablist" :aria-label="t('github.tabsLabel')">
        <button
          v-for="tab in tabs"
          :id="`github-tab-${tab}`"
          :key="tab"
          role="tab"
          class="segment"
          :aria-selected="activeTab === tab"
          aria-controls="github-panel"
          :tabindex="activeTab === tab ? 0 : -1"
          @click="activeTab = tab"
          @keydown.right.prevent="switchTab(1)"
          @keydown.left.prevent="switchTab(-1)"
        >
          {{ t(`github.tabs.${tab}`) }}
        </button>
        <UiSegmentInk />
      </div>
      <!-- External link -->
      <a
        :href="`https://github.com/${username}`"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`${t('github.viewProfile')} (${t('common.newTab')})`"
        class="icon-btn"
      >
        <UIcon name="i-heroicons-arrow-top-right-on-square" class="size-4" aria-hidden="true" />
      </a>
    </template>

    <!-- The one panel all three tabs drive -->
    <div
      id="github-panel"
      class="panel-card relative space-y-6 p-5 sm:p-6"
      role="tabpanel"
      :aria-labelledby="`github-tab-${activeTab}`"
    >
      <!-- The Octocat commits beside the graph -->
      <UiCameo name="octocat" place="area" />
      <!-- Loading skeleton, shaped like the default "recent" view. Also shown while idle: the
         data is fetched client-side, so the server renders this state. -->
      <template v-if="status === 'pending' || status === 'idle'">
        <!-- Stats skeleton -->
        <!-- Line boxes of the real ones: the eyebrow's 16px and its margin, the figure's 40px -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
          <div class="sm:flex-1">
            <div class="mb-1 flex h-4 items-center"><UiSkeleton class="h-3 w-28" /></div>
            <div class="flex h-10 items-center"><UiSkeleton class="h-9 w-20" /></div>
            <!-- The sparkline's 56px -->
            <UiSkeleton class="mt-3 h-14" />
          </div>
          <div>
            <div class="mb-1 flex h-4 items-center"><UiSkeleton class="h-3 w-24" /></div>
            <div class="flex h-10 items-center"><UiSkeleton class="h-9 w-24" /></div>
          </div>
        </div>

        <!-- Calendar header skeleton -->
        <div class="space-y-2">
          <div class="flex h-4 items-center justify-between">
            <UiSkeleton class="h-3 w-28" />
            <UiSkeleton class="h-3 w-32" />
          </div>

          <!-- Grid skeleton with month labels -->
          <div class="overflow-x-auto">
            <div class="min-w-max">
              <!-- Month labels skeleton: short labels, one every ~4.3 weeks, like the real ones -->
              <div class="relative mb-1 h-4">
                <UiSkeleton
                  v-for="i in 12"
                  :key="i"
                  class="absolute top-0.5 h-3 w-6"
                  :style="{ left: `${Math.round((i - 1) * 4.35) * (12 + 3)}px` }"
                />
              </div>

              <!-- Grid skeleton: 53 weeks, the rolling year, rounded like the days. Pulsing in a
                   wave across the weeks: all at once, it read as a year without contributions -->
              <div class="flex gap-[3px]">
                <div
                  v-for="w in 53"
                  :key="w"
                  class="flex animate-pulse flex-col gap-[3px]"
                  :style="{ animationDelay: `${w * 40}ms` }"
                  aria-hidden="true"
                >
                  <div v-for="d in 7" :key="d" class="size-3 rounded-[3px] bg-(--placeholder)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Content -->
      <template v-else-if="contributions?.years">
        <!-- Stats; the last twelve months by month under their total. The sparkline comes and
             goes with the tab: the height follows instead of jumping -->
        <UiAutoHeight>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
            <UiDitherStat
              class="min-w-0 sm:flex-1"
              :label="
                activeTab === 'recent' ? t('github.lastYear') : t('github.totalContributions')
              "
              :value="stats.total"
              :trend="
                activeTab === 'recent' ? lastMonths.map((month) => month.contributions) : undefined
              "
              :trend-label="trendLabel"
            />
            <UiDitherStat
              :label="t('github.dailyAverage')"
              :value="stats.avgPerDay"
              :unit="t('github.perDay')"
            />
          </div>
        </UiAutoHeight>

        <UiAutoHeight>
          <!-- Recent and Annual views: one grid per calendar -->
          <!-- Both views stay mounted, only their rows change: switching, the old rows close
               one after the other while the new ones open, instead of a view vanishing -->
          <TransitionGroup
            tag="div"
            class="space-y-6 empty:hidden"
            :css="false"
            @enter="rowEnter"
            @leave="rowLeave"
          >
            <div
              v-for="(calendar, index) in activeTab === 'monthly' ? [] : visibleCalendars"
              :key="calendar.key"
              class="space-y-2"
              :style="{ '--i': index }"
            >
              <!-- Calendar header -->
              <div class="flex items-center justify-between">
                <p class="eyebrow">
                  {{ calendar.label }}
                </p>
                <p class="text-xs text-neutral-400 font-mono">
                  {{ calendar.total.toLocaleString(locale) }} {{ t('github.contributions') }}
                </p>
              </div>

              <!-- The weeks, month names on top, scrolled sideways rather than cut when they do
                   not fit. Room around them for the focus ring the scroller would clip. A cameo
                   keeps off the drawing (UiCameo) -->
              <div class="-m-1 overflow-x-auto p-1">
                <UiDitherChart
                  data-cameo-solid
                  :chart="calendar.chart"
                  :label="
                    t('github.calendarLabel', {
                      count: calendar.total.toLocaleString(locale),
                      period: calendar.label,
                    })
                  "
                />
              </div>
            </div>
          </TransitionGroup>

          <!-- Monthly View - Last 12 months -->
          <TransitionGroup
            tag="div"
            class="space-y-4 empty:hidden"
            :css="false"
            @enter="rowEnter"
            @leave="rowLeave"
          >
            <div
              v-for="(month, index) in activeTab === 'monthly' ? visibleMonths : []"
              :key="`${month.year}-${month.name}`"
              class="space-y-2"
              :style="{ '--i': index }"
            >
              <!-- Month header -->
              <div class="flex items-center justify-between">
                <p class="eyebrow">
                  {{ month.name }}
                  <span class="text-neutral-600">/ {{ month.year }}</span>
                </p>
                <p class="text-xs text-neutral-400 font-mono">
                  {{ month.contributions.toLocaleString(locale) }} {{ t('github.contributions') }}
                </p>
              </div>

              <!-- The month's days in a row, scrolled sideways on a phone -->
              <div class="-m-1 overflow-x-auto p-1">
                <UiDitherChart
                  data-cameo-solid
                  :chart="month.chart"
                  :label="
                    t('github.calendarLabel', {
                      count: month.contributions.toLocaleString(locale),
                      period: month.period,
                    })
                  "
                />
              </div>
            </div>
          </TransitionGroup>
        </UiAutoHeight>

        <!-- Show more/less button -->
        <button
          v-if="
            (activeTab === 'annual' && canExpandYears) ||
            (activeTab === 'monthly' && canExpandMonths)
          "
          class="btn btn-outline btn-sm w-full"
          :aria-expanded="isExpanded"
          @click="isExpanded = !isExpanded"
        >
          <UIcon
            name="i-heroicons-chevron-down"
            class="w-4 h-4"
            :style="{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 300ms ease !important',
            }"
          />
          {{ isExpanded ? t('common.showLess') : t('common.showMore') }}
        </button>
      </template>

      <!-- Error -->
      <div v-else class="flex items-center gap-3 text-sm text-neutral-500">
        <UiMascot mood="sad" :size="40" />
        {{ t('github.error') }}
      </div>
    </div>
  </UiPanel>
</template>
