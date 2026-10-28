<script setup lang="ts">
// @nuxtjs/mdc's ProseH2 (anchor link included), plus the button that reads the article from it
const props = defineProps<{ id?: string }>()

const { headings } = useRuntimeConfig().public.mdc
const anchor = computed(
  () =>
    props.id &&
    (headings?.anchorLinks === true ||
      (typeof headings?.anchorLinks === 'object' && headings.anchorLinks.h2)),
)
</script>

<template>
  <h2 :id="id" class="group/heading">
    <a v-if="anchor" :href="`#${id}`"><slot /></a>
    <slot v-else />
    <BlogListenFrom v-if="id" :id="id" />
  </h2>
</template>
