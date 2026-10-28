<script setup lang="ts">
import { useI18n } from '#imports'

definePageMeta({ layout: 'blog' })

const { t } = useI18n()
const { locale, collection, fallback } = useBlogCollection()
const route = useRoute()
const slug = route.params.slug as string

const { data: post } = await useAsyncData(
  `blog-${slug}`,
  async () => {
    const found = await queryCollection(collection.value).path(`/blogs/${slug}`).first()
    // Fall back to the other locale when this article isn't translated yet
    return found ?? (await queryCollection(fallback.value).path(`/blogs/${slug}`).first())
  },
  { watch: [locale] },
)
// Neither language has it: a real 404 for the reader and the crawlers, not an empty 200
if (!post.value)
  throw createError({ statusCode: 404, statusMessage: 'Article not found', fatal: true })

// Fetch related posts (recent posts excluding current)
const { data: relatedPosts } = await useAsyncData(
  `blog-related-${slug}`,
  async () => {
    const all = await queryCollection(collection.value).order('publishedAt', 'DESC').limit(7).all()
    return all.filter((p) => p.path !== `/blogs/${slug}`).slice(0, 6)
  },
  { watch: [locale] },
)

const minutes = computed(() => readingTime(post.value?.body))
const { formatDate } = useFormatDate()

// The device's own share sheet (Web Share), where the browser has one: checked once mounted,
// the server cannot know
const canShare = ref(false)
onMounted(() => (canShare.value = typeof navigator.share === 'function'))
async function share() {
  try {
    await navigator.share({
      title: post.value?.title,
      text: post.value?.description,
      url: window.location.href,
    })
  } catch {
    // Dismissed, or refused: nothing to do
  }
}

// Copy link functionality
const linkCopied = ref(false)
async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch {
    const input = document.createElement('input')
    input.value = window.location.href
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  }
}

// The language the article is written in: the other one's when it isn't translated yet
const postLang = computed(() => (post.value?.id.startsWith('blog_fr') ? 'fr' : 'en'))
const siteUrl = useSiteUrl()
const person = usePersonRef()
useSeoMeta({
  title: () => post.value?.title,
  description: () => post.value?.description,
  ogTitle: () => post.value?.title,
  ogDescription: () => post.value?.description,
  ogType: 'article',
  articlePublishedTime: () => post.value?.publishedAt,
  articleAuthor: [siteUrl('/')],
  articleTag: () => post.value?.tags ?? [],
  twitterCard: 'summary_large_image',
})
usePageSchema(
  'WebPage',
  () => ({ name: post.value?.title ?? '', description: post.value?.description }),
  {
    trail: () => [
      { name: t('nav.blog'), path: '/blog' },
      { name: post.value?.title ?? '', path: route.path },
    ],
    nodes: () => [
      {
        '@type': 'BlogPosting',
        '@id': `${siteUrl(route.path)}#article`,
        mainEntityOfPage: { '@id': `${siteUrl(route.path)}#webpage` },
        isPartOf: { '@id': `${siteUrl('/blog')}#blog` },
        headline: post.value?.title,
        description: post.value?.description,
        inLanguage: postLang.value,
        ...(post.value?.publishedAt && {
          datePublished: post.value.publishedAt,
          dateModified: post.value.publishedAt,
        }),
        ...(post.value?.bannerImage && { image: siteUrl(post.value.bannerImage) }),
        keywords: post.value?.tags?.join(', '),
        timeRequired: `PT${minutes.value}M`,
        author: person,
        publisher: person,
      },
    ],
  },
)
useSiteOgImage('Blog', {
  title: post.value.title,
  description: post.value.description,
  date: post.value.publishedAt ? formatDate(post.value.publishedAt, 'short') : '',
  tags: post.value.tags || [],
  minutes: minutes.value,
  bannerImage: post.value.bannerImage,
})

// Table of contents
interface TocItem {
  id: string
  text: string
  level: number
}

const tocItems = ref<TocItem[]>([])
const activeHeading = ref('')
const articleRef = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

onMounted(() => {
  nextTick(() => {
    if (!articleRef.value) return

    // Extract headings from rendered content
    const headings = articleRef.value.querySelectorAll(
      '.prose-blog h1, .prose-blog h2, .prose-blog h3',
    )
    const items: TocItem[] = []

    headings.forEach((heading) => {
      const el = heading as HTMLElement
      // Generate id if missing
      if (!el.id) {
        el.id =
          el.textContent
            ?.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '') || ''
      }
      items.push({
        id: el.id,
        text: el.textContent || '',
        level: parseInt(el.tagName.charAt(1)),
      })
    })

    tocItems.value = items

    // Observe headings for active state
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeHeading.value = entry.target.id
          }
        }
      },
      { rootMargin: '-112px 0px -70% 0px' },
    )

    headings.forEach((heading) => observer!.observe(heading))
  })
})

onUnmounted(() => observer?.disconnect())

// Reading progress based on active heading position in TOC
const readProgress = computed(() => {
  if (!tocItems.value.length || !activeHeading.value) return 0
  const idx = tocItems.value.findIndex((i) => i.id === activeHeading.value)
  if (idx < 0) return 0
  return Math.round(((idx + 1) / tocItems.value.length) * 100)
})

const activeHeadingText = computed(() => {
  const item = tocItems.value.find((i) => i.id === activeHeading.value)
  return item?.text || ''
})

function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (el) {
    // Under the floating navbar and its notch (they end at 90px), like the router's anchors
    const offset = 112
    const top = el.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: isMotionReduced() ? 'auto' : 'smooth' })
    // The reader (and a screen reader) goes on from the heading, not from the contents
    el.setAttribute('tabindex', '-1')
    el.focus({ preventScroll: true })
  }
}
</script>

<template>
  <div class="min-h-screen flex justify-center overflow-x-clip">
    <!-- Main content -->
    <div ref="articleRef" class="w-full flex flex-col items-center relative z-10">
      <!-- Article found -->
      <article v-if="post" class="w-full" style="max-width: 80rem; margin: 0 auto">
        <BlogArticleHeader :post="post" :reading-time="minutes" />

        <div class="flex gap-6 lg:gap-10 px-4 sm:px-6 lg:px-12 pb-8 sm:pb-12">
          <!-- Main column -->
          <div class="flex-1 min-w-0">
            <!-- Article body -->
            <div class="prose-blog">
              <ContentRenderer :value="post" />
            </div>
          </div>

          <!-- TOC sidebar + promo card -->
          <div class="hidden lg:block w-64 shrink-0">
            <div class="sticky top-20 flex flex-col gap-4 max-h-[calc(100vh-6rem)]">
              <BlogToc
                :items="tocItems"
                :active-heading="activeHeading"
                :progress="readProgress"
                @scroll-to="scrollToHeading"
              />
              <BlogSidebarCard
                title="gwm: Git Worktree Manager"
                :description="t('blog.sidebar.gwm')"
                image="/images/blog/gwm/banner.png"
                :badge="t('blog.sidebar.new')"
                url="https://github.com/kbrdn1/gwm-cli"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <footer class="mt-12 mb-28 lg:mb-16 space-y-8 px-6 lg:px-12">
          <!-- Separator -->
          <div class="border-b border-dashed border-(--card-border)" />

          <!-- Share section -->
          <div>
            <h2 class="eyebrow mb-3">{{ t('blog.shareArticle') }}</h2>
            <div class="flex flex-wrap gap-2">
              <button v-if="canShare" type="button" class="btn btn-primary btn-sm" @click="share">
                <UIcon name="i-lucide-share" class="size-4" aria-hidden="true" />
                {{ t('blog.share') }}
              </button>
              <button
                type="button"
                :aria-label="linkCopied ? t('blog.linkCopied') : t('blog.copyLink')"
                class="btn btn-outline btn-sm"
                @click="copyLink"
              >
                <UIcon :name="linkCopied ? 'i-lucide-check' : 'i-lucide-link'" class="size-4" />
                {{ linkCopied ? t('blog.linkCopied') : t('blog.copyLink') }}
              </button>
              <span class="sr-only" role="status">{{
                linkCopied ? t('blog.linkCopied') : ''
              }}</span>
            </div>
          </div>

          <!-- More articles -->
          <div v-if="relatedPosts?.length">
            <h2 class="eyebrow mb-3">{{ t('blog.moreArticles') }}</h2>
            <div class="panel space-y-1">
              <BlogPostRow v-for="related in relatedPosts" :key="related.path" :post="related" />
            </div>
          </div>

          <!-- Back to blog -->
          <BlogBackLink />
        </footer>
      </article>
    </div>

    <!-- Mobile TOC -->
    <BlogMobileToc
      :items="tocItems"
      :active-heading="activeHeading"
      :active-heading-text="activeHeadingText"
      :progress="readProgress"
      @scroll-to="scrollToHeading"
    />
  </div>
</template>
