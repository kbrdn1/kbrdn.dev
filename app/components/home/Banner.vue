<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
</script>

<template>
  <div class="w-full h-8 sm:h-10 overflow-hidden relative">
    <ClientOnly>
      <!-- Dark mode image -->
      <NuxtImg
        v-if="isDark"
        src="/images/banners/dark.jpg"
        alt=""
        class="absolute inset-0 w-full h-full object-cover object-top"
        loading="eager"
      />
      <!-- Light mode image -->
      <NuxtImg
        v-else
        src="/images/banners/light.jpg"
        alt=""
        class="absolute inset-0 w-full h-full object-cover object-top"
        loading="eager"
      />
      <template #fallback>
        <div class="absolute inset-0 bg-neutral-200 dark:bg-neutral-800" />
      </template>
    </ClientOnly>
    <!-- Gradient overlays -->
    <ClientOnly>
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-950/50" />
      <div class="absolute inset-0 bg-gradient-to-r from-neutral-950/50 via-transparent to-neutral-950/50" />
    </ClientOnly>
    <!-- Content -->
    <div class="absolute inset-0 flex items-center justify-center">
      <a
        href="https://github.com/kbrdn1/gwm-cli"
        target="_blank"
        rel="noopener noreferrer"
        :class="cn(
          'flex items-center gap-2 px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors',
          'text-white/90 hover:text-white',
        )"
      >
        <span class="inline-flex items-center gap-1.5">
          <UIcon name="i-heroicons-rocket-launch" class="w-3.5 h-3.5" />
          {{ t('banner.gwm') }}
        </span>
        <UIcon name="i-heroicons-arrow-right-20-solid" class="w-3 h-3" />
      </a>
    </div>
  </div>
</template>
