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

useSiteOgImage('Default', {
  title: t('experiencePage.ogTitle'),
  subtitle: t('experiencePage.ogSubtitle'),
  scene: 'climb',
})
const person = usePersonRef()
usePageSchema(
  'ProfilePage',
  () => ({
    name: t('experiencePage.seoTitle'),
    description: t('experiencePage.seoDescription'),
    mainEntity: person,
  }),
  { trail: () => [{ name: t('nav.experience'), path: 'experience' }] },
)

const period = (start: string, end: string | null) =>
  `${formatMonth(start, locale.value)} – ${end ? formatMonth(end, locale.value) : t('experiences.present')}`

// Every role and degree, most recent first, for the strip at the top; a role's projects
// right after it, marked "↳" (isrod.eu's sub-entries), out of the numbering.
interface TimelineItem {
  id: string
  start: string
  end: string | null
  name: string
  logo?: string
  detail: string
  nested?: boolean
  n?: number
}
const projectsOf = (id: string) => PROJECTS.filter((p) => p.parent === id)
// The client, unless it is the product itself (Assmat Facile): then the role says more
const clientOf = (p: (typeof PROJECTS)[number]) => {
  const client = t(`experiencePage.work.${p.key}.client`)
  return client === p.name ? null : client
}
const timeline = computed(() =>
  (
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
    ] as TimelineItem[]
  )
    .sort((a, b) => b.start.localeCompare(a.start))
    .flatMap((item, i): TimelineItem[] => [
      { ...item, n: i + 1 },
      ...projectsOf(item.id).map((p) => ({
        id: p.id,
        start: p.startDate,
        end: p.endDate,
        name: p.name,
        detail: clientOf(p) ?? t(`experiencePage.work.${p.key}.role`),
        nested: true,
      })),
    ]),
)

const cvUrl = useCvUrl()

// Sites as entry links: a company's, a school's, a project's clients'
const siteLinks = (sites?: { label: string; url: string }[]) =>
  (sites ?? []).map((site) => ({ label: site.label, to: site.url, external: true }))

// A project's links: its clients, its public site, the blog post about it
const { postUrl } = useBlogUrl()
const projectLinks = (p: (typeof PROJECTS)[number]) => [
  ...siteLinks(p.clients),
  ...(p.site
    ? [{ label: t(`experiencePage.work.${p.key}.site`), to: p.site, external: true }]
    : []),
  ...(p.article
    ? [{ label: t(`experiencePage.work.${p.key}.article`), to: postUrl({ path: p.article }) }]
    : []),
]

// Scroll spy: the role or degree being read (the first article in a band across the middle
// of the viewport), and whether the full strip has scrolled away under the navbar. Then a
// compact strip, fixed under the navbar, follows the reading: it scrolls its active card in.
const activeId = ref('')
const stripGone = ref(false)
const strip = ref<HTMLElement>()
const compactNav = ref<HTMLElement>()
const baseList = ref<HTMLElement>()
const compactList = ref<HTMLElement>()

// The ink: one tinted pill per strip, sliding to the active card instead of the tint jumping
// from card to card. Measured on the card, relative to the strip's content.
const baseInk = ref<Record<string, string> | null>(null)
const compactInk = ref<Record<string, string> | null>(null)
function ink(list?: HTMLElement) {
  const card = list?.querySelector<HTMLElement>(`[data-id="${activeId.value}"]`)
  if (!card) return null
  return {
    left: `${card.offsetLeft}px`,
    top: `${card.offsetTop}px`,
    width: `${card.offsetWidth}px`,
    height: `${card.offsetHeight}px`,
  }
}
const reducedMotion = useReducedMotion()
let observers: IntersectionObserver[] = []

onMounted(() => {
  const inView = new Set<string>()
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) inView.add(e.target.id)
        else inView.delete(e.target.id)
      }
      activeId.value = timeline.value.map((i) => i.id).find((id) => inView.has(id)) ?? ''
    },
    { rootMargin: '-30% 0px -60% 0px' },
  )
  for (const item of timeline.value) {
    const el = document.getElementById(item.id)
    if (el) spy.observe(el)
  }
  const gone = new IntersectionObserver(
    ([entry]) => {
      stripGone.value = !!entry && !entry.isIntersecting && entry.boundingClientRect.top < 0
    },
    { rootMargin: '-96px 0px 0px 0px' },
  )
  if (strip.value) gone.observe(strip.value)
  observers = [spy, gone]
})
onUnmounted(() => observers.forEach((o) => o.disconnect()))

watch([activeId, stripGone], async ([id], [previousId]) => {
  // The address follows the reading: replaceState, so the router neither scrolls nor stacks
  // history entries; its own state is kept
  if (id !== previousId) {
    history.replaceState(history.state, '', id ? `#${id}` : location.pathname + location.search)
  }
  await nextTick()
  baseInk.value = ink(baseList.value)
  compactInk.value = ink(compactList.value)
  const nav = compactNav.value
  const card = nav?.querySelector<HTMLElement>(`[data-id="${id}"]`)
  if (!nav || !card) return
  nav.scrollTo({
    left: card.offsetLeft - (nav.clientWidth - card.clientWidth) / 2,
    behavior: reducedMotion.value ? 'auto' : 'smooth',
  })
})

const list = (key: string, count: number) =>
  Array.from({ length: count }, (_, i) => t(`${key}.${i}`))
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-20 sm:px-6">
    <!-- Intro, open on the page like the home's hero -->
    <!-- The scene beside it, under it on a phone -->
    <section
      class="flex flex-col gap-8 py-4 sm:py-8 md:flex-row md:items-center md:justify-between md:gap-12"
    >
      <div class="min-w-0 flex-1">
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
          <NuxtLinkLocale to="/blog" class="btn btn-outline">
            <UiScrambleText :text="t('experiencePage.ctaBlog')" effect="link" />
            <UIcon name="i-heroicons-arrow-right-20-solid" class="size-4" aria-hidden="true" />
          </NuxtLinkLocale>
        </div>
      </div>
      <UiPixelScene scene="climb" class="mx-auto w-56 shrink-0 sm:w-64 md:mx-0 md:w-52 lg:w-64" />
    </section>

    <!-- The figures, after disarto's stat cards: they roll in -->
    <UiPanel>
      <dl
        class="panel-card grid grid-cols-2 gap-6 p-5 sm:p-6 md:grid-cols-4 md:gap-0 md:divide-x md:divide-dashed md:divide-(--card-border)"
      >
        <div
          v-for="figure in CAREER_FIGURES"
          :key="figure.key"
          class="md:px-6 md:first:pl-0 md:last:pr-0"
        >
          <dt class="eyebrow">{{ t(`experiencePage.figures.${figure.key}`) }}</dt>
          <dd class="mt-1 text-4xl tracking-tight text-neutral-900 dark:text-neutral-100">
            <UiRollingNumber :value="figure.value" />
          </dd>
        </div>
      </dl>
    </UiPanel>

    <!-- Strip: every role and degree, one small card each, the one being read marked -->
    <div ref="strip">
      <UiPanel :title="t('experiencePage.timeline')">
        <nav :aria-label="t('experiencePage.timeline')" class="overflow-x-auto">
          <div ref="baseList" class="relative min-w-max">
            <ol class="flex gap-1">
              <li v-for="item in timeline" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  :data-id="item.id"
                  :aria-current="activeId === item.id ? 'location' : undefined"
                  :class="
                    cn(
                      'panel-card group block p-4 transition-colors hover:border-primary-500/50',
                      item.nested ? 'w-52' : 'w-60',
                    )
                  "
                >
                  <span class="eyebrow block">
                    <span v-if="item.nested" aria-hidden="true">↳</span>
                    <template v-else>{{ String(item.n).padStart(2, '0') }}</template>
                    · {{ yearSpan(item.start, item.end) }}
                  </span>
                  <span class="mt-3 flex items-center gap-3">
                    <NuxtImg
                      v-if="item.logo"
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
                      <span class="block truncate text-xs text-neutral-500 dark:text-neutral-400">{{
                        item.detail
                      }}</span>
                    </span>
                  </span>
                </a>
              </li>
            </ol>
            <span v-if="baseInk" class="ink" :style="baseInk" aria-hidden="true" />
          </div>
        </nav>
      </UiPanel>
    </div>

    <!-- The same strip, compact and fixed under the navbar once the full one has scrolled
         away, while a role or degree is being read. The transition is on the panel itself:
         on the fixed wrapper, its opacity would turn the glass off until the end. -->
    <div class="pointer-events-none fixed inset-x-0 top-24 z-40 px-4 sm:px-6">
      <Transition
        enter-active-class="transition duration-300 ease-out-quint"
        enter-from-class="-translate-y-3 opacity-0"
        leave-active-class="transition duration-200 ease-in"
        leave-to-class="-translate-y-3 opacity-0"
      >
        <nav
          v-if="stripGone && activeId"
          ref="compactNav"
          :aria-label="t('experiencePage.timelineCompact')"
          class="pointer-events-auto panel mx-auto max-w-[61rem] overflow-x-auto scrollbar-none"
        >
          <div ref="compactList" class="relative flex w-max gap-1">
            <a
              v-for="item in timeline"
              :key="item.id"
              :href="`#${item.id}`"
              :data-id="item.id"
              :aria-current="activeId === item.id ? 'location' : undefined"
              class="panel-card flex shrink-0 items-center gap-2 py-1.5 pr-3 pl-1.5 transition-colors hover:border-primary-500/50"
            >
              <NuxtImg
                v-if="item.logo"
                :src="item.logo"
                alt=""
                width="24"
                height="24"
                class="size-6 shrink-0 rounded-md object-cover"
              />
              <span v-else class="eyebrow pl-1" aria-hidden="true">↳</span>
              <span class="text-xs whitespace-nowrap text-neutral-900 dark:text-neutral-100">
                {{ item.name }}
              </span>
              <span class="eyebrow whitespace-nowrap">{{ yearSpan(item.start, item.end) }}</span>
            </a>
            <span v-if="compactInk" class="ink" :style="compactInk" aria-hidden="true" />
          </div>
        </nav>
      </Transition>
    </div>

    <!-- Experience -->
    <section id="experience" aria-labelledby="experience-heading" class="scroll-mt-28">
      <UiPanel>
        <h2
          id="experience-heading"
          class="flex min-h-12 items-center px-4 text-[17px] text-neutral-900 dark:text-neutral-100"
        >
          <UiScrambleText :text="t('experiencePage.experienceLabel')" />
        </h2>
        <!-- A vertical timeline: each role, its projects under it -->
        <ExperienceTimeline>
          <template v-for="exp in EXPERIENCES" :key="exp.id">
            <ExperienceEntry
              :id="exp.id"
              kind="role"
              :start="exp.startDate"
              :end="exp.endDate"
              :title="exp.company"
              :logo="exp.logo"
              :detail="t(`experiences.${exp.key}.role`)"
              :meta="`${period(exp.startDate, exp.endDate)} · ${t(`experiences.${exp.key}.type`)}`"
              :summary="t(`experiencePage.summaries.${exp.key}`)"
              :image="exp.image"
              :stack="exp.technologies"
              :items-label="t('experiencePage.missions')"
              :items="list(`experiences.${exp.key}.tasks`, exp.tasksCount)"
              :links="siteLinks(exp.sites)"
              :active="activeId === exp.id"
            />
            <ExperienceEntry
              v-for="project in projectsOf(exp.id)"
              :id="project.id"
              :key="project.id"
              kind="project"
              :start="project.startDate"
              :end="project.endDate"
              :title="project.name"
              :detail="clientOf(project) ?? exp.company"
              :meta="`${period(project.startDate, project.endDate)} · ${t(`experiencePage.work.${project.key}.role`)}`"
              :summary="t(`experiencePage.work.${project.key}.summary`)"
              :image="project.image"
              :stack="project.technologies"
              :items-label="t('experiencePage.highlights')"
              :items="
                list(`experiencePage.work.${project.key}.highlights`, project.highlightsCount)
              "
              :links="projectLinks(project)"
              :active="activeId === project.id"
            />
          </template>
        </ExperienceTimeline>
      </UiPanel>
    </section>

    <!-- The CV, between the roles and the degrees; only once its address is set -->
    <UiPanel v-if="cvUrl">
      <div class="panel-card flex flex-wrap items-center gap-x-5 gap-y-4 p-5 sm:p-6">
        <span class="icon-box size-11">
          <UIcon name="i-lucide-file-text" class="size-5 text-neutral-500" aria-hidden="true" />
        </span>
        <div class="min-w-0 flex-1">
          <h2 class="text-[17px] text-neutral-900 dark:text-neutral-100">
            {{ t('experiencePage.cv.title') }}
          </h2>
          <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {{ t('experiencePage.cv.text') }}
          </p>
        </div>
        <a :href="cvUrl" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
          <UIcon name="i-heroicons-arrow-down-tray-20-solid" class="size-4" aria-hidden="true" />
          {{ t('experiencePage.cv.download') }}
        </a>
      </div>
    </UiPanel>

    <!-- Education -->
    <section id="education" aria-labelledby="education-heading" class="scroll-mt-28">
      <UiPanel>
        <h2
          id="education-heading"
          class="flex min-h-12 items-center px-4 text-[17px] text-neutral-900 dark:text-neutral-100"
        >
          <UiScrambleText :text="t('experiencePage.educationLabel')" />
        </h2>
        <!-- The same timeline, a diamond per degree -->
        <ExperienceTimeline>
          <ExperienceEntry
            v-for="study in STUDIES"
            :id="study.id"
            :key="study.id"
            kind="degree"
            :start="study.startDate"
            :end="study.endDate"
            :title="study.school"
            :logo="study.logo"
            :detail="`${study.level} · ${t(`studies.${study.key}.degree`)}`"
            :meta="period(study.startDate, study.endDate)"
            :summary="t(`experiencePage.summaries.${study.key}`)"
            :stack="study.technologies"
            :items-label="t('experiencePage.skills')"
            :items="list(`studies.${study.key}.skills`, study.skillsCount)"
            :links="siteLinks(study.sites)"
            :active="activeId === study.id"
          />
        </ExperienceTimeline>
      </UiPanel>
    </section>

    <!-- Open source, shared with /activity -->
    <section id="open-source" aria-labelledby="open-source-heading" class="scroll-mt-28">
      <ActivityOpenSource heading-id="open-source-heading" />
    </section>

    <!-- Availability -->
    <UiPanel>
      <div class="panel-card flex items-center gap-5 p-6 sm:p-8">
        <UiMascot mood="hoodie-cool" :size="72" />
        <div>
          <span class="tag text-green-800 dark:text-green-500">
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
