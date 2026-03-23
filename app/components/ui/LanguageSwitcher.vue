<script setup lang="ts">
import { useI18n } from '#imports'

const { t, locale, locales, setLocale } = useI18n()

const availableLocales = computed(() => {
  return locales.value.filter((l) => typeof l !== 'string')
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
          'flex items-center justify-center',
          'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100',
          'transition-all uppercase text-xs font-medium tracking-wider cursor-pointer'
        )"
        :aria-label="tooltipText"
        @click="toggleLocale"
      >
        {{ locale.toUpperCase() }}
      </button>
    </UTooltip>
    <template #fallback>
      <div class="flex items-center justify-center min-w-[48px] min-h-[48px]">
        <span class="text-neutral-500 uppercase text-xs font-medium tracking-wider">--</span>
      </div>
    </template>
  </ClientOnly>
</template>
