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
const { postUrl } = useBlogUrl()

// SEO metadata
useSeoMeta({
  title: page.value?.title
    ? `${page.value.title} - Full Stack Developer`
    : 'Kylian Bardini - Full Stack Developer',
  description:
    page.value?.bio?.[0] ||
    'Developer, Designer, Creator. Building elegant, performant applications that solve real problems and delight users.',
  ogTitle: page.value?.title || 'Kylian Bardini - Full Stack Developer',
  ogDescription:
    page.value?.bio?.[0] || 'Developer, Designer, Creator. Building things for the web.',
  twitterCard: 'summary_large_image',
})

if (import.meta.server) {
  const requestUrl = useRequestURL()
  const siteOrigin = requestUrl.origin

  defineOgImage('Default', {
    title: page.value?.title || 'Kylian Bardini',
    subtitle: page.value?.titles?.[0] || 'Full Stack Developer',
    handle: page.value?.handle || '@kbrdn1',
    isHirable: page.value?.isHirable ?? true,
    statusText: t('hero.availableForHire'),
    avatarUrl: `${siteOrigin}/images/avatar.png`,
    bannerText: t('banner.gwm'),
    bannerImage: `${siteOrigin}/images/banners/dark.jpg`,
  })
}

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
        <UiAnimatedSection animation="fadeInUp" :delay="0" :duration="600">
          <HomeHero
            :name="content.name"
            :titles="content.titles"
            :handle="content.handle"
            :is-hirable="content.isHirable"
            :calendar-link="content.calendarLink"
            :socials="content.socials"
          />
        </UiAnimatedSection>

        <UiAnimatedSection
          id="about"
          as="section"
          animation="fadeInUp"
          :delay="100"
          :duration="500"
        >
          <UiPanel :title="t('bio.title')">
            <HomeBio :paragraphs="content.bio" class="panel-card p-5 sm:p-6" />
          </UiPanel>
        </UiAnimatedSection>

        <!-- Latest Blog Posts: a list, dashed rows, the date in mono -->
        <UiAnimatedSection
          id="latest-posts"
          as="section"
          animation="fadeInUp"
          :delay="200"
          :duration="500"
        >
          <UiPanel :title="t('blog.title')">
            <ul
              v-if="latestPosts?.length"
              class="panel-card divide-y divide-dashed divide-neutral-200 px-5 dark:divide-neutral-800"
            >
              <li v-for="post in latestPosts" :key="post.path">
                <NuxtLink :to="postUrl(post)" class="group flex items-center gap-6 py-3.5">
                  <span v-if="post.publishedAt" class="eyebrow w-28 shrink-0">
                    {{ formatDate(post.publishedAt, 'short') }}
                  </span>
                  <span
                    class="truncate text-sm text-neutral-900 transition-colors group-hover:text-primary-500 dark:text-neutral-100"
                  >
                    {{ post.title }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
            <template #footer>
              <NuxtLink to="/blog" class="btn btn-outline btn-sm">
                {{ t('blog.viewAll') }}
                <UIcon name="i-heroicons-arrow-right-20-solid" class="size-4" aria-hidden="true" />
              </NuxtLink>
            </template>
          </UiPanel>
        </UiAnimatedSection>

        <!-- Skills & Stack -->
        <UiAnimatedSection id="skills" as="section" :delay="0" :duration="500">
          <UiPanel :title="t('skills.title')">
            <HomeSkills class="panel-card p-5 sm:p-6" />
          </UiPanel>
        </UiAnimatedSection>

        <!-- Featured Projects -->
        <UiAnimatedSection id="projects" as="section" :delay="0" :duration="500">
          <UiPanel :title="t('projects.title')">
            <HomeProjects />
            <template #meta>github.com/kbrdn1</template>
            <template #footer>
              <a
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
            </template>
          </UiPanel>
        </UiAnimatedSection>

        <!-- GitHub Activity: the chart is its own panel, its tabs in the header -->
        <UiAnimatedSection
          id="activity"
          as="section"
          class="scroll-mt-24"
          :delay="0"
          :duration="500"
        >
          <HomeGitHubChart username="kbrdn1" />
        </UiAnimatedSection>

        <!-- Parcours (Experience + Education) -->
        <UiAnimatedSection id="experience" as="section" :delay="0" :duration="500">
          <UiPanel :title="t('nav.experience')">
            <HomeParcours class="panel-card p-5 sm:p-6" />
            <template #footer>
              <NuxtLink to="/experience" class="btn btn-outline btn-sm">
                <UiScrambleText :text="t('experiencePage.teaserCta')" effect="link" />
                <UIcon name="i-heroicons-arrow-right-20-solid" class="size-4" aria-hidden="true" />
              </NuxtLink>
            </template>
          </UiPanel>
        </UiAnimatedSection>

        <!-- Explore: a carousel, its own panel -->
        <HomeExplore />
      </div>

      <!-- Footer -->
      <UiAnimatedSection
        as="section"
        animation="fadeInUp"
        :delay="0"
        :duration="500"
        class="w-full"
      >
        <LayoutFooter />
      </UiAnimatedSection>
    </div>
  </div>
</template>
