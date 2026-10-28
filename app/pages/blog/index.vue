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
  title: () => `${t('blog.title')} · Kylian Bardini`,
  description: () => t('blog.description'),
  ogTitle: () => t('blog.title'),
  ogDescription: () => t('blog.description'),
  twitterCard: 'summary_large_image',
})

useSiteOgImage('Default', {
  title: t('blog.title'),
  subtitle: 'blog@kbrdn1',
  description: t('blog.description'),
  scene: 'blog',
})

// The blog and its posts, newest first
const siteUrl = useSiteUrl()
const person = usePersonRef()
usePageSchema(
  'CollectionPage',
  () => ({ name: t('blog.title'), description: t('blog.description') }),
  {
    trail: () => [{ name: t('nav.blog'), path: '/blog' }],
    nodes: () => [
      {
        '@type': 'Blog',
        '@id': `${siteUrl('/blog')}#blog`,
        url: siteUrl('/blog'),
        name: t('blog.title'),
        description: t('blog.description'),
        author: person,
        blogPost: [...(posts.value ?? [])]
          .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
          .map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            url: siteUrl(postUrl(post)),
            ...(post.publishedAt && { datePublished: post.publishedAt }),
          })),
      },
    ],
  },
)

// Active tag filter
const activeTag = ref<string | null>(null)

// View mode: list (oxc style) | cards | compact
const viewMode = ref<'list' | 'cards' | 'compact'>('list')

onMounted(() => {
  if (window.innerWidth < 640) {
    viewMode.value = 'cards'
  }
})
const VIEW_MODES = [
  { mode: 'list', icon: 'i-heroicons-bars-3', label: 'blog.viewList' },
  { mode: 'cards', icon: 'i-heroicons-squares-2x2', label: 'blog.viewCards' },
  { mode: 'compact', icon: 'i-heroicons-list-bullet', label: 'blog.viewCompact' },
] as const

// A post's banner, resized by IPX: the pixel layer only needs a few hundred pixels of it
const $img = useImage()
const colorMode = useColorMode()
const bannerOf = (post: { bannerImage?: string }) =>
  $img(
    post.bannerImage ||
      (isDarkMode(colorMode.value) ? '/images/banners/dark.jpg' : '/images/banners/light.jpg'),
    { width: 640, format: 'webp' },
  )
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
  return posts.value.filter((post) => post.tags?.includes(activeTag.value!))
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
  <div class="mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-20 sm:px-6">
    <!-- Intro, open on the page like the home's hero -->
    <!-- The scene beside it, under it on a phone -->
    <section
      class="flex flex-col gap-8 py-4 sm:py-8 md:flex-row md:items-center md:justify-between md:gap-12"
    >
      <div class="min-w-0 flex-1">
        <p class="eyebrow">{{ t('sections.blog') }}</p>
        <h1
          class="mt-4 max-w-3xl text-5xl tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-100"
          :aria-label="t('blog.title')"
        >
          <UiScrambleText :text="t('blog.title')" />
        </h1>
        <p class="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          {{ t('blog.description') }}
        </p>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <span class="eyebrow">{{ postCount }}</span>
          <a
            href="https://github.com/sponsors/kbrdn1"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline btn-sm"
          >
            <UIcon name="i-heroicons-heart" class="size-4 text-pink-500" aria-hidden="true" />
            Sponsor
          </a>
        </div>
      </div>
      <UiPixelScene scene="blog" class="mx-auto w-56 shrink-0 sm:w-64 md:mx-0 md:w-52 lg:w-64" />
    </section>

    <div ref="blogListRef" class="scroll-mt-28" />
    <!-- After disarto's notes panel: a filter bar, the posts as cards, the pages in the
           footer -->
    <UiPanel>
      <div class="panel-card flex items-center gap-3 p-2">
        <!-- Tags: toggles, one at a time -->
        <div class="flex flex-1 gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            class="segment shrink-0"
            :aria-pressed="!activeTag"
            @click="activeTag = null"
          >
            {{ t('blog.allTags') }}
          </button>
          <button
            v-for="tag in allTags"
            :key="tag"
            type="button"
            class="segment shrink-0"
            :aria-pressed="activeTag === tag"
            @click="activeTag = tag"
          >
            {{ tag }}
          </button>
        </div>

        <!-- View mode -->
        <div class="segmented shrink-0">
          <UTooltip v-for="view in VIEW_MODES" :key="view.mode" :text="t(view.label)">
            <button
              type="button"
              class="segment px-2"
              :aria-label="t(view.label)"
              :aria-pressed="viewMode === view.mode"
              @click="viewMode = view.mode"
            >
              <UIcon :name="view.icon" class="size-4" aria-hidden="true" />
            </button>
          </UTooltip>
          <UiSegmentInk />
        </div>
      </div>

      <UiAutoHeight>
        <!-- The three views stay mounted, only their rows change: switching view, tag or
             page, the old rows close one after the other while the new ones open -->
        <!-- List view: a card per post -->
        <TransitionGroup
          tag="div"
          class="mt-1 space-y-1 empty:hidden"
          :css="false"
          @enter="rowEnter"
          @leave="rowLeave"
        >
          <BlogPostRow
            v-for="(post, index) in viewMode === 'list' ? paginatedPosts : []"
            :key="post.path"
            :post="post"
            :show-author="true"
            :style="{ '--i': index }"
          />
        </TransitionGroup>

        <!-- Cards view: the banner on top, through the pixel layer -->
        <TransitionGroup
          tag="div"
          class="relative mt-1 grid grid-cols-1 gap-1 empty:hidden sm:grid-cols-2"
          :css="false"
          @enter="rowEnter"
          @leave="rowLeave"
        >
          <!-- After disarto's event card: the banner full width on top, the card over its
                 bottom edge (tag and reading time, title, summary, then date, author and tags
                 between dashed rules), the call to read in the footer -->
          <NuxtLink
            v-for="(post, index) in viewMode === 'cards' ? paginatedPosts : []"
            :key="post.path"
            :to="postUrl(post)"
            class="panel group relative isolate flex flex-col overflow-hidden p-0 transition-colors hover:border-primary-500/50"
            :style="{ '--i': index }"
          >
            <ClientOnly v-if="post.banner">
              <div class="-mb-5 h-44 overflow-hidden">
                <UiPixelImage :src="bannerOf(post)" class="size-full" reveal />
              </div>
            </ClientOnly>
            <!-- In glass, a translucent card: it frosts the banner's edge it covers -->
            <div
              class="panel-card relative z-10 mx-1 flex flex-1 flex-col overflow-hidden p-5 blur:backdrop-blur-xl blur:backdrop-saturate-150"
            >
              <UiPixelCanvas />
              <div class="flex items-start justify-between gap-3">
                <UiTag v-if="post.tags?.length" :label="post.tags[0]!" variant="auto" />
                <p class="ml-auto shrink-0 text-2xl text-green-600 dark:text-green-500">
                  <UiRollingNumber :value="readingTime(post.body)" />
                  <span class="text-base text-neutral-500 dark:text-neutral-400"
                    >/ {{ t('blog.readingTime') }}</span
                  >
                </p>
              </div>
              <h3
                class="mt-3 text-xl tracking-tight text-neutral-900 transition-colors group-hover:text-primary-500 dark:text-neutral-100"
              >
                {{ post.title }}
              </h3>
              <p
                v-if="post.description"
                class="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400"
              >
                {{ post.description }}
              </p>

              <!-- Date and tag count on one mono line, between dashed rules -->
              <p
                class="eyebrow mt-auto flex items-center gap-2 border-y border-dashed border-(--card-border) py-2.5"
              >
                <UIcon name="i-heroicons-calendar" class="size-3.5" aria-hidden="true" />
                <template v-if="post.publishedAt">{{
                  formatDate(post.publishedAt, 'short')
                }}</template>
                <template v-if="post.tags?.length">
                  · {{ post.tags.length }} {{ t('blogNav.tags').toLowerCase() }}
                </template>
              </p>
              <div v-if="post.tags && post.tags.length > 1" class="flex flex-wrap gap-1.5 pt-4">
                <UiTag
                  v-for="tag in post.tags.slice(1, 4)"
                  :key="tag"
                  :label="tag"
                  variant="auto"
                />
              </div>
            </div>
            <div class="flex items-center justify-between gap-3 py-2.5 pr-2 pl-4">
              <span class="eyebrow">{{ t('sections.blog') }}</span>
              <span class="btn btn-primary btn-sm">
                {{ t('blog.read') }}
                <UIcon name="i-heroicons-arrow-right-20-solid" class="size-4" aria-hidden="true" />
              </span>
            </div>
          </NuxtLink>
          <!-- An odd page leaves a hole beside the last card: a hatched placeholder fills it -->
          <div
            v-if="viewMode === 'cards' && paginatedPosts.length % 2"
            key="next-post"
            class="panel hidden sm:flex"
          >
            <div
              class="panel-card hatched flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center"
            >
              <UIcon
                name="i-heroicons-pencil-square"
                class="size-5 text-(--label)"
                aria-hidden="true"
              />
              <p class="eyebrow">{{ t('blog.nextPost.eyebrow') }}</p>
              <p class="max-w-56 text-sm text-neutral-600 dark:text-neutral-400">
                {{ t('blog.nextPost.text') }}
              </p>
            </div>
          </div>
        </TransitionGroup>

        <!-- Compact view: dashed rows in one card -->
        <TransitionGroup
          tag="ul"
          class="panel-card mt-1 divide-y divide-dashed divide-(--card-border) px-5 empty:hidden"
          :css="false"
          @enter="rowEnter"
          @leave="rowLeave"
        >
          <li
            v-for="(post, index) in viewMode === 'compact' ? paginatedPosts : []"
            :key="post.path"
            :style="{ '--i': index }"
          >
            <NuxtLink :to="postUrl(post)" class="group flex items-center gap-6 py-3.5">
              <span v-if="post.publishedAt" class="eyebrow w-28 shrink-0">
                {{ formatDate(post.publishedAt) }}
              </span>
              <span
                class="truncate text-sm text-neutral-900 transition-colors group-hover:text-primary-500 dark:text-neutral-100"
              >
                {{ post.title }}
              </span>
            </NuxtLink>
          </li>
        </TransitionGroup>

        <!-- Empty state -->
        <div
          v-if="filteredPosts.length === 0"
          class="panel-card mt-1 flex flex-col items-center justify-center py-20 text-center"
        >
          <UiMascot mood="thinking" :size="80" class="mb-4" />
          <p class="eyebrow">{{ t('blog.noArticles') }}</p>
        </div>
      </UiAutoHeight>

      <template v-if="totalPages > 1" #meta>
        {{ String(currentPage).padStart(2, '0') }} / {{ String(totalPages).padStart(2, '0') }}
      </template>
      <template v-if="totalPages > 1" #footer>
        <nav class="flex items-center gap-1" aria-label="Pagination">
          <button
            type="button"
            class="icon-btn disabled:pointer-events-none disabled:opacity-40"
            :disabled="currentPage === 1"
            :aria-label="t('explore.previous')"
            @click="goToPage(currentPage - 1)"
          >
            <UIcon name="i-heroicons-chevron-left-20-solid" class="size-4" aria-hidden="true" />
          </button>
          <template v-for="page in pageNumbers" :key="page">
            <span v-if="page === '...'" class="eyebrow px-1">…</span>
            <button
              v-else
              type="button"
              class="segment min-w-8 px-2"
              :aria-current="currentPage === page ? 'page' : undefined"
              @click="goToPage(page as number)"
            >
              {{ page }}
            </button>
          </template>
          <button
            type="button"
            class="icon-btn disabled:pointer-events-none disabled:opacity-40"
            :disabled="currentPage === totalPages"
            :aria-label="t('explore.next')"
            @click="goToPage(currentPage + 1)"
          >
            <UIcon name="i-heroicons-chevron-right-20-solid" class="size-4" aria-hidden="true" />
          </button>
        </nav>
      </template>
    </UiPanel>

    <!-- Explore: a carousel, its own panel -->
    <HomeExplore />
  </div>
</template>
