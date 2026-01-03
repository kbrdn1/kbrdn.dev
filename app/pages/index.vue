<script setup lang="ts">
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
    ? `${page.value.title} - Web Engineer`
    : "Kylian Bardini - Web Engineer",
  description:
    page.value?.bio?.[0] ||
    "Developer, Designer, Creator. Building elegant, performant applications that solve real problems and delight users.",
  ogTitle: page.value?.title || "Kylian Bardini - Web Engineer",
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
    title: page.value?.description || "1/3 Design Engineer",
    handle: page.value?.handle || "@kbrdn1",
    isHirable: page.value?.isHirable ?? true,
    email: page.value?.email || "hello@kbrdn.dev",
    calendarLink: page.value?.calendarLink || "https://cal.com",
    bio: page.value?.bio || [
      "Hey, I'm Kylian, a full stack developer who loves building clean, modern websites and apps where design, functionality, and even the smallest details matter, with a focus on making products that are both practical and visually satisfying.",
      "Tech stack isn't my concern, I'm flexible with whatever the project needs, though I prefer modern frameworks and tools. I'm always open for new opportunities to learn and grow.",
    ],
    socials: socialLinks,
  };
});
</script>

<template>
  <div class="min-h-screen flex justify-center overflow-x-hidden">
    <!-- Left border - full height -->
    <div
      class="hidden md:block w-px border-dashed-vertical fixed left-[calc(50%-21rem)] top-0 bottom-0"
    />

    <!-- Main content -->
    <div class="w-full flex flex-col items-center min-md:mt-26">
      <!-- Hero Section - Full width with horizontal dashed border -->
      <section class="p-6 border-dashed-horizontal w-full">
        <UiAnimatedSection animation="fadeInUp" :delay="0" :duration="600">
          <HomeHero
            class="max-w-2xl mx-auto min-md:px-6"
            :name="content.name"
            :title="content.title"
            :is-hirable="content.isHirable"
          />
        </UiAnimatedSection>
      </section>

      <!-- Other sections -->
      <main class="p-6 space-y-6 w-full max-w-2xl">
        <!-- Bio Section -->
        <UiAnimatedSection
          as="section"
          animation="fadeInUp"
          :delay="100"
          :duration="500"
        >
          <HomeBio :paragraphs="content.bio" />
        </UiAnimatedSection>

        <!-- Action Buttons -->
        <UiAnimatedSection
          as="section"
          animation="fadeInUp"
          :delay="150"
          :duration="500"
        >
          <HomeActions
            :calendar-link="content.calendarLink"
            :email="content.email"
          />
        </UiAnimatedSection>

        <!-- Social Links -->
        <UiAnimatedSection
          as="section"
          animation="fadeInUp"
          :delay="200"
          :duration="500"
        >
          <HomeSocials :links="content.socials" />
        </UiAnimatedSection>

        <!-- GitHub Contribution Chart -->
        <UiAnimatedSection
          as="section"
          animation="fadeInUp"
          :delay="0"
          :duration="500"
        >
          <ClientOnly>
            <HomeGitHubChart username="kbrdn1" />
            <template #fallback>
              <div class="space-y-6">
                <!-- Header skeleton -->
                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <UiSkeleton class="h-6 w-32" />
                  <div class="flex items-center gap-4">
                    <UiSkeleton class="h-6 w-32" />
                    <UiSkeleton class="h-5 w-5" />
                  </div>
                </div>
                <!-- Stats skeleton -->
                <div class="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  <div class="space-y-2">
                    <UiSkeleton class="h-3 w-28" />
                    <UiSkeleton class="h-9 w-20" />
                  </div>
                  <div class="space-y-2">
                    <UiSkeleton class="h-3 w-24" />
                    <UiSkeleton class="h-9 w-24" />
                  </div>
                </div>
                <!-- Grid skeleton with month labels -->
                <div class="overflow-x-auto">
                  <div class="min-w-max">
                    <!-- Month labels skeleton -->
                    <div class="flex gap-1 mb-1">
                      <UiSkeleton
                        v-for="i in 12"
                        :key="i"
                        class="h-3"
                        :style="{ width: '65px' }"
                      />
                    </div>
                    <!-- Grid skeleton -->
                    <div class="flex gap-[3px]">
                      <div
                        v-for="w in 52"
                        :key="w"
                        class="flex flex-col gap-[3px]"
                      >
                        <UiSkeleton v-for="d in 7" :key="d" class="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </ClientOnly>
        </UiAnimatedSection>

        <!-- Experiences -->
        <UiAnimatedSection
          as="section"
          animation="fadeInUp"
          :delay="0"
          :duration="500"
        >
          <HomeExperiences />
        </UiAnimatedSection>
      </main>

      <!-- Featured Projects - Full width with horizontal dashed border -->
      <section class="p-6 border-dashed-horizontal w-full">
        <UiAnimatedSection :delay="0" :duration="500">
          <div class="max-w-2xl mx-auto min-md:px-6">
            <ClientOnly>
              <HomeProjects />
              <template #fallback>
                <div class="space-y-4">
                  <!-- Header skeleton -->
                  <div class="flex items-center justify-between">
                    <UiSkeleton class="h-6 w-40" />
                    <UiSkeleton class="h-5 w-5" />
                  </div>
                  <!-- Project cards skeleton -->
                  <div class="space-y-3">
                    <div
                      v-for="i in 2"
                      :key="i"
                      class="p-4 border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 space-y-4"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <UiSkeleton class="h-5 w-24" />
                          <UiSkeleton class="h-4 w-32" />
                        </div>
                        <div class="flex items-center gap-2">
                          <UiSkeleton class="h-6 w-14" />
                          <UiSkeleton class="h-6 w-6" />
                        </div>
                      </div>
                      <div class="flex gap-8">
                        <div class="space-y-1">
                          <UiSkeleton class="h-3 w-12" />
                          <UiSkeleton class="h-6 w-8" />
                        </div>
                      </div>
                      <UiSkeleton class="h-2 w-full" />
                    </div>
                  </div>
                </div>
              </template>
            </ClientOnly>
          </div>
        </UiAnimatedSection>
      </section>

      <!-- Studies -->
      <main class="p-6 space-y-6 w-full max-w-2xl">
        <UiAnimatedSection
          as="section"
          animation="fadeInUp"
          :delay="0"
          :duration="500"
        >
          <HomeStudies />
        </UiAnimatedSection>
      </main>

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

    <!-- Right border - full height -->
    <div
      class="hidden md:block w-px border-dashed-vertical fixed right-[calc(50%-21rem)] top-0 bottom-0"
    />
  </div>
</template>
