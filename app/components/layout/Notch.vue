<script setup lang="ts">
// The notch hanging under the floating navbar (both headers): the gwm announcement at
// rest, a menu once a nav item or the announcement is hovered (a pointer enhancement: the
// tabs and the announcement stay plain links for the keyboard). It widens and
// opens on its height like the site's collapses, the line on top turning into the page's
// name, and holds what the page has (its sections, the latest posts for the blog), a line
// of context and an illustration through the pixel layer, which follows the link under
// the pointer.
import { useI18n } from '#imports'

const { t } = useI18n()
const { active, open, keep, close, dismiss } = useNavMenu()
const { links: pages } = useSiteNav()
const cvUrl = useCvUrl()
const $img = useImage()

interface MenuLink {
  label: string
  /** A path, or a route by name where the page's address changes with the language */
  to: string | { name: string; hash?: string }
  external?: boolean
  /** The illustration while this link is hovered or focused */
  image?: string
}
interface Menu {
  text: string
  links: MenuLink[]
  image: string
}

const SCENES = '/images/scenes'
const ME = '/images/me/portrait.webp'
const GWM = '/images/apps/gwm.webp'

// The blog's menu lists its latest posts, fetched the first time it opens; each shows its
// banner, through IPX (the originals weigh megabytes)
const { collection } = useBlogCollection()
const { postUrl } = useBlogUrl()
const posts = ref<{ title: string; path: string; bannerImage?: string }[]>([])
// Their rows hold the place while they come (skeletons)
const postsLoading = ref(false)
watch(active, async (key) => {
  if (key !== '/blog' || posts.value.length || postsLoading.value) return
  postsLoading.value = true
  // A failed query leaves the menu with its "all posts" link only
  posts.value = await queryCollection(collection.value)
    .order('publishedAt', 'DESC')
    .select('title', 'path', 'bannerImage')
    .limit(3)
    .all()
    .catch(() => [])
  postsLoading.value = false
})
// Another language: its own posts, fetched again on the next opening
watch(collection, () => (posts.value = []))
const colorMode = useColorMode()
const banner = (src?: string) =>
  src
    ? $img(blogBanner(src, isDarkMode(colorMode.value)), { width: 480, format: 'webp' })
    : undefined

const menus = computed<Record<string, Menu>>(() => ({
  '/': {
    text: t('navMenu.home'),
    links: [
      { label: t('bio.title'), to: '/#about', image: ME },
      { label: t('blog.title'), to: '/#latest-posts', image: `${SCENES}/village.webp` },
      { label: t('skills.title'), to: '/#skills', image: `${SCENES}/circuit-red.webp` },
      { label: t('projects.title'), to: '/#projects', image: GWM },
    ],
    image: `${SCENES}/city-gate.webp`,
  },
  '/experience': {
    text: t('navMenu.experience'),
    links: [
      {
        label: t('experiencePage.experienceLabel'),
        to: { name: 'experience', hash: '#experience' },
        image: '/images/projects/jewely-x-flippad.webp',
      },
      {
        label: t('experiencePage.educationLabel'),
        to: { name: 'experience', hash: '#education' },
        image: `${SCENES}/city-marble.webp`,
      },
      { label: 'Open source', to: { name: 'experience', hash: '#open-source' }, image: GWM },
    ],
    image: '/images/projects/fiches-pedagogiques.webp',
  },
  '/apps': {
    text: t('navMenu.apps'),
    links: [
      { label: 'gwm', to: '/apps#gwm', image: GWM },
      { label: 'vellum', to: '/apps#vellum', image: `${SCENES}/circuit-red.webp` },
      { label: 'LazyCurl', to: '/apps#lazycurl', image: '/images/apps/lazycurl.webp' },
    ],
    image: GWM,
  },
  '/activity': {
    text: t('navMenu.activity'),
    links: [
      { label: 'Open source', to: '/activity#activity-open-source-heading', image: GWM },
      {
        label: t('activityPage.feedTitle'),
        to: '/activity#activity-feed-heading',
        image: `${SCENES}/city-domes.webp`,
      },
    ],
    image: `${SCENES}/circuit-red.webp`,
  },
  '/blog': {
    text: t('navMenu.blog'),
    links: [
      ...posts.value.map((post) => ({
        label: post.title,
        to: postUrl(post),
        image: banner(post.bannerImage),
      })),
      { label: t('blog.viewAll'), to: '/blog' },
    ],
    image: banner(posts.value[0]?.bannerImage) ?? `${SCENES}/village.webp`,
  },
  '/contact': {
    text: t('navMenu.contact'),
    links: [
      { label: t('contactPage.write'), to: '/contact', image: ME },
      {
        label: 'hello@kbrdn.dev',
        to: 'mailto:hello@kbrdn.dev',
        external: true,
        image: '/images/me/avatar.webp',
      },
      ...(cvUrl.value ? [{ label: t('contactPage.cv'), to: cvUrl.value, external: true }] : []),
    ],
    image: ME,
  },
  gwm: {
    text: t('navMenu.gwm'),
    links: [
      { label: 'gwm.kbrdn.dev', to: 'https://gwm.kbrdn.dev', external: true },
      { label: 'GitHub', to: 'https://github.com/kbrdn1/gwm-cli', external: true },
      { label: t('navMenu.gwmApps'), to: '/apps#gwm' },
    ],
    image: GWM,
  },
}))

const menu = computed(() => (active.value ? menus.value[active.value] : undefined))
const pageLabel = computed(() => pages.value.find((page) => page.to === active.value)?.label)

// The illustration follows the link under the pointer, the menu's own until one is hovered.
// It stays on the last link once the pointer leaves it, so it can reach the picture.
const hovered = ref<string>()
const image = computed(() => hovered.value ?? menu.value?.image)
watch(active, () => (hovered.value = undefined))

// Escape from inside a menu: its content turns inert as it closes, so focus goes back to what
// opened it (the announcement, or the page's tab) instead of falling to the body
const root = ref<HTMLElement>()
function onEscape(event: KeyboardEvent) {
  const inside = (event.target as Element | null)?.closest('.expand-content')
  const key = active.value
  close(0)
  if (!inside || !key) return
  const opener =
    key === 'gwm'
      ? root.value?.querySelector<HTMLElement>('a[href="https://gwm.kbrdn.dev"]')
      : document.querySelector<HTMLElement>(`header .segment[data-key="${key}"]`)
  opener?.focus()
}

// A new page closes it
const route = useRoute()
watch(
  () => route.path,
  () => close(0),
)
</script>

<template>
  <div
    ref="root"
    class="notch pointer-events-auto relative mx-auto w-(--notch-w)"
    @mouseenter="keep"
    @mouseleave="close()"
    @keydown.esc="onEscape"
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
        @mouseenter="open('gwm', $event)"
      >
        <UIcon name="i-heroicons-rocket-launch" class="size-3.5 shrink-0 text-primary-500" />
        <span class="truncate">{{ t('banner.gwm') }}</span>
        <UIcon name="i-heroicons-arrow-right-20-solid" class="size-3 shrink-0" />
      </a>
    </Transition>

    <UiExpand :open="!!menu">
      <div class="border-t border-dashed border-(--card-border) p-2">
        <div v-if="menu" class="grid grid-cols-[minmax(0,1fr)_17rem] items-start gap-3">
          <Transition name="swap-up" mode="out-in">
            <div :key="active ?? ''" class="min-w-0 py-1">
              <p class="px-2 text-[13px] leading-snug text-neutral-600 dark:text-neutral-400">
                {{ menu.text }}
              </p>
              <ul class="mt-2">
                <li
                  v-for="i in active === '/blog' && postsLoading ? 3 : 0"
                  :key="`loading-${i}`"
                  class="flex h-8 items-center px-2"
                  aria-hidden="true"
                >
                  <UiSkeleton class="h-3" :style="{ width: `${[78, 62, 70][i - 1]}%` }" />
                </li>
                <li v-for="link in menu.links" :key="link.label">
                  <NuxtLinkLocale
                    :to="link.to"
                    :target="link.external ? '_blank' : undefined"
                    :rel="link.external ? 'noopener noreferrer' : undefined"
                    class="row group flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-900 dark:text-neutral-100"
                    @mouseenter="hovered = link.image ?? hovered"
                    @focus="hovered = link.image ?? hovered"
                    @click="dismiss"
                  >
                    <span class="truncate group-hover:text-(--accent-text)">{{ link.label }}</span>
                    <span class="eyebrow ml-auto shrink-0" aria-hidden="true">
                      {{ link.external ? '↗' : '→' }}
                    </span>
                  </NuxtLinkLocale>
                </li>
              </ul>
            </div>
          </Transition>
          <!-- One picture for the whole menu: changing it sweeps the new one in, block by
               block, instead of the picture leaving with the links -->
          <div
            class="aspect-[16/11] overflow-hidden rounded-xl bg-(--placeholder) ring-1 ring-(--card-border)"
          >
            <ClientOnly>
              <UiPixelImage v-if="image" :src="image" alt="" class="size-full" reveal />
            </ClientOnly>
          </div>
        </div>
      </div>
    </UiExpand>
  </div>
</template>
