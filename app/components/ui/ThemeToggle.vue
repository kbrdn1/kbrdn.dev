<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (value) => {
    colorMode.preference = value ? 'dark' : 'light'
  }
})

function toggleTheme() {
  isDark.value = !isDark.value
}
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      :class="cn(
        'flex items-center justify-center w-8 h-8',
        'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100',
        'bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800',
        'border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700',
        'transition-all'
      )"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleTheme"
    >
      <UIcon
        v-if="isDark"
        name="i-heroicons-sun-20-solid"
        class="w-4 h-4 text-yellow-500"
      />
      <UIcon
        v-else
        name="i-heroicons-moon-20-solid"
        class="w-4 h-4 text-primary-500"
      />
    </button>
    <template #fallback>
      <div
        :class="cn(
          'flex items-center justify-center w-8 h-8',
          'text-neutral-500',
          'bg-transparent',
          'border border-transparent'
        )"
      >
        <div class="w-4 h-4" />
      </div>
    </template>
  </ClientOnly>
</template>
