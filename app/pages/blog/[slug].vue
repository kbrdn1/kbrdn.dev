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

const mobileTocOpen = ref(false)

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
  mobileTocOpen.value = false
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
        <!-- Banner header - full width -->
        <header v-if="post.banner" class="mb-4 sm:mb-6 lg:mb-8">
          <div class="px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-3">
            <NuxtLink
              to="/blog"
              class="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-sky-500 group"
            >
              <span class="inline-block transition-transform group-hover:-translate-x-1">&larr;</span>
              {{ t('blog.backToArticles') }}
            </NuxtLink>
          </div>
          <div class="relative overflow-hidden">
            <ClientOnly>
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
                  {{ formatDate(post.publishedAt) }}
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
                <span
                  v-for="tag in post.tags"
                  :key="tag"
                  class="inline-block border border-white/20 font-mono text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 text-white/60"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </header>

        <!-- Standard header - no banner -->
        <header v-else class="px-4 sm:px-6 lg:px-12 pt-4 sm:pt-6 mb-4 sm:mb-6 lg:mb-8">
          <NuxtLink
            to="/blog"
            class="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-sky-500 group mb-4 sm:mb-6"
          >
            <span class="inline-block transition-transform group-hover:-translate-x-1">&larr;</span>
            {{ t('blog.backToArticles') }}
          </NuxtLink>
          <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <time
              v-if="post.publishedAt"
              :datetime="post.publishedAt"
              class="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500"
            >
              {{ formatDate(post.publishedAt) }}
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
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="inline-block border border-neutral-200 dark:border-neutral-800 font-mono text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 text-neutral-600 dark:text-neutral-400"
            >
              {{ tag }}
            </span>
          </div>
          <div class="border-b border-neutral-200 dark:border-neutral-800 mt-4 sm:mt-6 lg:mt-8" />
        </header>

        <div class="flex gap-6 lg:gap-10 px-4 sm:px-6 lg:px-12 pb-8 sm:pb-12">
          <!-- Main column -->
          <div class="flex-1 min-w-0">

            <!-- Article body -->
            <div class="prose-blog">
              <ContentRenderer :value="post" />
            </div>
          </div>

          <!-- TOC sidebar — aligned with header -->
          <aside
            v-if="tocItems.length > 0"
            class="hidden lg:block w-64 shrink-0"
            aria-label="Table of contents"
          >
            <div class="sticky top-20 border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 font-mono">
              <div class="px-3 py-2">
                <span class="text-[9px] uppercase tracking-widest text-neutral-400">sommaire</span>
              </div>
              <div class="mx-3 border-b border-neutral-200 dark:border-neutral-800" />
              <div class="p-3">
                <ul class="space-y-px">
                  <li
                    v-for="(item, index) in tocItems"
                    :key="item.id"
                  >
                    <button
                      type="button"
                      :class="[
                        'flex items-center w-full text-left text-[11px] leading-snug py-1 px-1.5 -mx-1.5 transition-all',
                        activeHeading === item.id
                          ? 'text-primary-500 bg-primary-500/10'
                          : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/50',
                      ]"
                      @click="scrollToHeading(item.id)"
                    >
                      <span v-if="activeHeading === item.id" class="shrink-0 text-primary-500 mr-1 select-none">▸</span>
                      <span v-else class="shrink-0 mr-1 w-2 select-none" />
                      <span v-if="item.level >= 3" class="shrink-0 text-neutral-300 dark:text-neutral-600 mr-1">└</span>
                      <span :class="item.level >= 3 ? 'text-[10px]' : ''">{{ item.text }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
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
              <NuxtLink
                v-for="related in relatedPosts"
                :key="related.path"
                :to="related.path.replace('/blogs/', '/blog/')"
                class="relative flex items-center gap-6 py-5 group transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 -mx-3 px-3 overflow-hidden"
              >
                <!-- Thumbnail fade (if banner) -->
                <ClientOnly v-if="related.banner">
                  <div class="absolute right-0 top-0 bottom-0 w-48 overflow-hidden">
                    <NuxtImg
                      :src="$colorMode.value === 'dark' ? '/images/banners/dark.jpg' : '/images/banners/light.jpg'"
                      alt=""
                      class="w-full h-full object-cover"
                    />
                    <div class="absolute inset-0 bg-gradient-to-l from-transparent to-[#f0eeeb] dark:to-neutral-950" />
                  </div>
                </ClientOnly>

                <!-- Date & Author -->
                <div class="shrink-0 w-28 sm:w-36 relative z-10">
                  <span
                    v-if="related.publishedAt"
                    :datetime="related.publishedAt"
                    class="block text-[10px] sm:text-xs font-mono text-neutral-500"
                  >
                    {{ formatDate(related.publishedAt) }}
                  </span>
                </div>

                <!-- Title + Description -->
                <div class="flex-1 min-w-0 relative z-10">
                  <span class="block text-sm sm:text-base font-medium text-primary-500 group-hover:text-primary-400 transition-colors" style="font-family: 'Fenix', serif;">
                    {{ related.title }}
                  </span>
                  <span
                    v-if="related.description"
                    class="block text-xs text-neutral-500 dark:text-neutral-400 mt-1 overflow-hidden whitespace-nowrap"
                    style="mask-image: linear-gradient(to right, black 50%, transparent); -webkit-mask-image: linear-gradient(to right, black 50%, transparent);"
                  >
                    {{ related.description }}
                  </span>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Back to blog -->
          <NuxtLink
            to="/blog"
            class="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-sky-500 group"
          >
            <span class="inline-block transition-transform group-hover:-translate-x-1">&larr;</span>
            {{ t('blog.backToArticles') }}
          </NuxtLink>
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

    <!-- Right stripe zone (background) -->
    <div
      class="hidden md:block fixed right-0 top-0 bottom-0 grid-background-blog -z-1" aria-hidden="true"
      style="width: calc(50% - 40rem); border-left: 1px solid var(--border-color);"
    />

    <!-- Mobile TOC - bottom bar -->
    <Teleport to="body">
      <div
        v-if="tocItems.length > 0"
        class="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      >
        <!-- Expanded TOC list -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-4"
        >
          <div
            v-if="mobileTocOpen"
            class="border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md px-4 py-3 max-h-64 overflow-y-auto"
          >
            <ul class="space-y-px font-mono">
              <li
                v-for="item in tocItems"
                :key="item.id"
              >
                <button
                  type="button"
                  :class="[
                    'flex items-center w-full text-left text-xs leading-snug py-1.5 px-2 rounded transition-all',
                    item.level >= 3 ? 'ml-4' : '',
                    activeHeading === item.id
                      ? 'text-primary-500 bg-primary-500/10'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200',
                  ]"
                  @click="scrollToHeading(item.id)"
                >
                  <span v-if="activeHeading === item.id" class="shrink-0 text-primary-500 mr-1.5 select-none">▸</span>
                  <span v-else class="shrink-0 mr-1.5 w-2 select-none" />
                  <span v-if="item.level >= 3" class="shrink-0 text-neutral-300 dark:text-neutral-600 mr-1">└</span>
                  {{ item.text }}
                </button>
              </li>
            </ul>
          </div>
        </Transition>

        <!-- Always visible bar -->
        <button
          type="button"
          class="w-full flex items-center gap-3 px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md"
          @click="mobileTocOpen = !mobileTocOpen"
        >
          <span class="text-[9px] font-mono uppercase tracking-widest text-neutral-400 shrink-0">Sommaire</span>
          <span class="flex-1 text-xs font-mono text-primary-500 truncate text-left">
            {{ activeHeadingText }}
          </span>
          <UIcon
            name="i-heroicons-chevron-up"
            :class="['w-4 h-4 text-neutral-400 transition-transform', mobileTocOpen ? 'rotate-180' : '']"
          />
        </button>
      </div>
    </Teleport>

  </div>
</template>
