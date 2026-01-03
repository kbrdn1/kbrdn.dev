<script setup lang="ts">
import { useI18n } from '#imports'

const { locale, locales, setLocale } = useI18n()

const availableLocales = computed(() => {
  return locales.value.filter((l) => typeof l !== 'string')
})

const currentLocale = computed(() => {
  return availableLocales.value.find((l) => l.code === locale.value)
})

function toggleLocale() {
  const nextLocale = locale.value === 'en' ? 'fr' : 'en'
  setLocale(nextLocale)
}
</script>

<template>
  <ClientOnly>
    <button
      :class="cn(
        'flex items-center justify-center w-8 h-8',
        'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100',
        'bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800',
        'border border-transparent hover:border-neutral-300 dark:hover:border-neutral-700',
        'transition-all uppercase text-xs font-medium tracking-wider'
      )"
      :title="currentLocale?.name"
      @click="toggleLocale"
    >
      {{ locale.toUpperCase() }}
    </button>
    <template #fallback>
      <div
        :class="cn(
          'flex items-center justify-center w-8 h-8',
          'text-neutral-500',
          'bg-transparent',
          'border border-transparent',
          'uppercase text-xs font-medium tracking-wider'
        )"
      >
        --
      </div>
    </template>
  </ClientOnly>
</template>
