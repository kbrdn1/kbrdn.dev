<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
// Categorized navigation links: the home page and the site's pages, the blog apart
const { links } = useSiteNav()
const portfolioLinks = computed(() =>
  links.value.filter((l) => l.to !== '/blog').map((l) => ({ href: l.to, label: l.label })),
)

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

const currentYear = new Date().getFullYear()
</script>

<template>
  <!-- A panel over the dither, as wide as the navbar: the three columns in one card,
       the copyright in the panel's footer -->
  <footer class="relative w-full px-4 pt-6 pb-6 sm:px-6">
    <!-- For the outline: the columns' h3s need an h2 above them -->
    <h2 class="sr-only">{{ t('footer.heading') }}</h2>
    <UiDitherCanvas fade="up" class="absolute inset-0 h-full w-full" />
    <!-- The panel, and the strip on its top edge where an invader walks by now and then -->
    <div class="relative mx-auto max-w-[61rem]">
      <LayoutFooterCritter />
      <UiPanel class="relative">
        <!-- Three-column grid -->
        <div class="panel-card grid grid-cols-1 gap-12 p-5 sm:p-8 md:grid-cols-3">
          <!-- Left Column: Contact, the form lives on /contact -->
          <div
            class="space-y-5 md:col-span-1 md:pr-12 md:border-r md:border-dashed md:border-neutral-200 dark:md:border-neutral-800"
          >
            <h3 class="eyebrow">
              {{ t('footer.contact.title') }}
            </h3>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              {{ t('footer.contact.description') }}
            </p>
            <div class="flex flex-wrap gap-2">
              <NuxtLink to="/contact" class="btn btn-primary btn-sm">
                <UIcon name="i-heroicons-paper-airplane" class="size-4" aria-hidden="true" />
                {{ t('contactPage.write') }}
              </NuxtLink>
            </div>
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
              <span class="tag text-green-800 dark:text-green-500">
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
          <UiLogo :size="20" class="text-neutral-900 dark:text-neutral-100" />
        </template>
      </UiPanel>
    </div>
  </footer>
</template>
