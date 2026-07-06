<script setup lang="ts">
import { useI18n } from "#imports";

const { t } = useI18n();
const { locale, collection } = useBlogCollection();

// Use minimal layout without header/footer
definePageMeta({
  layout: "minimal",
});

// Fetch homepage content from pages collection
const { data: page } = await useAsyncData("home", () =>
  queryCollection("pages").path("/").first(),
);

// Fetch latest blog posts (5 most recent) for the active locale
const { data: latestPosts } = await useAsyncData(
  "latest-posts",
  () => queryCollection(collection.value).order("publishedAt", "DESC").limit(5).all(),
  { watch: [locale] },
);

const { formatDate } = useFormatDate();
const { postUrl } = useBlogUrl();

// SEO metadata
useSeoMeta({
  title: page.value?.title
    ? `${page.value.title} - Full Stack Developer`
    : "Kylian Bardini - Full Stack Developer",
  description:
    page.value?.bio?.[0] ||
    "Developer, Designer, Creator. Building elegant, performant applications that solve real problems and delight users.",
  ogTitle: page.value?.title || "Kylian Bardini - Full Stack Developer",
  ogDescription:
    page.value?.bio?.[0] ||
    "Developer, Designer, Creator. Building things for the web.",
  twitterCard: "summary_large_image",
});

if (import.meta.server) {
  const requestUrl = useRequestURL()
  const siteOrigin = requestUrl.origin

  defineOgImage('Default', {
    title: page.value?.title || 'Kylian Bardini',
    subtitle: page.value?.titles?.[0] || 'Full Stack Developer',
    handle: page.value?.handle || '@kbrdn1',
    isHirable: page.value?.isHirable ?? true,
    statusText: t('hero.availableForHire'),
    avatarUrl: `${siteOrigin}/images/avatar.jpg`,
    bannerText: t('banner.gwm'),
    bannerImage: `${siteOrigin}/images/banners/dark.jpg`,
  });
}

// Default social links with more platforms
const defaultSocials = [
  { platform: "github", url: "https://github.com/kbrdn1", label: "GitHub" },
  { platform: "twitter", url: "https://twitter.com/kbrdn1", label: "Twitter" },
  {
    platform: "linkedin",
    url: "https://linkedin.com/in/kylian-bardini-aa0528234",
    label: "LinkedIn",
  },
];

// Default content if not found
const content = computed(() => {
  const socials = page.value?.socials;
  const socialLinks = socials
    ? [
        socials.github
          ? { platform: "github", url: socials.github, label: "GitHub" }
          : null,
        socials.twitter
          ? { platform: "twitter", url: socials.twitter, label: "Twitter" }
          : null,
        socials.linkedin
          ? { platform: "linkedin", url: socials.linkedin, label: "LinkedIn" }
          : null,
      ].filter(Boolean)
    : defaultSocials;

  return {
    name: page.value?.title || "Kylian Bardini",
    titles: page.value?.titles || [
      "TypeScript Expert",
      "Laravel Developer",
      "Rust Beginner",
      "Nuxt Developer",
      "AWS & Cloud Architecture",
      "Building Proper & Efficient Architecture",
    ],
    handle: page.value?.handle || "@kbrdn1",
    isHirable: page.value?.isHirable ?? true,
    email: page.value?.email || "hello@kbrdn.dev",
    calendarLink: page.value?.calendarLink || "https://cal.com",
    githubUrl: socials?.github || "https://github.com/kbrdn1",
    bio: page.value?.bio || [
      t('bio.paragraph1'),
      t('bio.paragraph2'),
    ],
    socials: socialLinks,
  };
});
</script>

<template>
  <div class="flex justify-center overflow-x-clip">
    <!-- Left stripe zone -->
    <div
      class="hidden md:block fixed left-0 top-0 bottom-0 grid-background -z-1" aria-hidden="true"
      style="width: calc(50% - 40rem); border-right: 1px solid var(--border-color);"
    />

    <!-- Main content -->
    <div class="w-full flex flex-col items-center relative z-10">
      <!-- Banner -->
      <HomeBanner />

      <!-- Hero Section - Full width with horizontal dashed border -->
      <section class="p-6 border-dashed-horizontal border-y border-neutral-200 dark:border-neutral-800 w-full ">
        <span class="corner-bottom-left" aria-hidden="true" />
        <span class="corner-bottom-right" aria-hidden="true" />
        <UiAnimatedSection animation="fadeInUp" :delay="0" :duration="600">
          <HomeHero
            :name="content.name"
            :titles="content.titles"
            :is-hirable="content.isHirable"
            :github-url="content.githubUrl"
            :calendar-link="content.calendarLink"
          />
        </UiAnimatedSection>
      </section>

      <!-- About section -->
      <main class="p-6 space-y-6 w-full max-w-5xl min-md:px-6">
        <UiAnimatedSection
          id="about"
          as="section"
          animation="fadeInUp"
          :delay="100"
          :duration="500"
        >
          <HomeSectionLabel :label="t('sections.about')" />
          <HomeBio :paragraphs="content.bio" />
          <HomeNowPlaying />
        </UiAnimatedSection>

        <UiAnimatedSection
          as="section"
          animation="fadeInUp"
          :delay="150"
          :duration="500"
        >
          <HomeSectionLabel :label="t('sections.connect')" />
          <HomeSocials :links="content.socials" />
        </UiAnimatedSection>

        <!-- Latest Blog Posts -->
        <UiAnimatedSection
          as="section"
          animation="fadeInUp"
          :delay="200"
          :duration="500"
        >
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-[11px] font-mono uppercase tracking-widest text-sky-400">
              {{ t('sections.blog') }}
            </h2>
            <NuxtLink
              to="/blog"
              class="text-[10px] font-mono uppercase tracking-wider text-neutral-500 hover:text-sky-400 transition-colors"
            >
              {{ t('blog.viewAll') }} →
            </NuxtLink>
          </div>
          <div v-if="latestPosts?.length" class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <NuxtLink
              v-for="post in latestPosts"
              :key="post.path"
              :to="postUrl(post)"
              class="flex items-center gap-6 py-3 group transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 -mx-3 px-3"
            >
              <span
                v-if="post.publishedAt"
                class="shrink-0 w-28 text-xs font-mono text-neutral-500"
              >
                {{ formatDate(post.publishedAt, 'short') }}
              </span>
              <span class="text-sm font-medium text-primary-500 group-hover:text-primary-400 transition-colors truncate">
                {{ post.title }}
              </span>
            </NuxtLink>
          </div>
        </UiAnimatedSection>
      </main>

      <!-- Skills & Stack -->
      <section id="skills" class="p-6 border-dashed-horizontal border-y border-neutral-200 dark:border-neutral-800 w-full">
        <span class="corner-bottom-left" aria-hidden="true" />
        <span class="corner-bottom-right" aria-hidden="true" />
        <UiAnimatedSection :delay="0" :duration="500">
          <div class="max-w-5xl mx-auto min-md:px-6">
            <HomeSkills />
          </div>
        </UiAnimatedSection>
      </section>

      <!-- Featured Projects -->
      <section id="projects" class="p-6 border-dashed-horizontal border-y border-neutral-200 dark:border-neutral-800 w-full">
        <span class="corner-bottom-left" aria-hidden="true" />
        <span class="corner-bottom-right" aria-hidden="true" />
        <UiAnimatedSection :delay="0" :duration="500">
          <div class="max-w-5xl mx-auto min-md:px-6">
            <HomeSectionLabel :label="t('sections.projects')" />
            <ClientOnly>
              <HomeProjects />
              <template #fallback>
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <UiSkeleton class="h-6 w-40" />
                    <UiSkeleton class="h-5 w-5" />
                  </div>
                  <div class="space-y-3">
                    <div
                      v-for="i in 2"
                      :key="i"
                      class="p-4 border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 space-y-4"
                    >
                      <UiSkeleton class="h-5 w-24" />
                      <UiSkeleton class="h-2 w-full" />
                    </div>
                  </div>
                </div>
              </template>
            </ClientOnly>

            <!-- GitHub Activity -->
            <div class="mt-8">
              <HomeSectionLabel :label="t('sections.activity')" />
              <ClientOnly>
                <HomeGitHubChart username="kbrdn1" />
                <template #fallback>
                  <div class="space-y-6">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <UiSkeleton class="h-6 w-32" />
                      <UiSkeleton class="h-6 w-32" />
                    </div>
                    <div class="flex gap-8">
                      <UiSkeleton class="h-9 w-20" />
                      <UiSkeleton class="h-9 w-24" />
                    </div>
                  </div>
                </template>
              </ClientOnly>
            </div>
          </div>
        </UiAnimatedSection>
      </section>

      <!-- Parcours (Experience + Education) - Full width -->
      <section id="experience" class="p-6 border-dashed-horizontal border-y border-neutral-200 dark:border-neutral-800 w-full">
        <span class="corner-bottom-left" aria-hidden="true" />
        <span class="corner-bottom-right" aria-hidden="true" />
        <UiAnimatedSection :delay="0" :duration="500">
          <div class="max-w-5xl mx-auto min-md:px-6 space-y-8">
            <HomeSectionLabel :label="t('sections.parcours')" />

            <div>
              <h3 class="block text-[11px] font-mono uppercase tracking-widest text-primary-500 mb-2">
                {{ t('sections.experience') }}
              </h3>
              <HomeExperiences />
            </div>

            <div id="education">
              <h3 class="block text-[11px] font-mono uppercase tracking-widest text-primary-500 mb-2">
                {{ t('sections.education') }}
              </h3>
              <HomeStudies />
            </div>
          </div>
        </UiAnimatedSection>
      </section>

      <!-- Explore Section -->
      <HomeExplore />

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

    <!-- Right stripe zone -->
    <div
      class="hidden md:block fixed right-0 top-0 bottom-0 grid-background -z-1" aria-hidden="true"
      style="width: calc(50% - 40rem); border-left: 1px solid var(--border-color);"
    />
  </div>
</template>
