<script setup lang="ts">
import { useI18n } from '#imports'

const props = defineProps<{
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

// The banner, resized by IPX: the pixel layer only needs a few hundred pixels of it
const $img = useImage()
const colorMode = useColorMode()
const banner = computed(() =>
  $img(
    props.post.bannerImage ||
      (isDarkMode(colorMode.value) ? '/images/banners/dark.jpg' : '/images/banners/light.jpg'),
    { width: 1280, format: 'webp' },
  ),
)
</script>

<template>
  <!-- After disarto's deployment card: the banner inset at the top of one card, through the
       pixel layer and crisp while hovered, then the meta, the title, the summary and the tags -->
  <header class="mb-6 px-4 pt-6 sm:px-6 lg:mb-10 lg:px-12">
    <BlogBackLink class="mb-5" />
    <div class="panel">
      <div class="panel-card overflow-hidden p-1.5">
        <ClientOnly v-if="post.banner">
          <div class="h-44 overflow-hidden rounded-[10px] sm:h-60 lg:h-72">
            <UiPixelImage :src="banner" loading="eager" class="size-full" reveal />
          </div>
          <template #fallback>
            <div class="h-44 rounded-[10px] bg-neutral-200 sm:h-60 lg:h-72 dark:bg-neutral-900" />
          </template>
        </ClientOnly>
        <div class="p-4 sm:p-6">
          <p class="eyebrow">
            <time v-if="post.publishedAt" :datetime="post.publishedAt">
              {{ formatDate(post.publishedAt, 'long') }}
            </time>
            · {{ readingTime }} {{ t('blog.readingTime') }}
          </p>
          <h1
            class="mt-3 text-3xl tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-neutral-100"
            :aria-label="post.title"
          >
            <UiScrambleText :text="post.title" />
          </h1>
          <p
            v-if="post.description"
            class="mt-4 max-w-3xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400"
          >
            {{ post.description }}
          </p>
          <div v-if="post.tags?.length" class="mt-5 flex flex-wrap gap-1.5 sm:gap-2">
            <UiTag v-for="tag in post.tags" :key="tag" :label="tag" variant="auto" />
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
