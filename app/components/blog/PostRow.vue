<script setup lang="ts">
defineProps<{
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
</script>

<template>
  <NuxtLink
    :to="postUrl(post)"
    class="relative flex items-center gap-6 py-5 group transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 -mx-3 px-3 overflow-hidden"
  >
    <!-- Thumbnail fade (if banner) -->
    <ClientOnly v-if="post.banner">
      <div class="absolute right-0 top-0 bottom-0 w-48 overflow-hidden">
        <NuxtImg
          :src="post.bannerImage || ($colorMode.value === 'dark' ? '/images/banners/dark.jpg' : '/images/banners/light.jpg')"
          alt=""
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-l from-transparent to-[#f0eeeb] dark:to-neutral-950" />
      </div>
    </ClientOnly>

    <!-- Date & Author -->
    <div class="shrink-0 w-28 sm:w-36 relative z-10">
      <span
        v-if="post.publishedAt"
        class="block text-[10px] sm:text-xs font-mono text-neutral-500"
      >
        {{ formatDate(post.publishedAt) }}
      </span>
      <span v-if="showAuthor" class="block text-[10px] font-mono text-neutral-400 mt-0.5">
        Kylian Bardini
      </span>
    </div>

    <!-- Title + Description -->
    <div class="flex-1 min-w-0 relative z-10">
      <span class="block text-sm sm:text-base font-medium text-primary-500 group-hover:text-primary-400 transition-colors" style="font-family: 'Fenix', serif;">
        {{ post.title }}
      </span>
      <span
        v-if="post.description"
        class="block text-xs text-neutral-500 dark:text-neutral-400 mt-1 overflow-hidden whitespace-nowrap"
        style="mask-image: linear-gradient(to right, black 50%, transparent); -webkit-mask-image: linear-gradient(to right, black 50%, transparent);"
      >
        {{ post.description }}
      </span>
    </div>
  </NuxtLink>
</template>
