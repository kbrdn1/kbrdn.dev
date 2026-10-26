<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
</script>

<template>
  <!-- The announcement, as a notch hanging under the floating navbar (both headers) -->
  <div class="notch relative mx-auto w-fit max-w-[calc(100%-4rem)]">
    <a
      href="https://github.com/kbrdn1/gwm-cli"
      target="_blank"
      rel="noopener noreferrer"
      class="eyebrow flex h-7 items-center gap-2 px-4 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
    >
      <UIcon name="i-heroicons-rocket-launch" class="size-3.5 shrink-0 text-primary-500" />
      <span class="truncate">{{ t('banner.gwm') }}</span>
      <UIcon name="i-heroicons-arrow-right-20-solid" class="size-3 shrink-0" />
    </a>
  </div>
</template>
