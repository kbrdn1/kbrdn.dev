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

const years = (item: { start: string; end: string | null }) =>
  `${item.start.slice(0, 4)}–${item.end ? item.end.slice(0, 4) : ''}`

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

    <!-- Strip: every role and degree, one small card each, the one being read marked -->
    <div ref="strip">
      <UiPanel :title="t('experiencePage.timeline')">
        <nav :aria-label="t('experiencePage.timeline')" class="overflow-x-auto">
          <div ref="baseList" class="relative min-w-max">
            <ol class="flex gap-1">
              <li v-for="(item, i) in timeline" :key="item.id">
                <a
                  :href="`#${item.id}`"
                  :data-id="item.id"
                  :aria-current="activeId === item.id ? 'location' : undefined"
                  class="panel-card group block w-60 p-4 transition-colors hover:border-primary-500/50"
                >
                  <span class="eyebrow block">
                    {{ String(i + 1).padStart(2, '0') }} · {{ years(item) }}
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
          :aria-label="t('experiencePage.timeline')"
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
                :src="item.logo"
                alt=""
                width="24"
                height="24"
                class="size-6 shrink-0 rounded-md object-cover"
              />
              <span class="text-xs whitespace-nowrap text-neutral-900 dark:text-neutral-100">
                {{ item.name }}
              </span>
              <span class="eyebrow whitespace-nowrap">{{ years(item) }}</span>
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

    <!-- Open source, shared with /activity -->
    <section id="open-source" aria-labelledby="open-source-heading" class="scroll-mt-28">
      <ActivityOpenSource heading-id="open-source-heading" />
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
