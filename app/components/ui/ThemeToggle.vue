<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
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

const tooltipText = computed(() =>
  isDark.value ? t('theme.switchToLight') : t('theme.switchToDark')
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
          'transition-all cursor-pointer'
        )"
        :aria-label="tooltipText"
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
    </UTooltip>
    <template #fallback>
      <div class="flex items-center justify-center min-w-[48px] min-h-[48px]">
        <div class="w-4 h-4" />
      </div>
    </template>
  </ClientOnly>
</template>
