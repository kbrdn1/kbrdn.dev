<script setup lang="ts">
import { useI18n } from '#imports'

definePageMeta({ layout: 'blog' })

const { t } = useI18n()
const { locale, collection } = useBlogCollection()

// Fetch all blog posts for the active locale
const { data: posts } = await useAsyncData(
  'blog-posts',
  () => queryCollection(collection.value).all(),
  { watch: [locale] },
)

// SEO metadata
useSeoMeta({
  title: t('blog.title'),
  description: t('blog.description'),
})

if (import.meta.server) {
  defineOgImage('Default', {
    title: t('blog.title'),
    description: t('blog.description'),
  })
}

// Active tag filter
const activeTag = ref<string | null>(null)

// View mode: list (oxc style) | cards | compact
const viewMode = ref<'list' | 'cards' | 'compact'>('list')

onMounted(() => {
  if (window.innerWidth < 640) {
    viewMode.value = 'cards'
  }
})
const showViewDropdown = ref(false)
const blogListRef = ref<HTMLElement | null>(null)

function goToPage(page: number) {
  blogListRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  setTimeout(() => {
    currentPage.value = page
  }, 300)
}

// Extract all unique tags from posts
const allTags = computed(() => {
  if (!posts.value) return []
  const tagSet = new Set<string>()
  posts.value.forEach((post) => {
    post.tags?.forEach((tag) => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
})

// Pagination
const POSTS_PER_PAGE = 10
const currentPage = ref(1)

// Reset page when tag changes
watch(activeTag, () => {
  currentPage.value = 1
})

// Filtered posts based on active tag
const filteredPosts = computed(() => {
  if (!posts.value) return []
  if (!activeTag.value) return posts.value
  return posts.value.filter((post) =>
    post.tags?.includes(activeTag.value!)
  )
})

// Pagination computed
const totalPages = computed(() => Math.ceil(filteredPosts.value.length / POSTS_PER_PAGE))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * POSTS_PER_PAGE
  return filteredPosts.value.slice(start, start + POSTS_PER_PAGE)
})

const pageNumbers = computed(() => {
  const pages: (number | '...')[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

// Post count label
const postCount = computed(() => {
  const count = filteredPosts.value.length
  return `${count} ${t('blog.articleCount')}`
})

const { formatDate } = useFormatDate()
const { postUrl } = useBlogUrl()
</script>

<template>
  <div class="flex justify-center overflow-x-clip">
    <!-- Left stripe zone -->
    <div
      class="hidden md:block fixed left-0 top-0 bottom-0 grid-background-blog -z-1" aria-hidden="true"
      style="width: calc(50% - 40rem); border-right: 1px solid var(--border-color)"
    />

    <!-- Main content -->
    <div class="w-full flex flex-col items-center relative z-10">
      <!-- Hero Section -->
      <section class="p-6 border-dashed-horizontal border-b border-neutral-200 dark:border-neutral-800 w-full">
        <span class="corner-bottom-left" aria-hidden="true" />
        <span class="corner-bottom-right" aria-hidden="true" />
        <UiAnimatedSection animation="fadeInUp" :delay="0" :duration="600">
          <div class="max-w-5xl mx-auto min-md:px-6">
            <span class="block text-[11px] font-mono uppercase tracking-widest text-sky-400 mb-1">
              {{ t('sections.blog') }}
            </span>
            <h1 class="text-2xl sm:text-3xl font-medium text-neutral-900 dark:text-neutral-100 mt-2" style="font-family: 'Fenix', serif;">
              {{ t('blog.title') }}
            </h1>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-3 max-w-xl">
              {{ t('blog.description') }}
            </p>
            <div class="flex items-center gap-4 mt-4">
              <span class="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
                {{ postCount }}
              </span>
              <a
                href="https://github.com/sponsors/kbrdn1"
                target="_blank"
                rel="noopener noreferrer"
                :class="cn(
                  'inline-flex items-center gap-1.5 px-3 py-1',
                  'text-[11px] font-mono uppercase tracking-wider',
                  'text-pink-500 border border-pink-500/30 bg-pink-500/5',
                  'hover:bg-pink-500/10 hover:border-pink-500/50 transition-colors',
                )"
              >
                <UIcon name="i-heroicons-heart" class="w-3 h-3" />
                Sponsor
              </a>
            </div>
          </div>
        </UiAnimatedSection>
      </section>

      <!-- Tag filter bar + Posts -->
      <div ref="blogListRef" class="scroll-mt-20" />
      <main class="p-6 space-y-6 w-full max-w-5xl min-md:px-6">
        <!-- Tag filters + View toggle -->
        <UiAnimatedSection
          animation="fadeInUp"
          :delay="100"
          :duration="500"
        >
          <div class="flex items-center gap-3">
            <!-- Tags -->
            <div class="flex-1 flex gap-2 overflow-x-auto pb-2 -mb-2 scrollbar-none">
              <button
                :class="
                  cn(
                    'shrink-0 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors',
                    !activeTag
                      ? 'bg-primary-500/10 border-primary-500 text-primary-500'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-primary-500/50 hover:text-primary-500',
                  )
                "
                @click="activeTag = null"
              >
                {{ t('blog.allTags') }}
              </button>
              <button
                v-for="tag in allTags"
                :key="tag"
                :class="
                  cn(
                    'shrink-0 px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors',
                    activeTag === tag
                      ? 'bg-primary-500/10 border-primary-500 text-primary-500'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-primary-500/50 hover:text-primary-500',
                  )
                "
                @click="activeTag = tag"
              >
                {{ tag }}
              </button>
            </div>

            <!-- View mode toggle - Desktop -->
            <div class="hidden sm:flex items-center gap-1 shrink-0 border-l border-neutral-200 dark:border-neutral-800 pl-3">
              <UTooltip
                v-for="mode in (['list', 'cards', 'compact'] as const)"
                :key="mode"
                :text="mode === 'list' ? t('blog.viewList') : mode === 'cards' ? t('blog.viewCards') : t('blog.viewCompact')"
              >
                <button
                  :class="cn(
                    'p-1.5 transition-all cursor-pointer',
                    viewMode === mode
                      ? 'text-primary-500 bg-primary-500/10'
                      : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300',
                  )"
                  @click="viewMode = mode"
                >
                  <UIcon
                    :name="mode === 'list' ? 'i-heroicons-bars-3' : mode === 'cards' ? 'i-heroicons-squares-2x2' : 'i-heroicons-list-bullet'"
                    class="w-4 h-4"
                  />
                </button>
              </UTooltip>
            </div>

            <!-- View mode toggle - Mobile dropdown -->
            <div class="sm:hidden relative shrink-0 border-l border-neutral-200 dark:border-neutral-800 pl-3">
              <button
                class="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all"
                @click="showViewDropdown = !showViewDropdown"
              >
                <UIcon
                  :name="viewMode === 'list' ? 'i-heroicons-bars-3' : viewMode === 'cards' ? 'i-heroicons-squares-2x2' : 'i-heroicons-list-bullet'"
                  class="w-4 h-4"
                />
              </button>
              <Transition
                enter-active-class="transition-all duration-150 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-all duration-100 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-if="showViewDropdown"
                  class="absolute right-0 top-full mt-1 z-20 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
                >
                  <button
                    v-for="mode in (['list', 'cards', 'compact'] as const)"
                    :key="mode"
                    :class="cn(
                      'flex items-center gap-2 w-full px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors',
                      viewMode === mode
                        ? 'text-primary-500 bg-primary-500/10'
                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800',
                    )"
                    @click="viewMode = mode; showViewDropdown = false"
                  >
                    <UIcon
                      :name="mode === 'list' ? 'i-heroicons-bars-3' : mode === 'cards' ? 'i-heroicons-squares-2x2' : 'i-heroicons-list-bullet'"
                      class="w-4 h-4"
                    />
                    {{ mode === 'list' ? t('blog.viewList') : mode === 'cards' ? t('blog.viewCards') : t('blog.viewCompact') }}
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </UiAnimatedSection>

        <!-- Blog posts -->
        <UiAnimatedSection animation="fadeInUp" :delay="150" :duration="500">

          <!-- List view (oxc.rs style) -->
          <TransitionGroup
            v-if="viewMode === 'list' && paginatedPosts.length > 0"
            tag="div"
            class="divide-y divide-neutral-200 dark:divide-neutral-800"
            enter-active-class="blog-item-enter"
            leave-active-class="blog-item-leave"
            enter-from-class="blog-item-from"
            enter-to-class="blog-item-to"
            leave-from-class="blog-item-to"
            leave-to-class="blog-item-from"
          >
            <BlogPostRow
              v-for="(post, index) in paginatedPosts"
              :key="post.path"
              :post="post"
              :show-author="true"
              :style="{ transitionDelay: `${index * 50}ms` }"
            />
          </TransitionGroup>

          <!-- Cards view -->
          <TransitionGroup
            v-else-if="viewMode === 'cards' && paginatedPosts.length > 0"
            tag="div"
            class="grid grid-cols-1 sm:grid-cols-2 gap-4"
            enter-active-class="blog-item-enter"
            leave-active-class="blog-item-leave"
            enter-from-class="blog-item-from"
            enter-to-class="blog-item-to"
            leave-from-class="blog-item-to"
            leave-to-class="blog-item-from"
          >
            <NuxtLink
              v-for="(post, index) in paginatedPosts"
              :key="post.path"
              :to="postUrl(post)"
              :class="cn(
                'relative block p-5 border border-neutral-200 dark:border-neutral-800 overflow-hidden',
                'hover:border-primary-500/50 transition-all group',
              )"
              :style="{ transitionDelay: `${index * 60}ms` }"
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
              <div class="relative z-10">
                <span v-if="post.publishedAt" class="block text-[10px] font-mono text-neutral-500 mb-2">
                  {{ formatDate(post.publishedAt) }}
                </span>
                <h3 class="text-base font-medium text-primary-500 group-hover:text-primary-400 transition-colors" style="font-family: 'Fenix', serif;">
                  {{ post.title }}
                </h3>
                <p
                  v-if="post.description"
                  class="text-xs text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2"
                >
                  {{ post.description }}
                </p>
                <div v-if="post.tags?.length" class="flex flex-wrap gap-1.5 mt-3">
                  <UiTag
                    v-for="tag in post.tags.slice(0, 3)"
                    :key="tag"
                    :label="tag"
                    variant="auto"
                  />
                </div>
              </div>
            </NuxtLink>
          </TransitionGroup>

          <!-- Compact view -->
          <TransitionGroup
            v-else-if="viewMode === 'compact' && paginatedPosts.length > 0"
            tag="div"
            class="space-y-1"
            enter-active-class="blog-item-enter"
            leave-active-class="blog-item-leave"
            enter-from-class="blog-item-from"
            enter-to-class="blog-item-to"
            leave-from-class="blog-item-to"
            leave-to-class="blog-item-from"
          >
            <NuxtLink
              v-for="(post, index) in paginatedPosts"
              :key="post.path"
              :style="{ transitionDelay: `${index * 40}ms` }"
              :to="postUrl(post)"
              class="flex items-center gap-4 py-2 px-2 -mx-2 group transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30"
            >
              <span v-if="post.publishedAt" class="shrink-0 w-24 text-[10px] font-mono text-neutral-500">
                {{ formatDate(post.publishedAt) }}
              </span>
              <span class="text-sm text-primary-500 group-hover:text-primary-400 transition-colors truncate">
                {{ post.title }}
              </span>
            </NuxtLink>
          </TransitionGroup>

          <!-- Pagination -->
          <nav
            v-if="totalPages > 1"
            class="flex items-center justify-center gap-1 mt-8"
            aria-label="Pagination"
          >
            <!-- Prev -->
            <button
              :disabled="currentPage === 1"
              :class="cn(
                'px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all',
                'border border-neutral-200 dark:border-neutral-800',
                currentPage === 1
                  ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
                  : 'text-neutral-500 hover:text-primary-500 hover:border-primary-500/50',
              )"
              @click="goToPage(currentPage - 1)"
            >
              <UIcon name="i-heroicons-chevron-left" class="w-3.5 h-3.5" />
            </button>

            <!-- Page numbers -->
            <template v-for="page in pageNumbers" :key="page">
              <span
                v-if="page === '...'"
                class="px-2 py-1.5 text-xs font-mono text-neutral-400"
              >
                ...
              </span>
              <button
                v-else
                :class="cn(
                  'min-w-[32px] px-2 py-1.5 text-xs font-mono transition-all',
                  'border',
                  currentPage === page
                    ? 'text-primary-500 border-primary-500/50 bg-primary-500/10'
                    : 'text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:text-primary-500 hover:border-primary-500/50',
                )"
                @click="goToPage(page as number)"
              >
                {{ page }}
              </button>
            </template>

            <!-- Next -->
            <button
              :disabled="currentPage === totalPages"
              :class="cn(
                'px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all',
                'border border-neutral-200 dark:border-neutral-800',
                currentPage === totalPages
                  ? 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
                  : 'text-neutral-500 hover:text-primary-500 hover:border-primary-500/50',
              )"
              @click="goToPage(currentPage + 1)"
            >
              <UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
            </button>
          </nav>

          <!-- Empty state -->
          <div
            v-if="filteredPosts.length === 0"
            class="flex flex-col items-center justify-center py-20 text-center"
          >
            <UIcon
              name="i-heroicons-document-text"
              class="w-10 h-10 text-neutral-400 dark:text-neutral-600 mb-4"
            />
            <p class="text-sm text-neutral-500 font-mono">
              {{ t('blog.noArticles') }}
            </p>
          </div>
        </UiAnimatedSection>
      </main>

      <!-- Explore Section -->
      <HomeExplore />
    </div>

    <!-- Right stripe zone -->
    <div
      class="hidden md:block fixed right-0 top-0 bottom-0 grid-background-blog -z-1" aria-hidden="true"
      style="width: calc(50% - 40rem); border-left: 1px solid var(--border-color)"
    />
  </div>
</template>
