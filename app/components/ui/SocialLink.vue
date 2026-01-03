<script setup lang="ts">
interface Props {
  platform: 'github' | 'linkedin' | 'twitter'
  url: string
  label: string
}

const props = defineProps<Props>()

const iconMap = {
  github: 'i-simple-icons-github',
  linkedin: 'i-simple-icons-linkedin',
  twitter: 'i-simple-icons-x'
}

const icon = computed(() => iconMap[props.platform])
</script>

<template>
  <a
    :href="url"
    target="_blank"
    rel="noopener noreferrer"
    :class="cn(
      'inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
      'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
    )"
    :aria-label="`Visit ${label}`"
  >
    <UIcon :name="icon" class="w-4 h-4" />
    <span>{{ label }}</span>
  </a>
</template>
