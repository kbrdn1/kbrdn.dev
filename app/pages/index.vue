<script setup lang="ts">
import { useI18n } from "#imports";

const { t } = useI18n();

// Use minimal layout without header/footer
definePageMeta({
  layout: "minimal",
});

// Fetch homepage content from pages collection
const { data: page } = await useAsyncData("home", () =>
  queryCollection("pages").path("/").first(),
);

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
  ogImage: "/og-image.png",
  twitterCard: "summary_large_image",
});

// Default social links with more platforms
const defaultSocials = [
  { platform: "github", url: "https://github.com/kbrdn1", label: "GitHub" },
  { platform: "twitter", url: "https://twitter.com/kbrdn1", label: "Twitter" },
  {
    platform: "linkedin",
    url: "https://linkedin.com/in/kbrdn1",
    label: "LinkedIn",
  },
  { platform: "medium", url: "https://medium.com/@kbrdn1", label: "Medium" },
  { platform: "behance", url: "https://behance.net/kbrdn1", label: "Behance" },
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
        socials.medium
          ? { platform: "medium", url: socials.medium, label: "Medium" }
          : null,
        socials.behance
          ? { platform: "behance", url: socials.behance, label: "Behance" }
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
      "Hey, I'm Kylian, a full stack developer who loves building clean, modern websites and apps where design, functionality, and even the smallest details matter, with a focus on making products that are both practical and visually satisfying.",
      "Currently focused on building solid, scalable architectures. I enjoy exploring new languages and tools — from Rust to cloud infrastructure — always looking for the right solution, not just the trendy one.",
    ],
    socials: socialLinks,
  };
});
</script>

<template>
  <div class="min-h-screen flex justify-center overflow-x-hidden">
    <!-- Left stripe zone -->
    <div
      class="hidden md:block fixed left-0 top-0 bottom-0 grid-background -z-1"
      style="width: calc(50% - 40rem); border-right: 1px solid var(--border-color);"
    />

    <!-- Main content -->
    <div class="w-full flex flex-col items-center relative z-10">
      <!-- Banner -->
      <HomeBanner />

      <!-- Hero Section - Full width with horizontal dashed border -->
      <section class="p-6 border-dashed-horizontal border-y border-neutral-200 dark:border-neutral-800 w-full ">
        <span class="corner-bottom-left" />
        <span class="corner-bottom-right" />
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
      </main>

      <!-- Skills & Stack -->
      <section id="skills" class="p-6 border-dashed-horizontal border-y border-neutral-200 dark:border-neutral-800 w-full">
        <span class="corner-bottom-left" />
        <span class="corner-bottom-right" />
        <UiAnimatedSection :delay="0" :duration="500">
          <div class="max-w-5xl mx-auto min-md:px-6">
            <HomeSkills />
          </div>
        </UiAnimatedSection>
      </section>

      <!-- Featured Projects -->
      <section id="projects" class="p-6 border-dashed-horizontal border-y border-neutral-200 dark:border-neutral-800 w-full">
        <span class="corner-bottom-left" />
        <span class="corner-bottom-right" />
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

      <!-- Experience -->
      <div class="p-6 space-y-6 w-full max-w-5xl min-md:px-6">
        <UiAnimatedSection
          id="experience"
          as="section"
          animation="fadeInUp"
          :delay="0"
          :duration="500"
        >
          <HomeSectionLabel :label="t('sections.experience')" />
          <HomeExperiences />
        </UiAnimatedSection>
      </div>

      <!-- Education -->
      <div id="education" class="p-6 space-y-6 w-full max-w-5xl min-md:px-6">
        <UiAnimatedSection
          as="section"
          animation="fadeInUp"
          :delay="0"
          :duration="500"
        >
          <HomeSectionLabel :label="t('sections.education')" />
          <HomeStudies />
        </UiAnimatedSection>
      </div>

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
      class="hidden md:block fixed right-0 top-0 bottom-0 grid-background -z-1"
      style="width: calc(50% - 40rem); border-left: 1px solid var(--border-color);"
    />
  </div>
</template>
