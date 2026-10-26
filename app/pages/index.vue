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
      <!-- Banner -->
      <HomeBanner />

      <!-- Panels, in one column -->
      <div class="w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6">
        <UiAnimatedSection animation="fadeInUp" :delay="0" :duration="600">
          <UiPanel>
            <HomeHero
              class="panel-card p-5 sm:p-8"
              :name="content.name"
              :titles="content.titles"
              :is-hirable="content.isHirable"
              :calendar-link="content.calendarLink"
              :socials="content.socials"
            />
          </UiPanel>
        </UiAnimatedSection>

        <UiAnimatedSection
          id="about"
          as="section"
          animation="fadeInUp"
          :delay="100"
          :duration="500"
        >
          <UiPanel :label="t('sections.about')">
            <HomeBio :paragraphs="content.bio" class="panel-card p-5 sm:p-6" />
          </UiPanel>
        </UiAnimatedSection>

        <!-- Latest Blog Posts -->
        <UiAnimatedSection
          id="latest-posts"
          as="section"
          animation="fadeInUp"
          :delay="200"
          :duration="500"
        >
          <UiPanel :label="t('sections.blog')">
            <template #actions>
              <NuxtLink to="/blog" class="pill">{{ t('blog.viewAll') }} →</NuxtLink>
            </template>
            <div
              v-if="latestPosts?.length"
              class="panel-card divide-y divide-dashed divide-neutral-200 px-2 dark:divide-neutral-800"
            >
              <NuxtLink
                v-for="post in latestPosts"
                :key="post.path"
                :to="postUrl(post)"
                class="flex items-center gap-6 px-3 py-3.5 group"
              >
                <span
                  v-if="post.publishedAt"
                  class="shrink-0 w-28 text-xs font-mono text-neutral-500"
                >
                  {{ formatDate(post.publishedAt, 'short') }}
                </span>
                <span
                  class="text-sm font-medium text-primary-500 group-hover:text-primary-400 transition-colors truncate"
                >
                  {{ post.title }}
                </span>
              </NuxtLink>
            </div>
          </UiPanel>
        </UiAnimatedSection>

        <!-- Skills & Stack -->
        <UiAnimatedSection id="skills" as="section" :delay="0" :duration="500">
          <UiPanel :label="t('sections.skills')">
            <HomeSkills class="panel-card p-5 sm:p-6" />
          </UiPanel>
        </UiAnimatedSection>

        <!-- Featured Projects -->
        <UiAnimatedSection id="projects" as="section" :delay="0" :duration="500">
          <UiPanel :label="t('sections.projects')">
            <template #actions>
              <a
                href="https://github.com/kbrdn1?tab=repositories"
                target="_blank"
                rel="noopener noreferrer"
                class="pill"
              >
                <UiScrambleText :text="t('projects.viewAll')" effect="link" />
                <UIcon name="i-heroicons-arrow-top-right-on-square" class="size-3.5" />
              </a>
            </template>
            <HomeProjects />
          </UiPanel>
        </UiAnimatedSection>

        <!-- GitHub Activity -->
        <UiAnimatedSection
          id="activity"
          as="section"
          class="scroll-mt-20"
          :delay="0"
          :duration="500"
        >
          <UiPanel :label="t('sections.activity')">
            <HomeGitHubChart username="kbrdn1" class="panel-card p-5 sm:p-6" />
          </UiPanel>
        </UiAnimatedSection>

        <!-- Parcours (Experience + Education) -->
        <UiAnimatedSection id="experience" as="section" :delay="0" :duration="500">
          <UiPanel :label="t('sections.parcours')">
            <HomeParcours class="panel-card p-5 sm:p-6" />
          </UiPanel>
        </UiAnimatedSection>

        <!-- Explore: the carousel as an image card; its own top border goes -->
        <UiPanel>
          <div class="overflow-hidden rounded-2xl [&>section]:border-t-0">
            <HomeExplore />
          </div>
        </UiPanel>
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
