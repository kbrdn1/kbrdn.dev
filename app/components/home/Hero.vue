<script setup lang="ts">
import { useI18n } from "#imports";

const { t } = useI18n();

interface Props {
  name: string;
  title: string;
  handle?: string;
  avatarUrl?: string;
  isHirable?: boolean;
  sponsorUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: "/images/avatar.jpg",
  isHirable: true,
  sponsorUrl: "https://github.com/sponsors/kbrdn1",
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
</script>

<template>
  <div>
    <!-- Main row: Avatar + Info + Controls (desktop) -->
    <div class="flex items-start gap-4 w-full">
      <!-- Avatar - Square with rounded corners -->
      <div class="relative flex-shrink-0">
        <div
          v-if="imageError"
          :class="
            cn(
              'w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center',
              'bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700',
            )
          "
          ,
        >
          <span class="text-xl sm:text-2xl font-semibold text-primary-500">{{
            initials
          }}</span>
        </div>
        <NuxtImg
          v-else
          :src="avatarUrl"
          :alt="name"
          width="80"
          height="80"
          :class="
            cn(
              'w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover',
              'border border-neutral-200 dark:border-neutral-800',
            )
          "
          format="webp"
          loading="lazy"
          @error="imageError = true"
        />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <!-- Wave emoji -->
          <span class="text-base sm:text-lg">👋</span>
          <!-- Name -->
          <h1
            class="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 truncate"
          >
            {{ name }}
          </h1>
        </div>
        <p class="text-sm sm:text-base text-neutral-500 mt-0.5 truncate">
          {{ title }}
        </p>
      </div>

      <!-- Controls - Desktop only -->
      <div class="hidden sm:flex items-center gap-2 flex-shrink-0">
        <!-- Sponsor button -->
        <a
          :href="sponsorUrl"
          target="_blank"
          rel="noopener noreferrer"
          :class="
            cn(
              'flex items-center justify-center w-8 h-8',
              'text-neutral-500 hover:text-pink-500',
              'bg-transparent hover:bg-pink-500/10',
              'border border-transparent hover:border-pink-500/30',
              'transition-all',
            )
          "
          :title="t('hero.sponsor')"
        >
          <UIcon name="i-heroicons-heart" class="w-4 h-4" />
        </a>
        <!-- Language switcher -->
        <UiLanguageSwitcher />
        <!-- Theme toggle -->
        <UiThemeToggle />
      </div>
    </div>

    <!-- Controls - Mobile only -->
    <div class="flex sm:hidden items-center justify-end gap-2">
      <!-- Sponsor button -->
      <a
        :href="sponsorUrl"
        target="_blank"
        rel="noopener noreferrer"
        :class="
          cn(
            'flex items-center justify-center w-8 h-8',
            'text-neutral-500 hover:text-pink-500',
            'bg-transparent hover:bg-pink-500/10',
            'border border-transparent hover:border-pink-500/30',
            'transition-all',
          )
        "
        :title="t('hero.sponsor')"
      >
        <UIcon name="i-heroicons-heart" class="w-4 h-4" />
      </a>
      <!-- Language switcher -->
      <UiLanguageSwitcher />
      <!-- Theme toggle -->
      <UiThemeToggle />
    </div>
  </div>
</template>
