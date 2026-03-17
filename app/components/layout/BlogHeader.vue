<script setup lang="ts">
import { useI18n } from "#imports";

const { t } = useI18n();
const route = useRoute();

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
      )
    "
  >
    <div class="mx-auto" style="max-width: 80rem;">
      <!-- Desktop header -->
      <div class="hidden md:flex items-stretch h-14 border-x border-neutral-200 dark:border-neutral-800">
        <!-- Brand -->
        <NuxtLink
          to="/blog"
          :class="
            cn(
              'flex items-center px-6 font-mono font-bold text-sm tracking-tight transition-colors',
              'hover:opacity-80',
              'border-r border-neutral-200 dark:border-neutral-700',
            )
          "
        >
          <span class="text-sky-400">blog</span><span class="text-neutral-900 dark:text-neutral-100">@</span><span class="text-primary-500">kbrdn1</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav
          class="flex items-stretch flex-1"
          aria-label="Blog navigation"
        >
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
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
            <UIcon name="i-heroicons-arrow-left" class="w-3 h-3" />
            {{ t("blogNav.portfolio") }}
          </NuxtLink>
        </nav>

        <!-- Right side: controls -->
        <div class="flex items-stretch">
          <a
            href="https://github.com/sponsors/kbrdn1"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center px-6 border-r border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-pink-500 hover:bg-pink-500/5 transition-all"
          >
            <UIcon name="i-heroicons-heart" class="w-4 h-4" />
          </a>
          <div class="flex items-center justify-center px-6 border-r border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer">
            <UiLanguageSwitcher />
          </div>
          <div class="flex items-center justify-center px-6 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer">
            <UiThemeToggle />
          </div>
        </div>
      </div>

      <!-- Mobile header -->
      <div class="flex md:hidden items-center justify-between h-14 px-4">
        <NuxtLink
          to="/blog"
          class="font-mono font-bold text-sm tracking-tight"
        >
          <span class="text-sky-400">blog</span><span class="text-neutral-900 dark:text-neutral-100">@</span><span class="text-primary-500">kbrdn1</span>
        </NuxtLink>
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
            aria-label="Toggle navigation menu"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <UIcon
              :name="
                isMobileMenuOpen
                  ? 'i-heroicons-x-mark'
                  : 'i-heroicons-bars-3'
              "
              class="w-4 h-4"
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
          class="md:hidden py-3 border-t border-neutral-200 dark:border-neutral-800"
          aria-label="Mobile blog navigation"
        >
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
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
            <UIcon name="i-heroicons-arrow-left" class="w-3 h-3" />
            {{ t("blogNav.portfolio") }}
          </NuxtLink>
        </nav>
      </Transition>
    </div>
  </header>
</template>
