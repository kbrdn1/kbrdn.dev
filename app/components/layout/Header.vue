<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
const { links, isActive } = useSiteNav()

const showBrandMenu = ref(false)

// Close menu on click outside or Escape key
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.group\\/brand') && !target.closest('.group\\/brand-mobile')) {
    showBrandMenu.value = false
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    showBrandMenu.value = false
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

const isMobileMenuOpen = ref(false)
</script>

<template>
  <header :class="cn('fixed inset-x-0 top-3 z-50 px-4 sm:px-6', 'nav-entrance')">
    <!-- Detached from the top: a panel as wide as the home's panels -->
    <div class="panel notched mx-auto max-w-[61rem] p-0">
      <div class="hidden md:flex items-center h-12 gap-2 px-1.5">
        <!-- Brand with dropdown -->
        <div
          class="relative group/brand"
          @mouseenter="showBrandMenu = true"
          @mouseleave="showBrandMenu = false"
        >
          <button
            type="button"
            class="flex items-center h-9 px-3 rounded-full font-mono font-bold text-sm tracking-tight transition-colors hover:bg-(--control-bg)"
            :aria-expanded="showBrandMenu"
            aria-haspopup="true"
            @click="showBrandMenu = !showBrandMenu"
            @keydown.escape="showBrandMenu = false"
          >
            <UiLogo class="mr-2 text-neutral-900 dark:text-neutral-100" />
            <span class="text-neutral-900 dark:text-neutral-100">@</span
            ><span class="text-primary-500">kbrdn1</span>
          </button>

          <!-- Dropdown -->
          <Transition
            enter-active-class="transition-all duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div v-if="showBrandMenu" class="absolute left-0 top-full z-50 min-w-full w-max pt-2.5">
              <div
                class="overflow-hidden rounded-xl border border-(--panel-border) bg-white dark:bg-neutral-900 shadow-lg"
              >
                <NuxtLink
                  to="/blog"
                  class="flex items-center gap-3 px-4 py-2.5 text-sm font-mono font-bold transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  @click="showBrandMenu = false"
                >
                  <span
                    ><span class="text-sky-400">blog</span
                    ><span class="text-neutral-900 dark:text-neutral-100">@</span
                    ><span class="text-primary-500">kbrdn1</span></span
                  >
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>

        <span class="h-5 w-px shrink-0 bg-(--panel-border)" aria-hidden="true" />

        <!-- Desktop Navigation: the site's pages -->
        <nav class="segmented mx-auto" aria-label="Site navigation">
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :aria-current="isActive(link.to) ? 'page' : undefined"
            class="segment"
          >
            <UiScrambleText :text="link.label" effect="link" />
          </NuxtLink>
          <UiSegmentInk />
        </nav>

        <span class="h-5 w-px shrink-0 bg-(--panel-border)" aria-hidden="true" />

        <!-- Right side: controls -->
        <div class="flex items-center gap-0.5">
          <UTooltip :text="t('hero.sponsor')">
            <a
              href="https://github.com/sponsors/kbrdn1"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="t('hero.sponsor')"
              class="icon-btn hover:text-pink-500"
            >
              <UIcon name="i-heroicons-heart" class="w-4 h-4" aria-hidden="true" />
            </a>
          </UTooltip>
          <UiLanguageSwitcher />
          <UiThemeToggle />
        </div>
      </div>

      <!-- Mobile header -->
      <div class="flex md:hidden items-center justify-between h-12 pl-3.5 pr-1.5">
        <div class="relative group/brand-mobile">
          <button
            type="button"
            class="flex items-center font-mono font-bold text-sm tracking-tight"
            :aria-expanded="showBrandMenu"
            aria-haspopup="true"
            @click="showBrandMenu = !showBrandMenu"
            @keydown.escape="showBrandMenu = false"
          >
            <UiLogo class="mr-2 text-neutral-900 dark:text-neutral-100" />
            <span class="text-neutral-900 dark:text-neutral-100">@</span
            ><span class="text-primary-500">kbrdn1</span>
          </button>
          <Transition
            enter-active-class="transition-all duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showBrandMenu"
              class="absolute left-0 top-full z-50 mt-2 min-w-full w-max overflow-hidden rounded-xl border border-(--panel-border) bg-white dark:bg-neutral-900 shadow-lg"
            >
              <NuxtLink
                to="/blog"
                class="flex items-center gap-3 px-4 py-2.5 text-sm font-mono font-bold transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                @click="showBrandMenu = false"
              >
                <span
                  ><span class="text-sky-400">blog</span
                  ><span class="text-neutral-900 dark:text-neutral-100">@</span
                  ><span class="text-primary-500">kbrdn1</span></span
                >
              </NuxtLink>
            </div>
          </Transition>
        </div>
        <div class="flex items-center gap-1">
          <UiLanguageSwitcher />
          <UiThemeToggle />

          <!-- Mobile menu toggle -->
          <button
            type="button"
            class="icon-btn md:hidden"
            :aria-expanded="isMobileMenuOpen"
            aria-controls="mobile-nav"
            :aria-label="
              isMobileMenuOpen
                ? t('nav.closeMenu') || 'Close menu'
                : t('nav.openMenu') || 'Open menu'
            "
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <UIcon
              :name="isMobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
              class="w-4 h-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation: unfolds on its height under the bar -->
      <UiExpand :open="isMobileMenuOpen" class="md:hidden">
        <nav
          id="mobile-nav"
          class="py-2 border-t border-(--panel-border)"
          aria-label="Mobile site navigation"
        >
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            :aria-current="isActive(link.to) ? 'page' : undefined"
            :class="
              cn(
                'mx-1.5 flex items-center rounded-lg px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors',
                isActive(link.to)
                  ? 'text-primary-500 bg-neutral-100 dark:bg-neutral-900'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50',
              )
            "
            @click="isMobileMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </UiExpand>
    </div>
    <!-- The announcement, as a notch under the navbar -->
    <HomeBanner />
  </header>
</template>
