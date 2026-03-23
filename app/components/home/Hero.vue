<script setup lang="ts">
import { useI18n } from "#imports";

const { t } = useI18n();

interface Props {
  name: string;
  titles: string[];
  handle?: string;
  avatarUrl?: string;
  isHirable?: boolean;
  githubUrl?: string;
  calendarLink?: string;
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: "/images/avatar.jpg",
  isHirable: true,
  githubUrl: "https://github.com/kbrdn1",
  calendarLink: "https://cal.com",
});

const initials = computed(() => {
  return props.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

const imageError = ref(false);

const currentTitleIndex = ref(0);
const isTransitioning = ref(false);

const currentTitle = computed(() => props.titles[currentTitleIndex.value] || "");

let interval: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  if (props.titles.length > 1) {
    interval = setInterval(() => {
      isTransitioning.value = true;
      setTimeout(() => {
        currentTitleIndex.value =
          (currentTitleIndex.value + 1) % props.titles.length;
        isTransitioning.value = false;
      }, 300);
    }, 3000);
  }
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<template>
  <div class="max-w-5xl mx-auto w-full min-md:px-6">
    <!-- Split layout: text left, avatar right -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-12">
      <!-- Left side: text content -->
      <div class="flex-1 min-w-0">
        <!-- Available badge -->
        <div v-if="isHirable" class="mb-4">
          <span
            :class="
              cn(
                'inline-flex items-center gap-2 px-3 py-1',
                'text-xs font-mono uppercase tracking-wider',
                'text-primary-500 dark:text-primary-400',
                'border border-primary-500/30 dark:border-primary-400/30',
                'bg-primary-500/5 dark:bg-primary-400/5',
              )
            "
          >
            <span class="relative flex h-2 w-2" aria-hidden="true">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" aria-hidden="true" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500" aria-hidden="true" />
            </span>
            {{ t('hero.availableForHire') }}
          </span>
        </div>

        <!-- Name -->
        <h1 class="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {{ name }}
        </h1>

        <!-- Rotating title -->
        <p
          class="text-xl sm:text-2xl text-primary-500 mb-6"
          style="font-family: 'Fenix', serif;"
          :class="isTransitioning ? 'hero-title-hidden' : 'hero-title-visible'"
        >
          {{ currentTitle }}
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap items-center gap-3">
          <UTooltip :text="t('hero.bookCallDisabled')">
            <UButton
              color="primary"
              variant="solid"
              size="md"
              icon="i-heroicons-calendar-days"
              disabled
            >
              {{ t('hero.bookCall') }}
            </UButton>
          </UTooltip>
          <UTooltip :text="t('hero.viewOnGithubTip')">
            <UButton
              :to="githubUrl"
              target="_blank"
              color="neutral"
              variant="outline"
              size="md"
              icon="i-simple-icons-github"
            >
              {{ t('hero.viewOnGithub') }}
            </UButton>
          </UTooltip>
          <UTooltip :text="t('hero.readBlogTip')">
            <UButton
              to="/blog"
              color="neutral"
              variant="outline"
              size="md"
              icon="i-heroicons-document-text"
              class="text-sky-400! border-sky-400/50! hover:bg-sky-400/10! hover:border-sky-400!"
            >
              {{ t('hero.readBlog') }}
            </UButton>
          </UTooltip>
        </div>
      </div>

      <!-- Right side: avatar -->
      <div class="flex-shrink-0 flex justify-center md:justify-end">
        <div class="relative grid-background border border-neutral-200 dark:border-neutral-800 transition-transform duration-300 hover:scale-105">
          <div
            v-if="imageError"
            :class="
              cn(
                'w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center',
                'bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700',
              )
            "
          >
            <span class="text-4xl sm:text-5xl font-semibold text-primary-500">{{
              initials
            }}</span>
          </div>
          <NuxtImg
            v-else
            :src="avatarUrl"
            :alt="name"
            width="192"
            height="192"
            :class="
              cn(
                'w-40 h-40 sm:w-48 sm:h-48 object-cover',
              )
            "
            format="webp"
            loading="lazy"
            @error="imageError = true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
