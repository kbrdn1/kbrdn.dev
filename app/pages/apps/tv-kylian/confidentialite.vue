<script setup lang="ts">
// /apps/tv-kylian/confidentialite, /en/apps/tv-kylian/privacy: the privacy policy of
// « Accueil TV Kylian », the page its Google OAuth consent screen links to. Unlisted and
// noindex like the app's homepage (apps/tv-kylian/index.vue). The text describes the app,
// not this site: a sentence that stops being true of the app is a change here first.
import { useI18n } from '#imports'

const { t } = useI18n()
const { formatDate } = useFormatDate()
const localePath = useLocalePath()

// Bump with any change to what the policy says
const UPDATED = '2026-11-17'
const POLICY = 'https://developers.google.com/terms/api-services-user-data-policy'
const PERMISSIONS = 'https://myaccount.google.com/permissions'

useSeoMeta({
  title: () => t('tvKylianPrivacy.seoTitle'),
  description: () => t('tvKylianPrivacy.seoDescription'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-20 sm:px-6">
    <section class="py-4 sm:py-8">
      <p class="eyebrow">{{ t('tvKylianPrivacy.eyebrow') }}</p>
      <h1
        class="mt-4 max-w-3xl text-5xl tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-100"
        :aria-label="t('tvKylianPrivacy.title')"
      >
        <UiScrambleText :text="t('tvKylianPrivacy.title')" />
      </h1>
      <p class="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {{ t('tvKylianPrivacy.updated', { date: formatDate(UPDATED, 'long') }) }}
      </p>
    </section>

    <UiPanel>
      <div class="panel-card px-5 py-2 sm:px-8 sm:py-4">
        <div class="prose-blog">
          <ProseP>{{ t('tvKylianPrivacy.intro') }}</ProseP>

          <ProseH2 id="google">{{ t('tvKylianPrivacy.google.title') }}</ProseH2>
          <ProseP>{{ t('tvKylianPrivacy.google.readOnly') }}</ProseP>
          <ProseUl>
            <ProseLi>
              <i18n-t keypath="tvKylianPrivacy.google.youtube" scope="global">
                <template #scope><ProseCode>youtube.readonly</ProseCode></template>
              </i18n-t>
            </ProseLi>
            <ProseLi>
              <i18n-t keypath="tvKylianPrivacy.google.calendar" scope="global">
                <template #scope><ProseCode>calendar.readonly</ProseCode></template>
              </i18n-t>
            </ProseLi>
          </ProseUl>
          <ProseP>
            <i18n-t keypath="tvKylianPrivacy.google.assistant" scope="global">
              <template #scope><ProseCode>assistant-sdk-prototype</ProseCode></template>
            </i18n-t>
          </ProseP>
          <ProseP>{{ t('tvKylianPrivacy.google.use') }}</ProseP>

          <ProseH2 id="limited-use">{{ t('tvKylianPrivacy.limitedUse.title') }}</ProseH2>
          <ProseP>
            <i18n-t keypath="tvKylianPrivacy.limitedUse.text" scope="global">
              <template #policy>
                <ProseA :href="POLICY" target="_blank">Google API Services User Data Policy</ProseA>
              </template>
            </i18n-t>
          </ProseP>

          <ProseH2 id="services">{{ t('tvKylianPrivacy.others.title') }}</ProseH2>
          <ProseUl>
            <ProseLi>{{ t('tvKylianPrivacy.others.session') }}</ProseLi>
            <ProseLi>{{ t('tvKylianPrivacy.others.public') }}</ProseLi>
            <ProseLi>{{ t('tvKylianPrivacy.others.local') }}</ProseLi>
          </ProseUl>

          <ProseH2 id="storage">{{ t('tvKylianPrivacy.storage.title') }}</ProseH2>
          <ProseP>{{ t('tvKylianPrivacy.storage.where') }}</ProseP>
          <ProseP>{{ t('tvKylianPrivacy.storage.none') }}</ProseP>

          <ProseH2 id="revoke">{{ t('tvKylianPrivacy.revoke.title') }}</ProseH2>
          <ProseUl>
            <ProseLi>{{ t('tvKylianPrivacy.revoke.app') }}</ProseLi>
            <ProseLi>
              <i18n-t keypath="tvKylianPrivacy.revoke.google" scope="global">
                <template #link>
                  <ProseA :href="PERMISSIONS" target="_blank"
                    >myaccount.google.com/permissions</ProseA
                  >
                </template>
              </i18n-t>
            </ProseLi>
          </ProseUl>

          <ProseH2 id="contact">{{ t('tvKylianPrivacy.contact.title') }}</ProseH2>
          <ProseP>
            <i18n-t keypath="tvKylianPrivacy.contact.text" scope="global">
              <template #link>
                <ProseA :href="localePath('contact')">{{
                  t('tvKylianPrivacy.contact.link')
                }}</ProseA>
              </template>
            </i18n-t>
          </ProseP>
        </div>
      </div>
    </UiPanel>

    <NuxtLinkLocale to="/apps/tv-kylian" class="btn btn-outline btn-sm">
      <UIcon name="i-heroicons-arrow-left-20-solid" class="size-4" aria-hidden="true" />
      <UiScrambleText :text="t('tvKylianPrivacy.back')" effect="link" />
    </NuxtLinkLocale>
  </div>
</template>
