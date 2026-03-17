<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
</script>

<template>
  <div class="w-full h-8 sm:h-10 overflow-hidden relative">
    <ClientOnly>
      <NuxtImg
        :src="$colorMode.value === 'dark' ? '/images/banners/dark.jpg' : '/images/banners/light.jpg'"
        alt="Banner"
        class="w-full h-full object-cover object-top"
        loading="eager"
      />
      <template #fallback>
        <div class="w-full h-full bg-neutral-200 dark:bg-neutral-800" />
      </template>
    </ClientOnly>
    <!-- Gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-[#f0eeeb]/40 dark:to-neutral-950/80" />
    <!-- Content -->
    <div class="absolute inset-0 flex items-center justify-center">
      <a
        href="https://github.com/kbrdn1/LazyCurl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-2 px-4 py-1.5 text-[10px] font-mono uppercase tracking-wider text-white/90 hover:text-white transition-colors"
      >
        <span class="inline-flex items-center gap-1.5">
          <UIcon name="i-heroicons-rocket-launch" class="w-3.5 h-3.5" />
          {{ t('banner.lazycurl') }}
        </span>
        <UIcon name="i-heroicons-arrow-right-20-solid" class="w-3 h-3" />
      </a>
    </div>
  </div>
</template>
