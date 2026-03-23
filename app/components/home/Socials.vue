<script setup lang="ts">
import { useI18n } from "#imports";

const { t } = useI18n();

interface SocialLink {
  platform: string;
  url: string;
  label: string;
  icon?: string;
}

interface Props {
  links: SocialLink[];
}

withDefaults(defineProps<Props>(), {
  links: () => [
    { platform: "github", url: "https://github.com/kbrdn1", label: "GitHub" },
    {
      platform: "twitter",
      url: "https://twitter.com/kbrdn1",
      label: "Twitter",
    },
    {
      platform: "linkedin",
      url: "https://linkedin.com/in/kylian-bardini-aa0528234/",
      label: "LinkedIn",
    },
  ],
});

// Fetch GitHub profile stats
const { data: githubProfile } = await useFetch('/api/github/profile', {
  query: { username: 'kbrdn1' },
  lazy: true,
  server: false,
})

const getIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    github: "i-simple-icons-github",
    twitter: "i-simple-icons-x",
    linkedin: "i-simple-icons-linkedin",
    medium: "i-simple-icons-medium",
    behance: "i-simple-icons-behance",
    dribbble: "i-simple-icons-dribbble",
    instagram: "i-simple-icons-instagram",
    youtube: "i-simple-icons-youtube",
    twitch: "i-simple-icons-twitch",
    discord: "i-simple-icons-discord",
    more: "i-heroicons-bars-3",
  };
  return icons[platform] || "i-heroicons-link";
};

const getHandle = (platform: string): string => {
  const handles: Record<string, string> = {
    github: "@kbrdn1",
    twitter: "@kbrdn1",
    linkedin: "Kylian Bardini",
  };
  return handles[platform] || "";
};

const getDescription = (platform: string): string => {
  const key = `socials.${platform}Desc`;
  const val = t(key);
  return val !== key ? val : "";
};
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-neutral-900 dark:text-neutral-100">
      {{ t("socials.intro") }}
      <span class="font-semibold">{{ t("socials.label") }}</span>
    </p>
    <UiStaggerContainer
      :stagger-delay="50"
      :base-delay="0"
      class="flex flex-wrap gap-2"
    >
      <UiStaggerItem
        v-for="(link, index) in links"
        :key="link.platform"
        :index="index"
        as="span"
        class="inline-flex transition-transform duration-200 hover:scale-105 active:scale-95"
      >
        <UPopover
          mode="hover"
          :ui="{ content: 'p-0' }"
        >
          <UButton
            :to="link.url"
            target="_blank"
            variant="soft"
            color="neutral"
            size="sm"
            :icon="link.icon || getIcon(link.platform)"
            class="hover:border-primary-500/50 transition-all duration-200"
          >
            {{ link.label }}
          </UButton>

          <template #content>
            <div class="w-72 p-3">
              <!-- Header: icon + name + handle -->
              <div class="flex items-center gap-3 mb-2">
                <div class="flex items-center justify-center w-10 h-10 border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                  <UIcon :name="link.icon || getIcon(link.platform)" class="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
                </div>
                <div>
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ link.label }}</p>
                  <p v-if="getHandle(link.platform)" class="text-xs font-mono text-neutral-500">{{ getHandle(link.platform) }}</p>
                </div>
              </div>

              <!-- Description -->
              <p v-if="getDescription(link.platform)" class="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                {{ getDescription(link.platform) }}
              </p>

              <!-- GitHub stats -->
              <div
                v-if="link.platform === 'github' && githubProfile"
                class="flex items-center mb-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900"
              >
                <div class="flex-1 text-center">
                  <p class="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">{{ githubProfile.followers }}</p>
                  <p class="text-[9px] font-mono uppercase tracking-wider text-neutral-500">followers</p>
                </div>
                <div class="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
                <div class="flex-1 text-center">
                  <p class="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">{{ githubProfile.following }}</p>
                  <p class="text-[9px] font-mono uppercase tracking-wider text-neutral-500">following</p>
                </div>
                <div class="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />
                <div class="flex-1 text-center">
                  <p class="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">{{ githubProfile.repos }}</p>
                  <p class="text-[9px] font-mono uppercase tracking-wider text-neutral-500">repos</p>
                </div>
              </div>

              <!-- Visit link -->
              <div class="flex items-center gap-1 text-[10px] font-mono text-primary-500">
                <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3" />
                {{ t('socials.visitProfile') }}
              </div>
            </div>
          </template>
        </UPopover>
      </UiStaggerItem>
      <!-- More button -->
      <UiStaggerItem :index="links.length" as="span" class="inline-flex transition-transform duration-200 hover:scale-105 active:scale-95">
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          icon="i-heroicons-bars-3"
          class="hover:border-primary-500/50 transition-all duration-200"
        >
          {{ t("socials.more") }}
        </UButton>
      </UiStaggerItem>
    </UiStaggerContainer>
  </div>
</template>
