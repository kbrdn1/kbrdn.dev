<script setup lang="ts">
// The button after an article heading: reads the article from there (BlogListen). Shown while
// the heading is hovered or the button focused, always on touch screens (no hover there).
// Rendered by the server, invisible until the reader has a voice: the heading never reflows.
// Icon only: the table of contents and the reader take the heading's textContent.
import { useI18n } from '#imports'

const props = defineProps<{ id: string }>()

const { t } = useI18n()
const { ready, from } = useListen()

function listen() {
  from.value = props.id
}
</script>

<template>
  <UTooltip :text="t('listen.from')">
    <button
      type="button"
      :class="
        cn(
          'icon-btn ml-2 size-7 align-middle opacity-0 transition-opacity group-hover/heading:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100',
          !ready && 'invisible',
        )
      "
      :aria-label="t('listen.from')"
      @click="listen"
    >
      <UIcon name="i-heroicons-speaker-wave-16-solid" class="size-4" aria-hidden="true" />
    </button>
  </UTooltip>
</template>
