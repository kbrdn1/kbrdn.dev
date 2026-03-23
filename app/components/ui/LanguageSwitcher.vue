<script setup lang="ts">
import { useI18n } from '#imports'

const { t, locale, locales, setLocale } = useI18n()

const availableLocales = computed(() => {
  return locales.value.filter((l) => typeof l !== 'string')
})

const currentLocale = computed(() => {
  return availableLocales.value.find((l) => l.code === locale.value)
})

const nextLocaleName = computed(() => {
  const next = locale.value === 'en' ? 'fr' : 'en'
  const found = availableLocales.value.find((l) => l.code === next)
  return found?.name || next.toUpperCase()
})

function toggleLocale() {
  const nextLocale = locale.value === 'en' ? 'fr' : 'en'
  setLocale(nextLocale)
}

const tooltipText = computed(() =>
  `${t('nav.switchLanguage')} (${nextLocaleName.value})`
)
</script>

<template>
  <ClientOnly>
    <UTooltip :text="tooltipText">
      <button
        type="button"
        :class="cn(
          'flex items-center justify-center px-3 py-2',
          'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100',
          'bg-transparent',
          'transition-all uppercase text-xs font-medium tracking-wider'
        )"
        :aria-label="tooltipText"
        @click="toggleLocale"
      >
        {{ locale.toUpperCase() }}
      </button>
    </UTooltip>
    <template #fallback>
      <div
        :class="cn(
          'flex items-center justify-center px-3 py-2',
          'text-neutral-500',
          'bg-transparent',
          'uppercase text-xs font-medium tracking-wider'
        )"
      >
        --
      </div>
    </template>
  </ClientOnly>
</template>
