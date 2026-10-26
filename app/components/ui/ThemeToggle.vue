<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
const colorMode = useColorMode()

// One button cycles light → dark → blur; it shows the mode it switches to.
const NEXT = { light: 'dark', dark: 'blur', blur: 'light' } as const
const MODES = {
  light: {
    icon: 'i-heroicons-sun-20-solid',
    color: 'text-yellow-500',
    label: 'themeSwitch.toLight',
  },
  dark: {
    icon: 'i-heroicons-moon-20-solid',
    color: 'text-primary-500',
    label: 'themeSwitch.toDark',
  },
  blur: { icon: 'i-lucide-blend', color: 'text-cyan-500', label: 'themeSwitch.toBlur' },
}

const next = computed(() => NEXT[colorMode.value as keyof typeof NEXT] ?? 'dark')
const target = computed(() => MODES[next.value])

function toggleTheme() {
  colorMode.preference = next.value
}
</script>

<template>
  <ClientOnly>
    <UTooltip :text="t(target.label)">
      <button
        type="button"
        class="icon-btn cursor-pointer"
        :aria-label="t(target.label)"
        @click="toggleTheme"
      >
        <UIcon :name="target.icon" :class="cn('w-4 h-4', target.color)" />
      </button>
    </UTooltip>
    <template #fallback>
      <div class="size-9">
        <div class="w-4 h-4" />
      </div>
    </template>
  </ClientOnly>
</template>
