<script setup lang="ts">
// The notch hanging under the floating navbar (both headers): the gwm announcement at
// rest, a menu once a nav item or the announcement is hovered or focused. It opens on its
// height like the site's collapses, the line on top turning into the page's name, and
// holds what the page has (its sections, the latest posts for the blog), a line of
// context and an illustration through the pixel layer.
import { useI18n } from '#imports'

const { t } = useI18n()
const { active, open, keep, close } = useNavMenu()
const { links: pages } = useSiteNav()
const cvUrl = useCvUrl()

interface Menu {
  text: string
  links: { label: string; to: string; external?: boolean }[]
  image: string
}

// The blog's menu lists its latest posts, fetched the first time it opens
const { collection } = useBlogCollection()
const { postUrl } = useBlogUrl()
const posts = ref<{ title: string; path: string }[]>([])
watch(active, async (key) => {
  if (key !== '/blog' || posts.value.length) return
  posts.value = await queryCollection(collection.value)
    .order('publishedAt', 'DESC')
    .select('title', 'path')
    .limit(3)
    .all()
})

const menus = computed<Record<string, Menu>>(() => ({
  '/': {
    text: t('navMenu.home'),
    links: [
      { label: t('bio.title'), to: '/#about' },
      { label: t('blog.title'), to: '/#latest-posts' },
      { label: t('skills.title'), to: '/#skills' },
      { label: t('projects.title'), to: '/#projects' },
    ],
    image: '/images/scenes/city-gate.webp',
  },
  '/experience': {
    text: t('navMenu.experience'),
    links: [
      { label: t('experiencePage.experienceLabel'), to: '/experience#experience' },
      { label: t('experiencePage.educationLabel'), to: '/experience#education' },
      { label: 'Open source', to: '/experience#open-source' },
    ],
    image: '/images/projects/jewely-x-flippad.webp',
  },
  '/apps': {
    text: t('navMenu.apps'),
    links: [
      { label: 'gwm', to: '/apps#gwm' },
      { label: 'vellum', to: '/apps#vellum' },
      { label: 'LazyCurl', to: '/apps#lazycurl' },
    ],
    image: '/images/apps/gwm.webp',
  },
  '/activity': {
    text: t('navMenu.activity'),
    links: [
      { label: 'Open source', to: '/activity#activity-open-source-heading' },
      { label: t('activityPage.feedTitle'), to: '/activity#activity-feed-heading' },
    ],
    image: '/images/scenes/circuit-red.webp',
  },
  '/blog': {
    text: t('navMenu.blog'),
    links: [
      ...posts.value.map((post) => ({ label: post.title, to: postUrl(post) })),
      { label: t('blog.viewAll'), to: '/blog' },
    ],
    image: '/images/scenes/village.webp',
  },
  '/contact': {
    text: t('navMenu.contact'),
    links: [
      { label: t('contactPage.write'), to: '/contact' },
      { label: 'hello@kbrdn.dev', to: 'mailto:hello@kbrdn.dev', external: true },
      ...(cvUrl.value ? [{ label: t('contactPage.cv'), to: cvUrl.value, external: true }] : []),
    ],
    image: '/images/scenes/city-domes.webp',
  },
  gwm: {
    text: t('navMenu.gwm'),
    links: [
      { label: 'gwm.kbrdn.dev', to: 'https://gwm.kbrdn.dev', external: true },
      { label: 'GitHub', to: 'https://github.com/kbrdn1/gwm-cli', external: true },
      { label: t('navMenu.gwmApps'), to: '/apps#gwm' },
    ],
    image: '/images/apps/gwm.webp',
  },
}))

const menu = computed(() => (active.value ? menus.value[active.value] : undefined))

// A new page closes it
const route = useRoute()
watch(
  () => route.path,
  () => close(0),
)
const pageLabel = computed(() => pages.value.find((page) => page.to === active.value)?.label)
</script>

<template>
  <div
    class="notch relative mx-auto w-(--notch-w)"
    @mouseenter="keep"
    @mouseleave="close()"
    @keydown.esc="close(0)"
  >
    <!-- The line on top: the announcement, or the name of the page whose menu is open -->
    <Transition name="swap-up" mode="out-in">
      <p v-if="pageLabel" key="page" class="eyebrow flex h-7 items-center justify-center px-4">
        {{ pageLabel }}
      </p>
      <a
        v-else
        key="gwm"
        href="https://gwm.kbrdn.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="eyebrow flex h-7 items-center justify-center gap-2 px-4 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
        @mouseenter="open('gwm')"
        @focus="open('gwm')"
      >
        <UIcon name="i-heroicons-rocket-launch" class="size-3.5 shrink-0 text-primary-500" />
        <span class="truncate">{{ t('banner.gwm') }}</span>
        <UIcon name="i-heroicons-arrow-right-20-solid" class="size-3 shrink-0" />
      </a>
    </Transition>

    <UiExpand :open="!!menu">
      <div class="border-t border-dashed border-(--card-border) p-2">
        <Transition name="swap-up" mode="out-in">
          <div
            v-if="menu"
            :key="active ?? ''"
            class="grid grid-cols-[minmax(0,1fr)_9.5rem] items-start gap-3"
          >
            <div class="min-w-0 py-1">
              <p class="px-2 text-[13px] leading-snug text-neutral-600 dark:text-neutral-400">
                {{ menu.text }}
              </p>
              <ul class="mt-2">
                <li v-for="link in menu.links" :key="link.to">
                  <NuxtLink
                    :to="link.to"
                    :target="link.external ? '_blank' : undefined"
                    :rel="link.external ? 'noopener noreferrer' : undefined"
                    class="row group flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-900 dark:text-neutral-100"
                    @click="close(0)"
                  >
                    <span class="truncate group-hover:text-(--accent-text)">{{ link.label }}</span>
                    <span class="eyebrow ml-auto shrink-0" aria-hidden="true">
                      {{ link.external ? '↗' : '→' }}
                    </span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
            <div
              class="aspect-[4/5] overflow-hidden rounded-xl bg-neutral-200 ring-1 ring-(--card-border) dark:bg-neutral-900"
            >
              <ClientOnly>
                <UiPixelImage :src="menu.image" alt="" class="size-full" reveal />
              </ClientOnly>
            </div>
          </div>
        </Transition>
      </div>
    </UiExpand>
  </div>
</template>
