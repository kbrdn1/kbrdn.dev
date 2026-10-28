<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
const { locale, collection } = useBlogCollection()

// Use minimal layout without header/footer
definePageMeta({
  layout: 'minimal',
})

// Fetch homepage content from pages collection
const { data: page } = await useAsyncData('home', () => queryCollection('pages').path('/').first())

// Fetch latest blog posts (5 most recent) for the active locale
const { data: latestPosts } = await useAsyncData(
  'latest-posts',
  () => queryCollection(collection.value).order('publishedAt', 'DESC').limit(5).all(),
  { watch: [locale] },
)

const { formatDate } = useFormatDate()

// Featured projects: personal (the repositories pinned on GitHub) or professional (the
// Jewely x Flippad projects of /experience)
const TABS = ['perso', 'pro'] as const
const featured = ref<(typeof TABS)[number]>('perso')
function switchTab(step: number) {
  const next = TABS[(TABS.indexOf(featured.value) + step + TABS.length) % TABS.length]!
  featured.value = next
  nextTick(() => document.getElementById(`featured-${next}`)?.focus())
}
const { postUrl } = useBlogUrl()

// SEO metadata: the site's own words (no `pages` entry backs the home)
useSeoMeta({
  title: () => t('seo.title'),
  description: () => t('seo.description'),
  ogTitle: () => t('seo.title'),
  ogDescription: () => t('seo.description'),
  twitterCard: 'summary_large_image',
})
const person = usePersonRef()
usePageSchema('ProfilePage', () => ({
  name: t('seo.title'),
  description: t('seo.description'),
  mainEntity: person,
}))

useSiteOgImage('Default', {
  title: page.value?.title || 'Kylian Bardini',
  subtitle: page.value?.titles?.[0] || t('seo.jobTitle'),
  handle: page.value?.handle || '@kbrdn1',
  isHirable: page.value?.isHirable ?? true,
  figures: CAREER_FIGURES.map((figure) => ({
    label: t(`experiencePage.figures.${figure.key}`),
    value: figure.value,
  })),
})

// Default social links with more platforms
const defaultSocials = [
  { platform: 'github', url: 'https://github.com/kbrdn1', label: 'GitHub' },
  { platform: 'twitter', url: 'https://twitter.com/kbrdn1', label: 'Twitter' },
  {
    platform: 'linkedin',
    url: 'https://linkedin.com/in/kylian-bardini-aa0528234',
    label: 'LinkedIn',
  },
]

// Default content if not found
const content = computed(() => {
  const socials = page.value?.socials
  const socialLinks = socials
    ? [
        socials.github ? { platform: 'github', url: socials.github, label: 'GitHub' } : null,
        socials.twitter ? { platform: 'twitter', url: socials.twitter, label: 'Twitter' } : null,
        socials.linkedin
          ? { platform: 'linkedin', url: socials.linkedin, label: 'LinkedIn' }
          : null,
      ].filter((link) => link !== null)
    : defaultSocials

  return {
    name: page.value?.title || 'Kylian Bardini',
    titles: page.value?.titles || [
      'TypeScript Expert',
      'Laravel Developer',
      'Rust Beginner',
      'Nuxt Developer',
      'AWS & Cloud Architecture',
      'Building Proper & Efficient Architecture',
    ],
    handle: page.value?.handle || '@kbrdn1',
    isHirable: page.value?.isHirable ?? true,
    email: page.value?.email || 'hello@kbrdn.dev',
    calendarLink: page.value?.calendarLink || 'https://cal.com',
    bio: page.value?.bio || [t('bio.paragraph1'), t('bio.paragraph2')],
    socials: socialLinks,
  }
})
</script>

<template>
  <div class="flex justify-center overflow-x-clip">
    <!-- Table of contents, in the margin outside the column (wide screens only) -->
    <HomeToc />

    <!-- Main content -->
    <div class="w-full flex flex-col items-center relative z-10">
      <!-- Panels, in one column -->
      <div class="w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        <HomeHero
          :name="content.name"
          :titles="content.titles"
          :handle="content.handle"
          :is-hirable="content.isHirable"
          :calendar-link="content.calendarLink"
          :socials="content.socials"
        />

        <section id="about">
          <UiPanel :title="t('bio.title')">
            <div class="panel-card relative p-5 sm:p-6">
              <HomeBio :paragraphs="content.bio" />
              <!-- The camera, beside the figures -->
              <UiCameo name="camera" place="area" />
              <!-- The career in four figures, rolling in (app/utils/career.ts) -->
              <dl
                class="mt-6 grid grid-cols-2 gap-5 border-t border-dashed border-(--card-border) pt-5 md:grid-cols-4 md:gap-0 md:divide-x md:divide-dashed md:divide-(--card-border)"
              >
                <div
                  v-for="figure in CAREER_FIGURES"
                  :key="figure.key"
                  class="md:px-5 md:first:pl-0 md:last:pr-0"
                >
                  <dt class="eyebrow">{{ t(`experiencePage.figures.${figure.key}`) }}</dt>
                  <dd class="mt-1 text-3xl tracking-tight text-neutral-900 dark:text-neutral-100">
                    <UiRollingNumber :value="figure.value" />
                  </dd>
                </div>
              </dl>
            </div>
          </UiPanel>
        </section>

        <!-- Latest Blog Posts: a list, dashed rows, the date in mono -->
        <section id="latest-posts">
          <UiPanel :title="t('blog.title')">
            <!-- The pencil writes beside the titles -->
            <div class="relative">
              <ul
                v-if="latestPosts?.length"
                class="panel-card divide-y divide-dashed divide-neutral-200 px-5 dark:divide-neutral-800"
              >
                <li v-for="post in latestPosts" :key="post.path">
                  <NuxtLinkLocale :to="postUrl(post)" class="group flex items-center gap-6 py-3.5">
                    <span v-if="post.publishedAt" class="eyebrow w-28 shrink-0">
                      {{ formatDate(post.publishedAt, 'short') }}
                    </span>
                    <span
                      class="truncate text-sm text-neutral-900 transition-colors group-hover:text-primary-500 dark:text-neutral-100"
                    >
                      {{ post.title }}
                    </span>
                  </NuxtLinkLocale>
                </li>
              </ul>
              <UiCameo name="pencil" place="area" />
            </div>
            <template #footer>
              <NuxtLinkLocale to="/blog" class="btn btn-outline btn-sm">
                {{ t('blog.viewAll') }}
                <UIcon name="i-heroicons-arrow-right-20-solid" class="size-4" aria-hidden="true" />
              </NuxtLinkLocale>
            </template>
          </UiPanel>
        </section>

        <!-- Skills & Stack -->
        <section id="skills">
          <UiPanel :title="t('skills.title')">
            <!-- The gears turn beside the rows of tools -->
            <div class="relative">
              <HomeSkills class="panel-card p-5 sm:p-6" />
              <UiCameo name="tools" place="area" />
            </div>
          </UiPanel>
        </section>

        <!-- Featured Projects -->
        <section id="projects">
          <UiPanel :title="t('projects.title')" cameo="rocket" cameo-at="footer">
            <template #actions>
              <div class="segmented" role="tablist" :aria-label="t('projects.title')">
                <button
                  v-for="tab in TABS"
                  :id="`featured-${tab}`"
                  :key="tab"
                  type="button"
                  role="tab"
                  class="segment"
                  :aria-selected="featured === tab"
                  :aria-controls="`featured-${tab}-panel`"
                  :tabindex="featured === tab ? 0 : -1"
                  @click="featured = tab"
                  @keydown.right.prevent="switchTab(1)"
                  @keydown.left.prevent="switchTab(-1)"
                >
                  {{ t(`projects.tabs.${tab}`) }}
                </button>
                <UiSegmentInk />
              </div>
            </template>
            <UiAutoHeight>
              <Transition :name="featured === 'pro' ? 'swap-next' : 'swap-prev'" mode="out-in">
                <div
                  :id="`featured-${featured}-panel`"
                  :key="featured"
                  role="tabpanel"
                  :aria-labelledby="`featured-${featured}`"
                >
                  <HomeProjects v-if="featured === 'perso'" />
                  <HomeWork v-else />
                </div>
              </Transition>
            </UiAutoHeight>
            <template #meta>
              {{ featured === 'perso' ? 'github.com/kbrdn1' : 'Jewely x Flippad' }}
            </template>
            <template #footer>
              <a
                v-if="featured === 'perso'"
                href="https://github.com/kbrdn1?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-outline btn-sm"
              >
                <UiScrambleText :text="t('projects.viewAll')" effect="link" />
                <UIcon
                  name="i-heroicons-arrow-top-right-on-square"
                  class="size-4"
                  aria-hidden="true"
                />
              </a>
              <NuxtLinkLocale
                v-else
                :to="{ name: 'experience', hash: '#experience' }"
                class="btn btn-outline btn-sm"
              >
                <UiScrambleText :text="t('experiencePage.teaserCta')" effect="link" />
                <UIcon name="i-heroicons-arrow-right-20-solid" class="size-4" aria-hidden="true" />
              </NuxtLinkLocale>
            </template>
          </UiPanel>
        </section>

        <!-- GitHub Activity: the chart is its own panel, its tabs in the header -->
        <section id="activity" class="scroll-mt-24">
          <HomeGitHubChart username="kbrdn1" />
        </section>

        <!-- Parcours (Experience + Education) -->
        <section id="experience">
          <UiPanel :title="t('nav.experience')" cameo="climb" cameo-at="footer">
            <HomeParcours class="panel-card p-5 sm:p-6" />
            <template #footer>
              <NuxtLinkLocale :to="{ name: 'experience' }" class="btn btn-outline btn-sm">
                <UiScrambleText :text="t('experiencePage.teaserCta')" effect="link" />
                <UIcon name="i-heroicons-arrow-right-20-solid" class="size-4" aria-hidden="true" />
              </NuxtLinkLocale>
            </template>
          </UiPanel>
        </section>

        <!-- Explore: a carousel, its own panel -->
        <HomeExplore />
      </div>
    </div>
  </div>
</template>
