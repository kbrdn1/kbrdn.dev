<script setup lang="ts">
import { useI18n } from '#imports'

defineProps<{
  post: {
    title: string
    description?: string
    publishedAt?: string
    tags?: string[]
    banner?: boolean
    bannerImage?: string
  }
  readingTime: number
}>()

const { t } = useI18n()
const { formatDate } = useFormatDate()
</script>

<template>
  <!-- Banner header - full width -->
  <header v-if="post.banner" class="mb-4 sm:mb-6 lg:mb-8">
    <div class="px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-3">
      <BlogBackLink />
    </div>
    <div class="relative overflow-hidden">
      <NuxtImg
        v-if="post.bannerImage"
        :src="post.bannerImage"
        alt=""
        class="w-full h-48 sm:h-64 lg:h-80 object-cover"
      />
      <ClientOnly v-else>
        <NuxtImg
          :src="$colorMode.value === 'dark' ? '/images/banners/dark.jpg' : '/images/banners/light.jpg'"
          alt=""
          class="w-full h-48 sm:h-64 lg:h-80 object-cover"
        />
        <template #fallback>
          <div class="w-full h-48 sm:h-64 lg:h-80 bg-neutral-800" />
        </template>
      </ClientOnly>
      <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/50 to-neutral-950/20" />
      <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-12">
        <div class="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <time
            v-if="post.publishedAt"
            :datetime="post.publishedAt"
            class="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-white/60"
          >
            {{ formatDate(post.publishedAt, 'long') }}
          </time>
          <span class="text-white/40">&middot;</span>
          <span class="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-white/60">
            {{ readingTime }} {{ t('blog.readingTime') }}
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2" style="font-family: 'Fenix', serif;">
          {{ post.title }}
        </h1>
        <p v-if="post.description" class="text-sm sm:text-base text-white/70 mt-1 sm:mt-2 max-w-2xl">
          {{ post.description }}
        </p>
        <div v-if="post.tags?.length" class="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          <UiTag
            v-for="tag in post.tags"
            :key="tag"
            :label="tag"
            variant="auto"
          />
        </div>
      </div>
    </div>
  </header>

  <!-- Standard header - no banner -->
  <header v-else class="px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 mb-4 sm:mb-6 lg:mb-8">
    <BlogBackLink class="mb-4 sm:mb-6" />
    <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
      <time
        v-if="post.publishedAt"
        :datetime="post.publishedAt"
        class="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500"
      >
        {{ formatDate(post.publishedAt, 'long') }}
      </time>
      <span class="text-neutral-700 dark:text-neutral-600">&middot;</span>
      <span class="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500">
        {{ readingTime }} {{ t('blog.readingTime') }}
      </span>
    </div>
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-950 dark:text-neutral-100 mb-1 sm:mb-2" style="font-family: 'Fenix', serif;">
      {{ post.title }}
    </h1>
    <p v-if="post.description" class="text-base sm:text-lg text-neutral-500 mt-1 sm:mt-2">
      {{ post.description }}
    </p>
    <div v-if="post.tags?.length" class="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
      <UiTag
        v-for="tag in post.tags"
        :key="tag"
        :label="tag"
        variant="auto"
      />
    </div>
    <div class="border-b border-neutral-200 dark:border-neutral-800 mt-4 sm:mt-6 lg:mt-8" />
  </header>
</template>
