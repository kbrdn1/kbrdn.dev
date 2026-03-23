<script setup lang="ts">
import { useI18n } from '#imports'

definePageMeta({ layout: 'blog' })

const { t } = useI18n()
const route = useRoute()
const slug = route.params.slug as string

const { data: post } = await useAsyncData(`blog-${slug}`, () =>
  queryCollection('blog').path(`/blogs/${slug}`).first()
)

// Fetch related posts (recent posts excluding current)
const { data: relatedPosts } = await useAsyncData(`blog-related-${slug}`, async () => {
  const all = await queryCollection('blog')
    .order('publishedAt', 'DESC')
    .limit(7)
    .all()
  return all.filter(p => p.path !== `/blogs/${slug}`).slice(0, 6)
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

if (post.value) {
  useSeoMeta({
    title: post.value.title,
    description: post.value.description,
  })
  defineOgImage('Blog', {
    title: post.value.title,
    description: post.value.description,
    publishedAt: post.value.publishedAt,
    tags: post.value.tags || [],
    slug,
    bannerImage: post.value.bannerImage || '/images/banners/dark.jpg',
  })
}

// Table of contents
interface TocItem {
  id: string
  text: string
  level: number
}

const tocItems = ref<TocItem[]>([])
const activeHeading = ref('')
const articleRef = ref<HTMLElement | null>(null)

onMounted(() => {
  nextTick(() => {
    if (!articleRef.value) return

    // Extract headings from rendered content
    const headings = articleRef.value.querySelectorAll('.prose-blog h1, .prose-blog h2, .prose-blog h3')
    const items: TocItem[] = []

    headings.forEach((heading) => {
      const el = heading as HTMLElement
      // Generate id if missing
      if (!el.id) {
        el.id = el.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || ''
      }
      items.push({
        id: el.id,
        text: el.textContent || '',
        level: parseInt(el.tagName[1]),
      })
    })

    tocItems.value = items

    // Observe headings for active state
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeHeading.value = entry.target.id
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )

    headings.forEach((heading) => observer.observe(heading))

    onUnmounted(() => observer.disconnect())
  })
})

const activeHeadingText = computed(() => {
  const item = tocItems.value.find(i => i.id === activeHeading.value)
  return item?.text || ''
})

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) {
    const offset = 80
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="min-h-screen flex justify-center overflow-x-clip">
    <!-- Left stripe zone -->
    <div
      class="hidden md:block fixed left-0 top-0 bottom-0 grid-background-blog -z-1" aria-hidden="true"
      style="width: calc(50% - 40rem); border-right: 1px solid var(--border-color);"
    />

    <!-- Main content -->
    <div ref="articleRef" class="w-full flex flex-col items-center relative z-10">
      <!-- Article found -->
      <article v-if="post" class="w-full" style="max-width: 80rem; margin: 0 auto;">
        <BlogArticleHeader :post="post" :reading-time="readingTime" />

        <div class="flex gap-6 lg:gap-10 px-4 sm:px-6 lg:px-12 pb-8 sm:pb-12">
          <!-- Main column -->
          <div class="flex-1 min-w-0">
            <!-- Article body -->
            <div class="prose-blog">
              <ContentRenderer :value="post" />
            </div>
          </div>

          <!-- TOC sidebar -->
          <BlogToc
            :items="tocItems"
            :active-heading="activeHeading"
            @scroll-to="scrollToHeading"
          />
        </div>

        <!-- Footer -->
        <footer class="mt-12 mb-28 lg:mb-16 space-y-8 px-6 lg:px-12">
          <!-- Separator -->
          <div class="border-b border-neutral-200 dark:border-neutral-800" />

          <!-- Share section -->
          <div>
            <h2 class="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-3">
              {{ t('blog.shareArticle') }}
            </h2>
            <button
              type="button"
              :aria-label="linkCopied ? t('blog.linkCopied') : t('blog.copyLink')"
              class="inline-flex items-center gap-2 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 font-mono text-xs text-neutral-600 dark:text-neutral-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
              @click="copyLink"
            >
              <UIcon :name="linkCopied ? 'i-lucide-check' : 'i-lucide-link'" class="size-3" />
              {{ linkCopied ? t('blog.linkCopied') : t('blog.copyLink') }}
            </button>
          </div>

          <!-- More articles -->
          <div v-if="relatedPosts?.length">
            <h2 class="font-mono text-[10px] uppercase tracking-widest text-neutral-400 mb-4">
              {{ t('blog.moreArticles') }}
            </h2>
            <div class="divide-y divide-neutral-200 dark:divide-neutral-800">
              <BlogPostRow
                v-for="related in relatedPosts"
                :key="related.path"
                :post="related"
              />
            </div>
          </div>

          <!-- Back to blog -->
          <BlogBackLink />
        </footer>
      </article>

      <!-- 404 state -->
      <div v-else class="w-full max-w-3xl mx-auto px-6 py-24 text-center">
        <p class="text-lg text-neutral-500 mb-6">{{ t('blog.notFound') }}</p>
        <BlogBackLink />
      </div>
    </div>

    <!-- Right stripe zone (background) -->
    <div
      class="hidden md:block fixed right-0 top-0 bottom-0 grid-background-blog -z-1" aria-hidden="true"
      style="width: calc(50% - 40rem); border-left: 1px solid var(--border-color);"
    />

    <!-- Mobile TOC -->
    <BlogMobileToc
      :items="tocItems"
      :active-heading="activeHeading"
      :active-heading-text="activeHeadingText"
      @scroll-to="scrollToHeading"
    />
  </div>
</template>
