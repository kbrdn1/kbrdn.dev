<script setup lang="ts">
import { useI18n } from '#imports'

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

// Month labels for annual view
const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

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
        label: monthLabels[month] ?? '',
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

  const monthNames = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ]

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
      name: monthNames[month] ?? '',
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
        label: `${format(days[0]?.date)} — ${format(days.at(-1)?.date)}`,
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
    date: new Date(day.date).toLocaleDateString('en-US', {
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

// Arrow keys cycle through the tabs
function switchTab(step: 1 | -1) {
  const index = tabs.indexOf(activeTab.value)
  activeTab.value = tabs[(index + step + tabs.length) % tabs.length]!
  nextTick(() => {
    const el = document.querySelector(`[aria-selected="true"]`) as HTMLElement
    el?.focus()
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header with tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h2 class="text-xl font-medium text-neutral-900 dark:text-neutral-100">
        <UiScrambleText :text="t('github.title')" />
      </h2>
      <div class="flex items-center justify-between sm:justify-end gap-4">
        <!-- Tabs -->
        <div class="flex gap-1 text-xs" role="tablist" aria-label="Contribution view">
          <button
            v-for="tab in tabs"
            :key="tab"
            role="tab"
            :aria-selected="activeTab === tab"
            :tabindex="activeTab === tab ? 0 : -1"
            :class="
              cn(
                'px-3 py-1 transition-colors uppercase tracking-wider',
                activeTab === tab
                  ? 'text-primary-500 bg-primary-500/10'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
              )
            "
            @click="activeTab = tab"
            @keydown.right.prevent="switchTab(1)"
            @keydown.left.prevent="switchTab(-1)"
          >
            {{ t(`github.tabs.${tab}`) }}
          </button>
        </div>
        <!-- External link -->
        <a
          :href="`https://github.com/${username}`"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View GitHub profile (opens in new window)"
          class="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-5 h-5" aria-hidden="true" />
        </a>
      </div>
    </div>

    <!-- Loading skeleton, shaped like the default "recent" view. Also shown while idle: the
         data is fetched client-side, so the server renders this state. -->
    <template v-if="status === 'pending' || status === 'idle'">
      <!-- Stats skeleton -->
      <div class="flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-8">
        <div class="space-y-2">
          <UiSkeleton class="h-3 w-28" />
          <UiSkeleton class="h-9 w-20" />
        </div>
        <div class="space-y-2">
          <UiSkeleton class="h-3 w-24" />
          <UiSkeleton class="h-9 w-24" />
        </div>
      </div>

      <!-- Calendar header skeleton -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
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

            <!-- Grid skeleton: 53 weeks, the rolling year -->
            <div class="flex gap-[3px]">
              <div v-for="w in 53" :key="w" class="flex flex-col gap-[3px]">
                <UiSkeleton v-for="d in 7" :key="d" class="w-3 h-3" />
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
          <p class="text-xs text-neutral-500 uppercase tracking-wider mb-1">
            {{ activeTab === 'recent' ? t('github.lastYear') : t('github.totalContributions') }}
          </p>
          <p
            class="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 font-mono"
          >
            {{ stats.total.toLocaleString() }}
          </p>
        </div>
        <div>
          <p class="text-xs text-neutral-500 uppercase tracking-wider mb-1">
            {{ t('github.dailyAverage') }}
          </p>
          <p
            class="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 font-mono"
          >
            {{ stats.avgPerDay }}
            <span class="text-primary-500 text-base sm:text-lg">{{ t('github.perDay') }}</span>
          </p>
        </div>
      </div>

      <!-- Recent and Annual views: one grid per calendar -->
      <TransitionGroup
        v-if="activeTab !== 'monthly'"
        tag="div"
        class="space-y-6"
        enter-active-class="stagger-enter"
        enter-from-class="stagger-enter-from"
        enter-to-class="stagger-enter-to"
        leave-active-class="stagger-leave"
        leave-from-class="stagger-leave-from"
        leave-to-class="stagger-leave-to"
      >
        <div
          v-for="(calendar, index) in visibleCalendars"
          :key="calendar.key"
          class="space-y-2"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <!-- Calendar header -->
          <div class="flex items-center justify-between">
            <p class="text-xs text-neutral-500 uppercase tracking-wider">
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

              <!-- Grid -->
              <div class="flex gap-[3px]">
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
                        'w-3 h-3 cursor-pointer transition-all duration-150',
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
        v-else
        tag="div"
        class="space-y-4"
        enter-active-class="stagger-enter"
        enter-from-class="stagger-enter-from"
        enter-to-class="stagger-enter-to"
        leave-active-class="stagger-leave"
        leave-from-class="stagger-leave-from"
        leave-to-class="stagger-leave-to"
      >
        <div
          v-for="(month, index) in visibleMonths"
          :key="`${month.year}-${month.name}`"
          class="space-y-2"
          :style="{ transitionDelay: `${index * 75}ms` }"
        >
          <!-- Month header -->
          <div class="flex items-center justify-between">
            <p class="text-xs text-neutral-500 uppercase tracking-wider">
              {{ month.name }}
              <span class="text-neutral-600">/ {{ month.year }}</span>
            </p>
            <p class="text-xs text-neutral-400 font-mono">
              {{ month.contributions.toLocaleString() }} {{ t('github.contributions') }}
            </p>
          </div>

          <!-- Month grid -->
          <div class="flex gap-[3px] flex-wrap">
            <div
              v-for="day in month.days"
              :key="day.date"
              :class="
                cn(
                  'w-3 h-3 cursor-pointer transition-all duration-150',
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

      <!-- Show more/less button -->
      <button
        v-if="
          (activeTab === 'annual' && canExpandYears) || (activeTab === 'monthly' && canExpandMonths)
        "
        class="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-neutral-600 dark:text-neutral-400 hover:text-primary-500 bg-neutral-100/50 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-primary-500/30 transition-all uppercase tracking-wider"
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
    <div v-else class="text-sm text-neutral-500">
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
              'fixed z-50 px-2 py-1 text-xs shadow-lg pointer-events-none',
              'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700',
              'transform -translate-x-1/2 -translate-y-full',
            )
          "
          :style="{ left: `${tooltipData.x}px`, top: `${tooltipData.y}px` }"
        >
          <strong class="text-primary-500">{{ tooltipData.count }}</strong> on
          {{ tooltipData.date }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
