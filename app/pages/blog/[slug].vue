<script setup lang="ts">
import { useI18n } from '#imports'

definePageMeta({ layout: 'blog' })

const { t, locale } = useI18n()
const route = useRoute()
const slug = route.params.slug as string

const { data: post } = await useAsyncData(`blog-${slug}`, () =>
  queryCollection('blog').path(`/blogs/${slug}`).first()
)

// Fetch related posts (recent posts excluding current)
const { data: relatedPosts } = await useAsyncData(`blog-related-${slug}`, async () => {
  const all = await queryCollection('blog')
    .order('publishedAt', 'DESC')
    .limit(4)
    .all()
  return all.filter(p => p.path !== `/blogs/${slug}`).slice(0, 3)
})

// Reading time estimate (~200 words/min)
const readingTime = computed(() => {
  if (!post.value?.body) return 0
  const text = JSON.stringify(post.value.body)
  const wordCount = text.split(/\s+/).length
  return Math.max(1, Math.ceil(wordCount / 200))
})

// Copy link functionality
const linkCopied = ref(false)
async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 2000)
  } catch {
    const input = document.createElement('input')
    input.value = window.location.href
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 2000)
  }
}

// Format date based on locale
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

if (post.value) {
  useSeoMeta({
    title: post.value.title,
    description: post.value.description,
  })
}
</script>

<template>
  <div class="min-h-screen flex justify-center overflow-x-hidden">
    <!-- Left stripe zone -->
    <div
      class="hidden md:block fixed left-0 top-0 bottom-0 grid-background -z-1"
      style="width: calc(50% - 40rem); border-right: 1px solid var(--border-color);"
    />

    <!-- Main content -->
    <div class="w-full flex flex-col items-center relative z-10">
      <!-- Article found -->
      <article v-if="post" class="w-full max-w-3xl mx-auto px-6 py-12">
        <!-- Header -->
        <header class="mb-10">
          <!-- Back link -->
          <NuxtLink
            to="/blog"
            class="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-primary-500 group mb-8"
          >
            <span class="inline-block transition-transform group-hover:-translate-x-1">&larr;</span>
            {{ t('blog.backToArticles') }}
          </NuxtLink>

          <!-- Date + Reading time -->
          <div class="flex items-center gap-3 mb-4">
            <time
              v-if="post.publishedAt"
              :datetime="post.publishedAt"
              class="font-mono text-xs uppercase tracking-wider text-neutral-500"
            >
              {{ formatDate(post.publishedAt) }}
            </time>
            <span class="text-neutral-700 dark:text-neutral-600">&middot;</span>
            <span class="font-mono text-xs uppercase tracking-wider text-neutral-500">
              {{ readingTime }} {{ t('blog.readingTime') }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl sm:text-4xl font-bold text-neutral-950 dark:text-neutral-100 mb-2">
            {{ post.title }}
          </h1>

          <!-- Description -->
          <p
            v-if="post.description"
            class="text-lg text-neutral-500 mt-2"
          >
            {{ post.description }}
          </p>

          <!-- Tags -->
          <div v-if="post.tags?.length" class="flex flex-wrap gap-2 mt-4">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="inline-block border border-neutral-200 dark:border-neutral-800 font-mono text-xs px-2.5 py-1 text-neutral-600 dark:text-neutral-400"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Separator -->
          <div class="border-b border-neutral-200 dark:border-neutral-800 mt-8" />
        </header>

        <!-- Article body -->
        <div class="prose-blog">
          <ContentRenderer :value="post" />
        </div>

        <!-- Footer -->
        <footer class="mt-16">
          <!-- Separator -->
          <div class="border-b border-neutral-200 dark:border-neutral-800 mb-8" />

          <!-- Share section -->
          <div class="mb-12">
            <h3 class="font-mono text-xs uppercase tracking-wider text-neutral-500 mb-4">
              {{ t('blog.shareArticle') }}
            </h3>
            <button
              class="inline-flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 px-4 py-2 font-mono text-xs text-neutral-600 dark:text-neutral-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
              @click="copyLink"
            >
              <UIcon :name="linkCopied ? 'i-lucide-check' : 'i-lucide-link'" class="size-3.5" />
              {{ linkCopied ? t('blog.linkCopied') : t('blog.copyLink') }}
            </button>
          </div>

          <!-- More articles -->
          <div v-if="relatedPosts?.length">
            <h3 class="font-mono text-xs uppercase tracking-wider text-neutral-500 mb-6">
              {{ t('blog.moreArticles') }}
            </h3>
            <div class="space-y-4">
              <NuxtLink
                v-for="related in relatedPosts"
                :key="related.path"
                :to="related.path.replace('/blogs/', '/blog/')"
                class="block border border-neutral-200 dark:border-neutral-800 p-4 hover:border-primary-500/30 transition-colors group"
              >
                <div class="flex items-center gap-3 mb-1">
                  <time
                    v-if="related.publishedAt"
                    :datetime="related.publishedAt"
                    class="font-mono text-xs text-neutral-500"
                  >
                    {{ formatDate(related.publishedAt) }}
                  </time>
                </div>
                <h4 class="font-semibold text-neutral-950 dark:text-neutral-100 group-hover:text-primary-500 transition-colors">
                  {{ related.title }}
                </h4>
                <p v-if="related.description" class="text-sm text-neutral-500 mt-1 line-clamp-2">
                  {{ related.description }}
                </p>
              </NuxtLink>
            </div>
          </div>

          <!-- Back to blog -->
          <div class="mt-10">
            <NuxtLink
              to="/blog"
              class="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-primary-500 group"
            >
              <span class="inline-block transition-transform group-hover:-translate-x-1">&larr;</span>
              {{ t('blog.backToArticles') }}
            </NuxtLink>
          </div>
        </footer>
      </article>

      <!-- 404 state -->
      <div v-else class="w-full max-w-3xl mx-auto px-6 py-24 text-center">
        <p class="text-lg text-neutral-500 mb-6">{{ t('blog.notFound') }}</p>
        <NuxtLink
          to="/blog"
          class="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-primary-500 group"
        >
          <span class="inline-block transition-transform group-hover:-translate-x-1">&larr;</span>
          {{ t('blog.backToArticles') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Right stripe zone -->
    <div
      class="hidden md:block fixed right-0 top-0 bottom-0 grid-background -z-1"
      style="width: calc(50% - 40rem); border-left: 1px solid var(--border-color);"
    />
  </div>
</template>
