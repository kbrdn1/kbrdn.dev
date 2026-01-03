<script setup lang="ts">
const route = useRoute()

const navLinks = [
  { to: '/', label: 'Home', icon: 'i-heroicons-home' },
  { to: '/projects', label: 'Projects', icon: 'i-heroicons-folder' },
  { to: '/experiences', label: 'Experience', icon: 'i-heroicons-briefcase' },
  { to: '/hire-me', label: 'Hire Me', icon: 'i-heroicons-sparkles' },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const isMobileMenuOpen = ref(false)
</script>

<template>
  <header
    :class="cn(
      'fixed top-0 left-0 right-0 z-50',
      'bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-900'
    )"
  >
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center justify-between h-14">
        <!-- Logo -->
        <NuxtLink
          to="/"
          :class="cn(
            'font-bold transition-colors',
            'text-primary-500 hover:text-primary-400'
          )"
        >
          @kbrdn1
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-1">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :class="cn(
              'px-3 py-2 text-sm font-medium transition-colors',
              isActive(link.to)
                ? 'text-primary-500'
                : 'text-neutral-400 hover:text-neutral-100'
            )"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <!-- Right side -->
        <div class="flex items-center gap-2">
          <UiThemeToggle />

          <UButton
            class="md:hidden"
            variant="ghost"
            size="sm"
            :icon="isMobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          />
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
          class="md:hidden py-4 border-t border-neutral-900"
        >
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            :class="cn(
              'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors',
              isActive(link.to)
                ? 'text-primary-500 bg-neutral-900'
                : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/50'
            )"
            @click="isMobileMenuOpen = false"
          >
            <UIcon :name="link.icon" class="w-4 h-4" />
            {{ link.label }}
          </NuxtLink>
        </nav>
      </Transition>
    </div>
  </header>
</template>
