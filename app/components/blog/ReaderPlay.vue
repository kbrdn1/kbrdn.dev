<script setup lang="ts">
// The article reader's play/pause (useArticleReader), at the head of the table of contents,
// sidebar and mobile bar alike. Its place is kept from the first render and it scales in once
// a voice is found in the article's language (none on the server, nor in a browser without
// speech synthesis): the title beside it never jumps. Play and pause swap through a turn.
import { useI18n } from '#imports'
import type { ArticleReader } from '~/composables/useArticleReader'

const props = defineProps<{ reader: ArticleReader }>()

const { t } = useI18n()
const { voiceName, playing, toggle } = props.reader
</script>

<template>
  <span
    :class="
      cn(
        'flex shrink-0 transition-[opacity,scale] duration-300 ease-out-quint',
        !voiceName && 'invisible scale-50 opacity-0',
      )
    "
  >
    <UTooltip :text="playing ? t('listen.pause') : t('listen.listen')">
      <button
        type="button"
        class="grid size-7 cursor-pointer place-items-center rounded-full bg-primary-500 text-neutral-950 transition-[background-color,scale] hover:bg-primary-400 active:scale-90"
        :aria-label="playing ? t('listen.pause') : t('listen.listen')"
        @click="toggle"
      >
        <Transition name="reader-icon">
          <UIcon
            :key="playing ? 'pause' : 'play'"
            :name="playing ? 'i-heroicons-pause-16-solid' : 'i-heroicons-play-16-solid'"
            class="col-start-1 row-start-1 size-3.5"
            aria-hidden="true"
          />
        </Transition>
      </button>
    </UTooltip>
  </span>
</template>

<style scoped>
/* Both icons share the grid cell while they cross: the old one turns out, the new one in */
.reader-icon-enter-active,
.reader-icon-leave-active {
  transition:
    opacity 0.2s var(--ease-out-quint),
    rotate 0.2s var(--ease-out-quint),
    scale 0.2s var(--ease-out-quint);
}

.reader-icon-enter-from {
  opacity: 0;
  rotate: -90deg;
  scale: 0.5;
}

.reader-icon-leave-to {
  opacity: 0;
  rotate: 90deg;
  scale: 0.5;
}
</style>
