<script setup lang="ts">
const props = defineProps<{
  post: {
    path: string
    title: string
    description?: string
    publishedAt?: string
    banner?: boolean
    bannerImage?: string
  }
  showAuthor?: boolean
}>()

const { formatDate } = useFormatDate()
const { postUrl } = useBlogUrl()

// The banner, resized by IPX: the pixel layer only needs a few hundred pixels of it
const $img = useImage()
const colorMode = useColorMode()
const banner = computed(() =>
  $img(
    props.post.bannerImage ||
      (isDarkMode(colorMode.value) ? '/images/banners/dark.jpg' : '/images/banners/light.jpg'),
    { width: 640, format: 'webp' },
  ),
)
</script>

<template>
  <!-- A card, after disarto's notes panel: date and author in mono, the title, the summary,
       and the banner through the pixel layer on the right -->
  <NuxtLink
    :to="postUrl(post)"
    class="panel-card group relative isolate flex overflow-hidden transition-colors hover:border-primary-500/50"
  >
    <UiPixelCanvas />
    <div class="relative z-10 min-w-0 flex-1 p-5">
      <p class="eyebrow">
        <template v-if="post.publishedAt">{{ formatDate(post.publishedAt) }}</template>
        <template v-if="showAuthor"> · Kylian Bardini</template>
      </p>
      <h3
        class="mt-2 text-lg text-neutral-900 transition-colors group-hover:text-primary-500 dark:text-neutral-100"
      >
        {{ post.title }}
      </h3>
      <p
        v-if="post.description"
        class="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
      >
        {{ post.description }}
      </p>
    </div>
    <ClientOnly v-if="post.banner">
      <div class="relative hidden w-56 shrink-0 sm:block">
        <div class="absolute inset-1.5 overflow-hidden rounded-[10px]">
          <UiPixelImage :src="banner" class="size-full" reveal />
        </div>
      </div>
    </ClientOnly>
  </NuxtLink>
</template>
