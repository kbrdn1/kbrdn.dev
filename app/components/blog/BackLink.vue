<script setup lang="ts">
import { useI18n } from '#imports'

defineProps<{
  class?: string
}>()

const { t } = useI18n()
</script>

<template>
  <NuxtLinkLocale to="/blog" :class="cn('btn btn-outline btn-sm group', $props.class)">
    <span class="inline-block transition-transform group-hover:-translate-x-1" aria-hidden="true"
      >&larr;</span
    >
    {{ t('blog.backToArticles') }}
  </NuxtLinkLocale>
</template>
