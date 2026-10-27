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

const tooltipText = computed(() => `${t('nav.switchLanguage')} (${nextLocaleName.value})`)
</script>

<template>
  <ClientOnly>
    <UTooltip :text="tooltipText">
      <button
        type="button"
        class="icon-btn cursor-pointer font-mono text-xs uppercase"
        :aria-label="tooltipText"
        @click="toggleLocale"
      >
        {{ locale.toUpperCase() }}
      </button>
    </UTooltip>
    <template #fallback>
      <div
        class="flex size-9 items-center justify-center font-mono text-xs text-neutral-500 uppercase"
      >
        --
      </div>
    </template>
  </ClientOnly>
</template>
