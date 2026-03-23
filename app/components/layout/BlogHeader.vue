<script setup lang="ts">
import { useI18n } from "#imports";

const { t } = useI18n();
const route = useRoute();

const showBrandMenu = ref(false);

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.group\\/brand') && !target.closest('.group\\/brand-mobile')) {
    showBrandMenu.value = false;
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    showBrandMenu.value = false;
    isMobileMenuOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleKeydown);
});

const navLinks = computed(() => [
  { to: "/blog", label: t("blogNav.articles") },
]);

const isActive = (to: string) => {
  if (to === "/blog") {
    return route.path === "/blog" || (route.path.startsWith("/blog/") && !route.path.startsWith("/blog/tags"));
  }
  return route.path.startsWith(to);
};

const isMobileMenuOpen = ref(false);
</script>

<template>
  <header
    :class="
      cn(
        'fixed top-0 left-0 right-0 z-50',
        'bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800',
        'nav-entrance',
      )
    "
  >
    <div class="mx-auto" style="max-width: 80rem;">
      <!-- Desktop header -->
      <div class="hidden md:flex items-stretch h-14 border-x border-neutral-200 dark:border-neutral-800">
        <!-- Brand with dropdown -->
        <div
          class="relative border-r border-neutral-200 dark:border-neutral-700 group/brand"
          @mouseenter="showBrandMenu = true"
          @mouseleave="showBrandMenu = false"
        >
          <button
            type="button"
            class="flex items-center px-6 h-full font-mono font-bold text-sm tracking-tight transition-colors"
            :aria-expanded="showBrandMenu"
            aria-haspopup="true"
            @click="showBrandMenu = !showBrandMenu"
            @keydown.escape="showBrandMenu = false"
          >
            <span class="text-sky-400">blog</span><span class="text-neutral-900 dark:text-neutral-100">@</span><span class="text-primary-500">kbrdn1</span>
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
              class="absolute left-0 top-full z-50 mt-px min-w-full w-max border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
            >
              <NuxtLink
                to="/"
                class="flex items-center gap-3 px-4 py-2.5 text-sm font-mono font-bold transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                @click="showBrandMenu = false"
              >
                <span><span class="text-neutral-900 dark:text-neutral-100">@</span><span class="text-primary-500">kbrdn1</span></span>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- Desktop Navigation -->
        <nav
          class="flex items-stretch flex-1"
          aria-label="Blog navigation"
        >
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :aria-current="isActive(link.to) ? 'page' : undefined"
            :class="
              cn(
                'flex-1 px-6 flex items-center justify-center text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap',
                'border-r border-neutral-200 dark:border-neutral-700',
                isActive(link.to)
                  ? 'text-primary-500 bg-primary-500/5 nav-tab-active'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50',
              )
            "
          >
            {{ link.label }}
          </NuxtLink>

          <!-- Portfolio link -->
          <NuxtLink
            to="/"
            :class="
              cn(
                'flex-1 px-6 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-wider transition-all whitespace-nowrap',
                'border-r border-neutral-200 dark:border-neutral-700',
                'text-neutral-500 dark:text-neutral-400 hover:text-primary-500 hover:bg-primary-500/5',
              )
            "
          >
            <UIcon name="i-heroicons-arrow-left" class="w-3 h-3" aria-hidden="true" />
            {{ t("blogNav.portfolio") }}
          </NuxtLink>
        </nav>

        <!-- Right side: controls -->
        <div class="flex items-stretch">
          <UTooltip :text="t('hero.sponsor')">
            <a
              href="https://github.com/sponsors/kbrdn1"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="t('hero.sponsor')"
              class="flex items-center justify-center px-6 h-full border-r border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-pink-500 hover:bg-pink-500/5 transition-all"
            >
              <UIcon name="i-heroicons-heart" class="w-4 h-4" aria-hidden="true" />
            </a>
          </UTooltip>
          <UiLanguageSwitcher class="border-r border-neutral-200 dark:border-neutral-700" />
          <UiThemeToggle />
        </div>
      </div>

      <!-- Mobile header -->
      <div class="flex md:hidden items-center justify-between h-14 px-4">
        <div class="relative group/brand-mobile">
          <button
            type="button"
            class="font-mono font-bold text-sm tracking-tight"
            :aria-expanded="showBrandMenu"
            aria-haspopup="true"
            @click="showBrandMenu = !showBrandMenu"
            @keydown.escape="showBrandMenu = false"
          >
            <span class="text-sky-400">blog</span><span class="text-neutral-900 dark:text-neutral-100">@</span><span class="text-primary-500">kbrdn1</span>
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
              class="absolute left-0 top-full z-50 mt-2 min-w-full w-max border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
            >
              <NuxtLink
                to="/"
                class="flex items-center gap-3 px-4 py-2.5 text-sm font-mono font-bold transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800"
                @click="showBrandMenu = false"
              >
                <span><span class="text-neutral-900 dark:text-neutral-100">@</span><span class="text-primary-500">kbrdn1</span></span>
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
            :class="
              cn(
                'md:hidden flex items-center justify-center w-8 h-8',
                'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100',
                'bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800',
                'border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700',
                'transition-all',
              )
            "
            :aria-expanded="isMobileMenuOpen"
            :aria-controls="isMobileMenuOpen ? 'blog-mobile-nav' : undefined"
            :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <UIcon
              :name="
                isMobileMenuOpen
                  ? 'i-heroicons-x-mark'
                  : 'i-heroicons-bars-3'
              "
              class="w-4 h-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <nav
          v-if="isMobileMenuOpen"
          id="blog-mobile-nav"
          class="md:hidden py-3 border-t border-neutral-200 dark:border-neutral-800"
          aria-label="Mobile blog navigation"
        >
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :aria-current="isActive(link.to) ? 'page' : undefined"
            :class="
              cn(
                'flex items-center px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors',
                isActive(link.to)
                  ? 'text-primary-500 bg-neutral-100 dark:bg-neutral-900'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/50 dark:hover:bg-neutral-900/50',
              )
            "
            @click="isMobileMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>

          <NuxtLink
            to="/"
            :class="
              cn(
                'flex items-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors',
                'text-neutral-500 dark:text-neutral-400 hover:text-primary-500 hover:bg-primary-500/5',
              )
            "
            @click="isMobileMenuOpen = false"
          >
            <UIcon name="i-heroicons-arrow-left" class="w-3 h-3" aria-hidden="true" />
            {{ t("blogNav.portfolio") }}
          </NuxtLink>
        </nav>
      </Transition>
    </div>
  </header>
</template>
