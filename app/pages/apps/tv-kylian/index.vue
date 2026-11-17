<script setup lang="ts">
// /apps/tv-kylian: the homepage of « Accueil TV Kylian », my LG TV's home screen, given to
// its Google OAuth consent screen with the privacy policy beside it. Unlisted: nothing on the
// site links here, the sitemap leaves it out, and it is noindex in its head and in an
// X-Robots-Tag header (routeRules, nuxt.config). Never disallowed in robots.txt: a crawler
// that cannot fetch the page never reads its noindex.
import { useI18n } from '#imports'

const { t } = useI18n()

useSeoMeta({
  title: () => t('tvKylianPage.seoTitle'),
  description: () => t('tvKylianPage.seoDescription'),
  robots: 'noindex, nofollow',
})

// tvKylianPage.shows, in the locale files
const SHOWS = 6
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-20 sm:px-6">
    <section class="py-4 sm:py-8">
      <p class="eyebrow">{{ t('tvKylianPage.eyebrow') }}</p>
      <h1
        class="mt-4 max-w-3xl text-5xl tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-100"
        :aria-label="t('tvKylianPage.title')"
      >
        <UiScrambleText :text="t('tvKylianPage.title')" />
      </h1>
      <p class="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ t('tvKylianPage.intro') }}
      </p>
      <NuxtLinkLocale
        :to="{ name: 'apps-tv-kylian-confidentialite' }"
        class="btn btn-outline btn-sm mt-6"
      >
        <UIcon name="i-heroicons-shield-check-20-solid" class="size-4" aria-hidden="true" />
        <UiScrambleText :text="t('tvKylianPage.privacy')" effect="link" />
      </NuxtLinkLocale>
    </section>

    <UiPanel :title="t('tvKylianPage.showsTitle')">
      <div class="panel-card p-6 sm:p-8">
        <ul class="divide-y divide-dashed divide-neutral-200 dark:divide-neutral-800">
          <li
            v-for="i in SHOWS"
            :key="i"
            class="flex gap-3 py-3 text-sm leading-relaxed text-neutral-700 first:pt-0 last:pb-0 dark:text-neutral-300"
          >
            <UIcon
              name="i-heroicons-check-20-solid"
              class="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-500"
              aria-hidden="true"
            />
            <span>{{ t(`tvKylianPage.shows.${i - 1}`) }}</span>
          </li>
        </ul>
      </div>
    </UiPanel>
  </div>
</template>
