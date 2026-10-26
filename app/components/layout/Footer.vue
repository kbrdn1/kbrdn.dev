<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
// Categorized navigation links: the home page and the site's pages, the blog apart
const { links } = useSiteNav()
const portfolioLinks = computed(() => [
  { href: '/', label: t('nav.home') },
  ...links.value.filter((l) => l.to !== '/blog').map((l) => ({ href: l.to, label: l.label })),
])

const blogLinks = computed(() => [{ href: '/blog', label: t('footer.nav.articles') }])

const otherLinks = [
  {
    href: 'https://github.com/sponsors/kbrdn1',
    label: 'Sponsor',
    icon: 'i-heroicons-heart',
    external: true,
  },
  {
    href: 'mailto:hello@kbrdn.dev',
    label: 'hello@kbrdn.dev',
    icon: 'i-heroicons-envelope',
    external: false,
  },
]

const socialLinks = [
  {
    href: 'https://github.com/kbrdn1',
    icon: 'i-simple-icons-github',
    label: 'GitHub',
  },
  {
    href: 'https://linkedin.com/in/kylian-bardini-aa0528234',
    icon: 'i-simple-icons-linkedin',
    label: 'LinkedIn',
  },
  {
    href: 'https://twitter.com/kbrdn1',
    icon: 'i-simple-icons-x',
    label: 'Twitter / X',
  },
]

// Form state
const form = reactive({
  name: '',
  email: '',
  message: '',
})

const isSubmitting = ref(false)
const submitStatus = ref<'idle' | 'success' | 'error'>('idle')

async function handleSubmit() {
  isSubmitting.value = true
  submitStatus.value = 'idle'

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: form,
    })

    submitStatus.value = 'success'
    form.name = ''
    form.email = ''
    form.message = ''

    setTimeout(() => {
      submitStatus.value = 'idle'
    }, 5000)
  } catch {
    submitStatus.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

const currentYear = new Date().getFullYear()
</script>

<template>
  <!-- A panel over the dither, as wide as the navbar: the three columns in one card,
       the copyright in the panel's footer -->
  <footer class="relative w-full px-4 pt-6 pb-6 sm:px-6">
    <UiDitherCanvas fade="up" class="absolute inset-0 h-full w-full" />
    <UiPanel class="relative mx-auto max-w-[61rem]">
      <!-- Three-column grid -->
      <div class="panel-card grid grid-cols-1 gap-12 p-5 sm:p-8 md:grid-cols-3">
        <!-- Left Column: Contact Form -->
        <div
          class="space-y-5 md:col-span-1 md:pr-12 md:border-r md:border-dashed md:border-neutral-200 dark:md:border-neutral-800"
        >
          <h3 class="eyebrow">
            {{ t('footer.contact.title') }}
          </h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            {{ t('footer.contact.description') }}
          </p>

          <ClientOnly>
            <form class="space-y-4" @submit.prevent="handleSubmit">
              <!-- Name -->
              <div class="space-y-1.5">
                <label for="footer-name" class="eyebrow block">
                  {{ t('footer.contact.name') }}
                </label>
                <input
                  id="footer-name"
                  v-model="form.name"
                  type="text"
                  required
                  :placeholder="t('footer.contact.namePlaceholder')"
                  class="field"
                />
              </div>

              <!-- Email -->
              <div class="space-y-1.5">
                <label for="footer-email" class="eyebrow block">
                  {{ t('footer.contact.email') }}
                </label>
                <input
                  id="footer-email"
                  v-model="form.email"
                  type="email"
                  required
                  :placeholder="t('footer.contact.emailPlaceholder')"
                  class="field"
                />
              </div>

              <!-- Message -->
              <div class="space-y-1.5">
                <label for="footer-message" class="eyebrow block">
                  {{ t('footer.contact.message') }}
                </label>
                <textarea
                  id="footer-message"
                  v-model="form.message"
                  required
                  rows="4"
                  :placeholder="t('footer.contact.messagePlaceholder')"
                  class="field resize-none"
                />
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="isSubmitting"
                :aria-busy="isSubmitting"
                class="btn btn-primary w-full"
              >
                <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                  <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                  {{ t('footer.contact.sending') }}
                </span>
                <span v-else>{{ t('footer.contact.send') }}</span>
              </button>

              <!-- Status Messages -->
              <div aria-live="polite" aria-atomic="true">
                <p
                  v-if="submitStatus === 'success'"
                  role="status"
                  class="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
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
            </form>
          </ClientOnly>
        </div>

        <!-- Center Column: Categorized Links -->
        <div class="grid grid-cols-2 gap-6 md:col-span-1">
          <!-- Portfolio -->
          <div class="space-y-3">
            <h3 class="eyebrow">
              {{ t('blogNav.portfolio') }}
            </h3>
            <nav :aria-label="t('blogNav.portfolio')" class="flex flex-col space-y-2">
              <a
                v-for="link in portfolioLinks"
                :key="link.href"
                :href="link.href"
                class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#d4825d] transition-colors duration-200"
              >
                <UiScrambleText :text="link.label" effect="link" />
              </a>
            </nav>
          </div>

          <!-- Blog -->
          <div class="space-y-3">
            <h3 class="eyebrow">
              {{ t('sections.blog') }}
            </h3>
            <nav :aria-label="t('sections.blog')" class="flex flex-col space-y-2">
              <a
                v-for="link in blogLinks"
                :key="link.href"
                :href="link.href"
                class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#d4825d] transition-colors duration-200"
              >
                <UiScrambleText :text="link.label" effect="link" />
              </a>
            </nav>
          </div>

          <!-- Socials -->
          <div class="space-y-3">
            <h3 class="eyebrow">
              {{ t('footer.links.title') }}
            </h3>
            <nav :aria-label="t('footer.links.title')" class="flex flex-col space-y-2">
              <a
                v-for="social in socialLinks"
                :key="social.href"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#d4825d] transition-colors duration-200 inline-flex items-center gap-2"
              >
                <UIcon :name="social.icon" class="w-4 h-4" />
                <UiScrambleText :text="social.label" effect="link" />
              </a>
            </nav>
          </div>

          <!-- Other -->
          <div class="space-y-3">
            <h3 class="eyebrow">
              {{ t('footer.links.other') }}
            </h3>
            <nav :aria-label="t('footer.links.other')" class="flex flex-col space-y-2">
              <a
                v-for="link in otherLinks"
                :key="link.href"
                :href="link.href"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
                class="text-sm text-neutral-600 dark:text-neutral-400 hover:text-[#d4825d] transition-colors duration-200 inline-flex items-center gap-2"
              >
                <UIcon :name="link.icon" class="w-4 h-4" />
                <UiScrambleText :text="link.label" effect="link" />
              </a>
            </nav>
          </div>
        </div>

        <!-- Right Column: Info -->
        <div class="space-y-6 md:col-span-1">
          <!-- Location -->
          <div class="space-y-2">
            <h3 class="eyebrow">
              {{ t('footer.location.title') }}
            </h3>
            <p class="text-sm text-neutral-900 dark:text-neutral-300">
              {{ t('footer.location.city') }}
            </p>
          </div>

          <!-- Status -->
          <div class="space-y-2">
            <h3 class="eyebrow">
              {{ t('footer.availability.title') }}
            </h3>
            <span class="tag text-green-700 dark:text-green-500">
              <span class="relative flex size-1.5" aria-hidden="true">
                <span
                  class="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75"
                />
                <span class="relative inline-flex size-1.5 rounded-full bg-current" />
              </span>
              {{ t('footer.availability.status') }}
            </span>
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <h3 class="eyebrow">
              {{ t('footer.email.title') }}
            </h3>
            <a
              href="mailto:hello@kbrdn.dev"
              class="text-sm text-neutral-900 dark:text-neutral-300 hover:text-[#d4825d] transition-colors duration-200"
            >
              hello@kbrdn.dev
            </a>
          </div>
        </div>
      </div>

      <template #meta>
        &copy; {{ currentYear }} Kylian Bardini · {{ t('footer.copyright') }}
      </template>
      <template #footer>
        <UiMascot mood="hoodie-cool" :size="28" />
      </template>
    </UiPanel>
  </footer>
</template>
