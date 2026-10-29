<script setup lang="ts">
import { useI18n } from '#imports'
import { TOOLTIP_CLASS } from '~/utils/tooltip'

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
const monthLabels = computed(() => Array.from({ length: 12 }, (_, m) => monthName(m, 'short')))

// Calculate month positions based on actual week data
function getMonthPositions(weeks: { contributionDays: { date: string }[] }[]) {
  const positions: { label: string; offset: number }[] = []
  let lastMonth = -1

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.contributionDays[0]
    if (!firstDay) return
    const date = new Date(firstDay.date)
    const month = date.getMonth()
    if (month !== lastMonth) {
      positions.push({
        label: monthLabels.value[month] ?? '',
        offset: weekIndex,
      })
      lastMonth = month
    }
  })

  // A label only fits if the next one is at least 3 weeks away: the first week of a year
  // often starts in December, and "Dec" then sat on top of "Jan".
  return positions.filter((pos, i) => (positions[i + 1]?.offset ?? Infinity) - pos.offset >= 3)
}

// Group contributions by month for monthly view (last 12 months)
const monthlyData = computed(() => {
  if (!contributions.value?.years) return []

  const months: {
    name: string
    year: number
    contributions: number
    days: { contributionCount: number; date: string }[]
  }[] = []

  // Group all days by month from all years
  const grouped = new Map<string, { contributionCount: number; date: string }[]>()

  contributions.value.years.forEach((yearData) => {
    yearData.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        const date = new Date(day.date)
        const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`
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
    const [year = 0, month = 0] = key.split('-').map(Number)
    const days = grouped.get(key)!
    const total = days.reduce((sum, d) => sum + d.contributionCount, 0)

    months.push({
      name: monthName(month, 'long').toLocaleUpperCase(locale.value),
      year,
      contributions: total,
      days: days.sort((a, b) => a.date.localeCompare(b.date)),
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
        weeks: data.recent.weeks,
      },
    ]
  }
  const limit = isExpanded.value ? data.years.length : DEFAULT_YEARS
  return data.years.slice(0, limit).map((year) => ({
    key: String(year.year),
    label: String(year.year),
    total: year.totalContributions,
    weeks: year.weeks,
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

// Stats follow the tab: the rolling year for "recent", every fetched year otherwise
const stats = computed(() => {
  const data = contributions.value
  if (!data) return { total: 0, avgPerDay: '0' }

  const recent = activeTab.value === 'recent'
  const total = recent ? data.recent.totalContributions : data.totalContributions
  const calendars = recent ? [data.recent] : data.years
  const totalDays = calendars.reduce(
    (days, calendar) =>
      days + calendar.weeks.reduce((n, week) => n + week.contributionDays.length, 0),
    0,
  )

  return { total, avgPerDay: totalDays > 0 ? (total / totalDays).toFixed(1) : '0' }
})

function getColor(count: number): string {
  if (count === 0) return 'bg-neutral-200 dark:bg-neutral-800'
  if (count <= 2) return 'bg-primary-500/30'
  if (count <= 5) return 'bg-primary-500/50'
  if (count <= 8) return 'bg-primary-500/70'
  return 'bg-primary-500'
}

const tooltipData = ref<{
  count: number
  date: string
  x: number
  y: number
} | null>(null)

function showTooltip(day: { contributionCount: number; date: string }, event: MouseEvent) {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  tooltipData.value = {
    count: day.contributionCount,
    date: new Date(day.date).toLocaleDateString(locale.value, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    x: rect.left + rect.width / 2,
    y: rect.top - 8,
  }
}

function hideTooltip() {
  tooltipData.value = null
}

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
        <div class="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-8">
          <div>
            <div class="mb-1 flex h-4 items-center"><UiSkeleton class="h-3 w-28" /></div>
            <div class="flex h-10 items-center"><UiSkeleton class="h-9 w-20" /></div>
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
        <!-- Stats -->
        <div class="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-8">
          <div>
            <p class="eyebrow mb-1">
              {{ activeTab === 'recent' ? t('github.lastYear') : t('github.totalContributions') }}
            </p>
            <p class="text-4xl tracking-tight text-neutral-900 dark:text-neutral-100">
              <UiRollingNumber :value="stats.total.toLocaleString()" />
            </p>
          </div>
          <div>
            <p class="eyebrow mb-1">
              {{ t('github.dailyAverage') }}
            </p>
            <p class="text-4xl tracking-tight text-neutral-900 dark:text-neutral-100">
              <UiRollingNumber :value="stats.avgPerDay" />
              <span class="text-base text-neutral-500 dark:text-neutral-400">{{
                t('github.perDay')
              }}</span>
            </p>
          </div>
        </div>

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
                  {{ calendar.total.toLocaleString() }} {{ t('github.contributions') }}
                </p>
              </div>

              <!-- Contribution grid with month labels -->
              <div class="overflow-x-auto">
                <div class="min-w-max">
                  <!-- Month labels - positioned by actual week offset -->
                  <div class="relative text-xs text-neutral-500 mb-1 h-4">
                    <span
                      v-for="pos in getMonthPositions(calendar.weeks)"
                      :key="`${calendar.key}-${pos.offset}`"
                      class="absolute"
                      :style="{ left: `${pos.offset * (12 + 3)}px` }"
                    >
                      {{ pos.label }}
                    </span>
                  </div>

                  <!-- Grid: drawn without text, a cameo keeps off it (UiCameo) -->
                  <div class="flex gap-[3px]" data-cameo-solid>
                    <div
                      v-for="(week, weekIndex) in calendar.weeks"
                      :key="weekIndex"
                      class="flex flex-col gap-[3px]"
                    >
                      <div
                        v-for="day in week.contributionDays"
                        :key="day.date"
                        :class="
                          cn(
                            'w-3 h-3 rounded-[3px] cursor-pointer transition-all duration-150',
                            'hover:ring-2 hover:ring-primary-500/50 hover:scale-125 hover:z-10',
                            getColor(day.contributionCount),
                          )
                        "
                        @mouseenter="showTooltip(day, $event)"
                        @mouseleave="hideTooltip"
                      />
                    </div>
                  </div>
                </div>
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
                  {{ month.contributions.toLocaleString() }} {{ t('github.contributions') }}
                </p>
              </div>

              <!-- Month grid -->
              <div class="flex gap-[3px] flex-wrap" data-cameo-solid>
                <div
                  v-for="day in month.days"
                  :key="day.date"
                  :class="
                    cn(
                      'w-3 h-3 rounded-[3px] cursor-pointer transition-all duration-150',
                      'hover:ring-2 hover:ring-primary-500/50 hover:scale-125 hover:z-10',
                      getColor(day.contributionCount),
                    )
                  "
                  @mouseenter="showTooltip(day, $event)"
                  @mouseleave="hideTooltip"
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

      <!-- Tooltip -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition-opacity duration-150"
          enter-from-class="opacity-0"
          leave-active-class="transition-opacity duration-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="tooltipData"
            :class="
              cn(
                TOOLTIP_CLASS,
                'pointer-events-none fixed z-50 flex items-center gap-1.5 whitespace-nowrap',
                'transform -translate-x-1/2 -translate-y-full',
              )
            "
            :style="{ left: `${tooltipData.x}px`, top: `${tooltipData.y}px` }"
          >
            <strong class="text-primary-700 dark:text-primary-500">{{ tooltipData.count }}</strong>
            {{ t('github.on') }} {{ tooltipData.date }}
          </div>
        </Transition>
      </Teleport>
    </div>
  </UiPanel>
</template>
