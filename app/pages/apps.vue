<script setup lang="ts">
// /apps: the terminal apps, with their status as the site states it (LazyCurl is
// "archived" here, its repository is untouched) and their latest release read live
// from GitHub. Features and install commands come from each README.
import { useI18n } from '#imports'

const { t } = useI18n()

useSeoMeta({
  title: () => t('appsPage.seoTitle'),
  description: () => t('appsPage.seoDescription'),
  ogTitle: () => t('appsPage.seoTitle'),
  ogDescription: () => t('appsPage.seoDescription'),
  twitterCard: 'summary_large_image',
})

useSiteOgImage('Default', {
  title: t('appsPage.ogTitle'),
  subtitle: t('appsPage.ogSubtitle'),
  scene: 'terminal',
})

const RAW = 'https://raw.githubusercontent.com/kbrdn1'
const APPS = [
  {
    key: 'gwm',
    name: 'gwm',
    repo: 'gwm-cli',
    language: 'Rust',
    license: 'MIT OR Apache-2.0',
    status: 'released',
    site: 'https://gwm.kbrdn.dev',
    logo: {
      dark: `${RAW}/gwm-cli/HEAD/docs/_assets/logo.svg`,
      light: `${RAW}/gwm-cli/HEAD/docs/_assets/logo-light.svg`,
    },
    icon: 'i-simple-icons-rust',
    features: 4,
    // docs/2.tui/_assets/hero.png and docs/_capture/demo.gif of gwm-cli, as webp and mp4
    image: '/images/apps/gwm.webp',
    video: '/images/apps/gwm-demo.mp4',
    // From the gwm-cli README's install table
    install: [
      'brew tap kbrdn1/tap && brew install gwm',
      'cargo install gwm-cli',
      'scoop bucket add gwm https://github.com/kbrdn1/scoop-gwm; scoop install gwm',
      'nix profile install github:kbrdn1/gwm-cli',
      'aqua g -i kbrdn1/gwm-cli',
    ],
  },
  {
    key: 'vellum',
    name: 'vellum',
    repo: 'vellum',
    language: 'Rust',
    license: 'MIT',
    status: 'inDevelopment',
    icon: 'i-simple-icons-rust',
    features: 3,
  },
  {
    key: 'lazycurl',
    name: 'LazyCurl',
    repo: 'LazyCurl',
    language: 'Go',
    license: 'MIT',
    status: 'archived',
    icon: 'i-simple-icons-go',
    features: 4,
    // preview-app.png of LazyCurl, as webp
    image: '/images/apps/lazycurl.webp',
  },
] as const

// Each app as source code (no SoftwareApplication: its rich result wants a price or a rating)
const person = usePersonRef()
usePageSchema(
  'CollectionPage',
  () => ({
    name: t('appsPage.seoTitle'),
    description: t('appsPage.seoDescription'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: APPS.map((app, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'SoftwareSourceCode',
          name: app.name,
          description: t(`appsPage.apps.${app.key}.tagline`),
          codeRepository: `https://github.com/kbrdn1/${app.repo}`,
          programmingLanguage: app.language,
          ...('site' in app && { url: app.site }),
          author: person,
        },
      })),
    },
  }),
  { trail: () => [{ name: t('nav.apps'), path: '/apps' }] },
)

const { data: releases, status: releasesStatus } = useFetch<
  Record<string, { version: string } | null>
>('/api/github/releases', { server: false, lazy: true, default: () => ({}) })

// The demo plays only while on screen, and not at all under prefers-reduced-motion
// (the screenshot stays as its poster, with the controls to start it by hand).
const reducedMotion = useReducedMotion()
let videoObserver: IntersectionObserver | undefined
onMounted(() => {
  videoObserver = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      const video = target as HTMLVideoElement
      if (isIntersecting && !reducedMotion.value) video.play().catch(() => {})
      else video.pause()
    }
  })
  document
    .querySelectorAll<HTMLVideoElement>('video[data-demo]')
    .forEach((v) => videoObserver!.observe(v))
})
onUnmounted(() => videoObserver?.disconnect())
// The pause control stops it on the spot (its controls show), and restarts it if on screen
watch(reducedMotion, (reduced) =>
  document.querySelectorAll<HTMLVideoElement>('video[data-demo]').forEach((v) => {
    const { top, bottom } = v.getBoundingClientRect()
    if (reduced) v.pause()
    else if (bottom > 0 && top < innerHeight) v.play().catch(() => {})
  }),
)

// Status tag colours: the tag tints itself from its text colour
const STATUS_CLASS: Record<string, string> = {
  released: 'text-green-800 dark:text-green-500',
  inDevelopment: 'text-primary-800 dark:text-primary-500',
  archived: 'text-neutral-600 dark:text-neutral-400',
}
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-20 sm:px-6">
    <!-- Intro, open on the page like the home's hero -->
    <!-- The scene beside it, under it on a phone -->
    <section
      class="flex flex-col gap-8 py-4 sm:py-8 md:flex-row md:items-center md:justify-between md:gap-12"
    >
      <div class="min-w-0 flex-1">
        <p class="eyebrow">{{ t('appsPage.eyebrow') }}</p>
        <h1
          class="mt-4 max-w-3xl text-5xl tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-100"
          :aria-label="t('appsPage.title')"
        >
          <UiScrambleText :text="t('appsPage.title')" />
        </h1>
        <p class="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          {{ t('appsPage.intro') }}
        </p>
      </div>
      <UiPixelScene
        scene="terminal"
        class="mx-auto w-56 shrink-0 sm:w-64 md:mx-0 md:w-52 lg:w-64"
      />
    </section>

    <!-- One panel per app, after disarto's deployment card: name and status in the header,
         the app in a card, its install commands and its picture in their own, the links in
         the footer -->
    <UiPanel
      v-for="app in APPS"
      :id="app.key"
      :key="app.key"
      :title="app.name"
      :subtitle="app.language"
      class="scroll-mt-28"
      :class="{ '[&_img]:opacity-80': app.status === 'archived' }"
    >
      <template #actions>
        <span
          v-if="releases?.[app.repo]?.version"
          class="tag text-neutral-600 dark:text-neutral-400"
        >
          {{ releases[app.repo]!.version }}
        </span>
        <UiSkeleton
          v-else-if="releasesStatus === 'pending' || releasesStatus === 'idle'"
          class="h-6 w-14 rounded-full"
        />
        <span :class="cn('tag mr-2', STATUS_CLASS[app.status])">
          <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {{ t(`appsPage.status.${app.status}`) }}
        </span>
      </template>

      <!-- The app in one card, after disarto's deployment card: the app and its features,
           then its install commands and its picture, each after a dashed rule -->
      <div class="panel-card relative isolate overflow-hidden p-6 sm:p-8">
        <UiPixelCanvas />
        <div class="grid gap-8 md:grid-cols-12">
          <!-- min-w-0 on every grid child: a grid item defaults to min-width: auto -->
          <div class="min-w-0 md:col-span-5">
            <span class="icon-box size-12">
              <template v-if="'logo' in app">
                <img
                  :src="app.logo.light"
                  alt=""
                  width="28"
                  height="28"
                  class="size-7 dark:hidden"
                />
                <img
                  :src="app.logo.dark"
                  alt=""
                  width="28"
                  height="28"
                  class="hidden size-7 dark:block"
                />
              </template>
              <UIcon v-else :name="app.icon" class="size-6 text-neutral-500" aria-hidden="true" />
            </span>
            <p class="mt-5 text-lg text-neutral-900 dark:text-neutral-100">
              {{ t(`appsPage.apps.${app.key}.tagline`) }}
            </p>
            <p class="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {{ t(`appsPage.apps.${app.key}.description`) }}
            </p>
          </div>
          <ul
            class="min-w-0 divide-y divide-dashed divide-neutral-200 self-start md:col-span-7 dark:divide-neutral-800"
          >
            <li
              v-for="i in app.features"
              :key="i"
              class="flex gap-3 py-3 text-sm leading-relaxed text-neutral-700 first:pt-0 last:pb-0 dark:text-neutral-300"
            >
              <UIcon
                name="i-heroicons-check-20-solid"
                class="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-500"
                aria-hidden="true"
              />
              <span>{{ t(`appsPage.apps.${app.key}.features.${i - 1}`) }}</span>
            </li>
          </ul>
        </div>

        <div
          v-if="'install' in app"
          class="mt-8 min-w-0 border-t border-dashed border-(--card-border) pt-6"
        >
          <h3 class="eyebrow">{{ t('appsPage.install') }}</h3>
          <pre
            class="relative z-10 mt-3 overflow-x-auto rounded-xl border border-(--card-border) bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300"
          ><code><span v-for="line in app.install" :key="line" class="block"><span class="select-none text-primary-500">$ </span>{{ line }}</span></code></pre>
        </div>

        <!-- The picture, labelled, inset with its own corners -->
        <figure
          v-if="'image' in app"
          class="relative z-10 mt-8 min-w-0 border-t border-dashed border-(--card-border) pt-6"
        >
          <figcaption class="eyebrow flex items-center gap-2">
            <UIcon
              :name="'video' in app ? 'i-heroicons-play-20-solid' : 'i-heroicons-photo-20-solid'"
              class="size-3.5"
              aria-hidden="true"
            />
            {{ t('video' in app ? 'appsPage.demo' : 'appsPage.preview') }}
          </figcaption>
          <div class="mt-3 overflow-hidden rounded-xl border border-(--card-border) bg-neutral-950">
            <!-- The video's own size: no 300 by 150 box before its poster, no jump when it
                 starts (the poster is a little wider, letterboxed on the dark card) -->
            <video
              v-if="'video' in app"
              data-demo
              :poster="app.image"
              width="1280"
              height="862"
              :controls="reducedMotion"
              :aria-label="t(`appsPage.apps.${app.key}.illustration`)"
              muted
              loop
              playsinline
              preload="none"
              class="block w-full"
            >
              <source :src="app.video" type="video/mp4" />
            </video>
            <!-- A screenshot through the pixel layer, crisp block by block while hovered -->
            <UiPixelImage
              v-else
              :src="app.image"
              :alt="t(`appsPage.apps.${app.key}.illustration`)"
              class="aspect-video w-full"
              reveal
            />
          </div>
        </figure>
      </div>

      <template #meta>{{ app.language }} · {{ app.license }}</template>
      <template #footer>
        <a
          v-if="app.status !== 'inDevelopment'"
          :href="`https://github.com/kbrdn1/${app.repo}/releases`"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-outline btn-sm"
        >
          <UiScrambleText :text="t('appsPage.releases')" effect="link" />
        </a>
        <a
          :href="`https://github.com/kbrdn1/${app.repo}`"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-outline btn-sm"
        >
          <UIcon name="i-simple-icons-github" class="size-4" aria-hidden="true" />
          <UiScrambleText :text="t('appsPage.repo')" effect="link" />
        </a>
        <a
          v-if="'site' in app"
          :href="app.site"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-primary btn-sm"
        >
          <UiScrambleText :text="t('appsPage.site')" effect="link" />
          <UIcon name="i-heroicons-arrow-up-right-20-solid" class="size-4" aria-hidden="true" />
        </a>
      </template>
    </UiPanel>
  </div>
</template>
