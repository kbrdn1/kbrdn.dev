<script setup lang="ts">
import { useI18n } from '#imports'

defineProps<{
  class?: string
}>()

const { t } = useI18n()
</script>

<template>
  <NuxtLink to="/blog" :class="cn('btn btn-outline btn-sm group', $props.class)">
    <span class="inline-block transition-transform group-hover:-translate-x-1">&larr;</span>
    {{ t('blog.backToArticles') }}
  </NuxtLink>
</template>
