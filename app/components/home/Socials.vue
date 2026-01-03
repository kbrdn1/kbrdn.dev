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
    { platform: "medium", url: "https://medium.com/@kbrdn1", label: "Medium" },
    {
      platform: "behance",
      url: "https://behance.net/kbrdn1",
      label: "Behance",
    },
  ],
});

// Map platform to icon name
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
      >
        <UButton
          :to="link.url"
          target="_blank"
          variant="soft"
          color="neutral"
          size="sm"
          :icon="link.icon || getIcon(link.platform)"
        >
          {{ link.label }}
        </UButton>
      </UiStaggerItem>
      <!-- More button -->
      <UiStaggerItem :index="links.length" as="span">
        <UButton
          variant="soft"
          color="neutral"
          size="sm"
          icon="i-heroicons-bars-3"
        >
          {{ t("socials.more") }}
        </UButton>
      </UiStaggerItem>
    </UiStaggerContainer>
  </div>
</template>
