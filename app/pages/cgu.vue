<script setup lang="ts">
// /cgu, /en/terms: legal notice, terms of use, personal data and cookies, in prose
// (content/{fr,en}/cgu.mdx). Linked from the footer and from the cookie banner.
import { useI18n } from '#imports'

const { t, locale } = useI18n()
const { formatDate } = useFormatDate()

const { data: page } = await useAsyncData(
  'cgu',
  () => queryCollection('legal').path(`/${locale.value}/cgu`).first(),
  { watch: [locale] },
)
if (!page.value) throw createError({ statusCode: 404, statusMessage: 'Page not found' })

useSeoMeta({
  title: () => `${page.value?.title} · Kylian Bardini`,
  description: () => page.value?.description,
  ogTitle: () => `${page.value?.title} · Kylian Bardini`,
  ogDescription: () => page.value?.description,
})
</script>

<template>
  <div v-if="page" class="mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-20 sm:px-6">
    <section class="py-4 sm:py-8">
      <p class="eyebrow">{{ t('legalPage.eyebrow') }}</p>
      <h1
        class="mt-4 max-w-3xl text-5xl tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-100"
        :aria-label="page.title"
      >
        <UiScrambleText :text="page.title" />
      </h1>
      <p class="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ t('legalPage.updated', { date: formatDate(page.updatedAt, 'long') }) }}
      </p>
    </section>

    <UiPanel>
      <div class="panel-card px-5 py-2 sm:px-8 sm:py-4">
        <div class="prose-blog" :lang="locale">
          <ContentRenderer :value="page" />
        </div>
      </div>
    </UiPanel>
  </div>
</template>
