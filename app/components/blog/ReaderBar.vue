<script setup lang="ts">
// The article reader's progress (useArticleReader), in the table of contents once the reading
// has started: the music player's tick slider, counting sentences (a voice gives no reliable
// time), then the voice reading. It opens on its height (UiExpand) in place of the table of
// contents' scroll progress, which folds away meanwhile: one bar at a time. The steps of the
// table of contents are its sections.
import { useI18n } from '#imports'
import type { ArticleReader } from '~/composables/useArticleReader'

// The parent's class (its padding) goes on the content, not on the collapse: closed, it
// would still take that room
defineOptions({ inheritAttrs: false })

const props = defineProps<{ reader: ArticleReader }>()

const { t } = useI18n()
const { voiceName, started, index, total, progress, seek } = props.reader

function seekAt(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  seek(Math.floor(((e.clientX - rect.left) / rect.width) * total.value))
}
</script>

<template>
  <UiExpand :open="!!voiceName && started">
    <div v-bind="$attrs">
      <div
        class="relative h-4 cursor-pointer"
        role="slider"
        tabindex="0"
        :aria-label="t('listen.progress')"
        :aria-valuenow="index + 1"
        :aria-valuemin="1"
        :aria-valuemax="total"
        :aria-valuetext="t('listen.sentenceOf', { n: index + 1, total })"
        @click="seekAt"
        @keydown.left.prevent="seek(index - 1)"
        @keydown.right.prevent="seek(index + 1)"
      >
        <div
          class="ticks absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 bg-neutral-300 dark:bg-neutral-700"
        >
          <div
            class="h-full bg-primary-500 transition-[width] duration-300 ease-out-quint"
            :style="{ width: `${progress}%` }"
          />
        </div>
        <div
          class="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900 transition-[left] duration-300 ease-out-quint dark:bg-white"
          :style="{ left: `${progress}%` }"
        />
      </div>
      <p class="eyebrow mt-1.5 truncate">{{ t('listen.voice', { name: voiceName ?? '' }) }}</p>
    </div>
  </UiExpand>
</template>
