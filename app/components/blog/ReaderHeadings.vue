<script setup lang="ts">
// After each article heading, a button that reads the article from there (useArticleReader).
// Slides in while the heading is hovered or the button focused, always shown on touch screens
// (no hover there). Teleported, client side once there is a voice, into the headings Nuxt UI
// renders: overriding its ProseH2/H3 would lose their style and anchor. Icon only: the table
// of contents and the reader take the heading's textContent. The label is in the page's
// language, inside an article that may be in the other one: hence its own lang.
import { useI18n } from '#imports'
import type { ArticleReader } from '~/composables/useArticleReader'

const props = defineProps<{ reader: ArticleReader }>()

const { t, locale } = useI18n()
const { voiceName, headings, playFrom } = props.reader
</script>

<template>
  <template v-if="voiceName">
    <Teleport v-for="heading in headings" :key="heading.id" :to="heading">
      <UTooltip :text="t('listen.from')">
        <button
          type="button"
          class="icon-btn ml-2 size-7 -translate-x-1.5 align-middle opacity-0 transition-[opacity,translate,background-color,color] duration-300 ease-out-quint [:hover>&]:translate-x-0 [:hover>&]:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100 pointer-coarse:translate-x-0 pointer-coarse:opacity-100"
          :aria-label="t('listen.from')"
          :lang="locale"
          @click="playFrom(heading.id)"
        >
          <UIcon name="i-heroicons-speaker-wave-16-solid" class="size-4" aria-hidden="true" />
        </button>
      </UTooltip>
    </Teleport>
  </template>
</template>
