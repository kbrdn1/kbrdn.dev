<script setup lang="ts">
import { useI18n } from '#imports'

defineProps<{
  class?: string
}>()

const { t } = useI18n()
</script>

<template>
  <NuxtLink
    to="/blog"
    :class="['inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-neutral-500 hover:text-sky-500 group', $props.class]"
  >
    <span class="inline-block transition-transform group-hover:-translate-x-1">&larr;</span>
    {{ t('blog.backToArticles') }}
  </NuxtLink>
</template>
