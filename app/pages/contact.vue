<script setup lang="ts">
// /contact: a form to share the context (after isrod.eu's contact page and disarto's
// onboarding card: fields, then a topic as selectable chips), and the details beside it.
// Sent through /api/contact, which escapes every field into the email.
import { useI18n } from '#imports'

const { t } = useI18n()

useSeoMeta({
  title: () => t('contactPage.seoTitle'),
  description: () => t('contactPage.seoDescription'),
  ogTitle: () => t('contactPage.seoTitle'),
  ogDescription: () => t('contactPage.seoDescription'),
  twitterCard: 'summary_large_image',
})

useSiteOgImage('Default', {
  title: t('contactPage.ogTitle'),
  subtitle: t('contactPage.ogSubtitle'),
})

const TOPICS = ['role', 'project', 'openSource', 'other'] as const

const form = reactive({
  name: '',
  email: '',
  company: '',
  topic: '' as '' | (typeof TOPICS)[number],
  message: '',
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')

async function handleSubmit() {
  isSubmitting.value = true
  submitStatus.value = 'idle'
  try {
    await $fetch('/api/contact', { method: 'POST', body: form })
    submitStatus.value = 'success'
    Object.assign(form, { name: '', email: '', company: '', topic: '', message: '' })
  } catch {
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

const cvUrl = useCvUrl()

const SOCIALS = [
  { href: 'https://github.com/kbrdn1', icon: 'i-simple-icons-github', label: 'GitHub' },
  {
    href: 'https://linkedin.com/in/kylian-bardini-aa0528234',
    icon: 'i-simple-icons-linkedin',
    label: 'LinkedIn',
  },
  { href: 'https://twitter.com/kbrdn1', icon: 'i-simple-icons-x', label: 'X' },
]
</script>

<template>
  <div class="mx-auto w-full max-w-5xl space-y-8 px-4 pt-6 pb-20 sm:px-6">
    <!-- Intro, open on the page like the home's hero -->
    <!-- The scene beside it, under it on a phone -->
    <section
      class="flex flex-col gap-8 py-4 sm:py-8 md:flex-row md:items-center md:justify-between md:gap-12"
    >
      <div class="min-w-0 flex-1">
        <p class="eyebrow">{{ t('contactPage.eyebrow') }}</p>
        <h1
          class="mt-4 max-w-3xl text-5xl tracking-tight text-neutral-900 sm:text-6xl dark:text-neutral-100"
          :aria-label="t('contactPage.title')"
        >
          <UiScrambleText :text="t('contactPage.title')" />
        </h1>
        <p class="mt-6 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
          {{ t('contactPage.intro') }}
        </p>
      </div>
      <UiPixelScene scene="mail" class="mx-auto w-56 shrink-0 sm:w-64 md:mx-0 md:w-52 lg:w-64" />
    </section>

    <div class="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <!-- The form -->
      <UiPanel :title="t('contactPage.formTitle')" :subtitle="t('contactPage.formSubtitle')">
        <ClientOnly>
          <form class="panel-card space-y-6 p-5 sm:p-6" @submit.prevent="handleSubmit">
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="space-y-1.5">
                <label for="contact-name" class="eyebrow block">
                  {{ t('footer.contact.name') }}
                </label>
                <input
                  id="contact-name"
                  v-model="form.name"
                  type="text"
                  required
                  maxlength="200"
                  autocomplete="name"
                  class="field"
                  :placeholder="t('footer.contact.namePlaceholder')"
                />
              </div>
              <div class="space-y-1.5">
                <label for="contact-email" class="eyebrow block">
                  {{ t('footer.contact.email') }}
                </label>
                <input
                  id="contact-email"
                  v-model="form.email"
                  type="email"
                  required
                  maxlength="320"
                  autocomplete="email"
                  class="field"
                  :placeholder="t('footer.contact.emailPlaceholder')"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label for="contact-company" class="eyebrow block">
                {{ t('contactPage.company') }}
              </label>
              <input
                id="contact-company"
                v-model="form.company"
                type="text"
                maxlength="200"
                autocomplete="organization"
                class="field"
                :placeholder="t('contactPage.companyPlaceholder')"
              />
            </div>

            <!-- The topic, as chips: radios underneath, one chip ticked -->
            <fieldset class="space-y-2">
              <legend class="eyebrow mb-2">{{ t('contactPage.topic') }}</legend>
              <div class="flex flex-wrap gap-2">
                <label v-for="topic in TOPICS" :key="topic" class="relative">
                  <input
                    v-model="form.topic"
                    type="radio"
                    name="topic"
                    :value="topic"
                    class="peer sr-only"
                  />
                  <span
                    class="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-(--control-border) px-4 text-sm text-neutral-800 transition-colors peer-checked:border-primary-500/50 peer-checked:bg-primary-500/10 peer-checked:text-(--accent-text) peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/50 hover:bg-(--row-hover) dark:text-neutral-200"
                  >
                    <UIcon
                      v-if="form.topic === topic"
                      name="i-heroicons-check-circle-20-solid"
                      class="size-5 text-primary-500"
                      aria-hidden="true"
                    />
                    {{ t(`contactPage.topics.${topic}`) }}
                  </span>
                </label>
              </div>
            </fieldset>

            <div class="space-y-1.5">
              <label for="contact-message" class="eyebrow block">
                {{ t('footer.contact.message') }}
              </label>
              <textarea
                id="contact-message"
                v-model="form.message"
                required
                rows="6"
                maxlength="5000"
                class="field resize-y"
                :placeholder="t('footer.contact.messagePlaceholder')"
              />
            </div>

            <div aria-live="polite" aria-atomic="true">
              <p
                v-if="submitStatus === 'success'"
                role="status"
                class="flex items-center gap-2 text-sm text-green-700 dark:text-green-500"
              >
                <UiMascot mood="clap" :size="32" />
                {{ t('footer.contact.success') }}
              </p>
              <p
                v-if="submitStatus === 'error'"
                role="alert"
                class="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
              >
                <UiMascot mood="nervous" :size="32" />
                {{ t('footer.contact.error') }}
              </p>
            </div>

            <div
              class="flex items-center justify-between gap-3 border-t border-dashed border-(--card-border) pt-5"
            >
              <a href="mailto:hello@kbrdn.dev" class="eyebrow underline underline-offset-4">
                hello@kbrdn.dev
              </a>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="isSubmitting"
                :aria-busy="isSubmitting"
              >
                <UIcon
                  :name="isSubmitting ? 'i-heroicons-arrow-path' : 'i-heroicons-paper-airplane'"
                  :class="cn('size-4', isSubmitting && 'animate-spin')"
                  aria-hidden="true"
                />
                {{ isSubmitting ? t('footer.contact.sending') : t('footer.contact.send') }}
              </button>
            </div>
          </form>
          <template #fallback>
            <div class="panel-card h-[34rem]" />
          </template>
        </ClientOnly>
      </UiPanel>

      <!-- The details beside it -->
      <UiPanel :title="t('contactPage.details')">
        <!-- The person behind the address, through the pixel layer, crisp on hover -->
        <div
          class="panel-card mb-1 aspect-[4/5] overflow-hidden bg-neutral-200 dark:bg-neutral-900"
        >
          <ClientOnly>
            <UiPixelImage
              src="/images/me/portrait.webp"
              alt="Kylian Bardini"
              class="size-full"
              reveal
            />
          </ClientOnly>
        </div>
        <dl class="panel-card divide-y divide-dashed divide-(--card-border) px-5">
          <div class="py-4">
            <dt class="eyebrow">{{ t('contactPage.location') }}</dt>
            <dd class="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
              {{ t('footer.location.city') }}
            </dd>
          </div>
          <div class="py-4">
            <dt class="eyebrow">{{ t('contactPage.availability') }}</dt>
            <dd class="mt-2">
              <span class="tag text-green-700 dark:text-green-500">
                <span class="size-1.5 rounded-full bg-current" aria-hidden="true" />
                {{ t('hero.availableForHire') }}
              </span>
            </dd>
          </div>
          <div class="py-4">
            <dt class="eyebrow">{{ t('contactPage.email') }}</dt>
            <dd class="mt-1">
              <a
                href="mailto:hello@kbrdn.dev"
                class="text-sm text-neutral-900 hover:text-(--accent-text) dark:text-neutral-100"
              >
                hello@kbrdn.dev
              </a>
            </dd>
          </div>
          <div v-if="cvUrl" class="py-4">
            <dt class="eyebrow">{{ t('contactPage.cv') }}</dt>
            <dd class="mt-1">
              <a
                :href="cvUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 text-sm text-neutral-900 hover:text-(--accent-text) dark:text-neutral-100"
              >
                <UIcon
                  name="i-heroicons-arrow-down-tray-20-solid"
                  class="size-4"
                  aria-hidden="true"
                />
                {{ t('contactPage.cvDownload') }}
              </a>
            </dd>
          </div>
          <div class="py-4">
            <dt class="eyebrow">{{ t('contactPage.socials') }}</dt>
            <dd class="mt-2 space-y-1">
              <a
                v-for="social in SOCIALS"
                :key="social.href"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="row -mx-2 flex items-center gap-3 px-2 py-1.5 text-sm text-neutral-900 dark:text-neutral-100"
              >
                <span class="icon-box size-8">
                  <UIcon :name="social.icon" class="size-4" aria-hidden="true" />
                </span>
                {{ social.label }}
                <UIcon
                  name="i-heroicons-arrow-up-right-20-solid"
                  class="ml-auto size-4 text-neutral-500"
                  aria-hidden="true"
                />
              </a>
            </dd>
          </div>
        </dl>
      </UiPanel>
    </div>
  </div>
</template>
