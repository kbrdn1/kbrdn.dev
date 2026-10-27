<script setup lang="ts">
// A picture full size over the page, after a click on an illustration (/experience, an
// article's pictures). A native modal dialog: Escape closes it and focus stays inside; a
// click on the backdrop or on the button closes it too.
import { useI18n } from '#imports'

const { t } = useI18n()
const { picture, close } = useLightbox()
const dialog = ref<HTMLDialogElement>()

watch(
  picture,
  (shown) => {
    if (shown && !dialog.value?.open) dialog.value?.showModal()
    else if (!shown) dialog.value?.close()
  },
  { flush: 'post' },
)

// Outside the picture: the dialog itself is the backdrop's target
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) close()
}
</script>

<template>
  <dialog ref="dialog" class="lightbox" :aria-label="picture?.alt" @close="close" @click="onClick">
    <figure v-if="picture" class="panel">
      <img :src="picture.src" :alt="picture.alt" class="lightbox-picture rounded-2xl" />
      <figcaption class="flex items-center justify-between gap-3 py-1.5 pr-1.5 pl-3">
        <span class="eyebrow truncate">{{ picture.alt }}</span>
        <button
          type="button"
          class="icon-btn shrink-0"
          :aria-label="t('lightbox.close')"
          @click="close"
        >
          <UIcon name="i-heroicons-x-mark-20-solid" class="size-4" aria-hidden="true" />
        </button>
      </figcaption>
    </figure>
  </dialog>
</template>

<style scoped>
.lightbox {
  max-width: min(92vw, 80rem);
  max-height: 94vh;
  margin: auto;
  padding: 0;
  overflow: visible;
  border: 0;
  background: transparent;
}

.lightbox::backdrop {
  background: rgb(0 0 0 / 0.72);
  backdrop-filter: blur(6px);
}

.lightbox-picture {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: 82vh;
}

.lightbox[open] {
  animation: lightbox-in 0.4s var(--ease-out-quint);
}

.lightbox[open]::backdrop {
  animation: lightbox-fade 0.4s ease;
}

@keyframes lightbox-in {
  from {
    opacity: 0;
    scale: 0.94;
    filter: blur(6px);
  }
}

@keyframes lightbox-fade {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lightbox[open],
  .lightbox[open]::backdrop {
    animation: none;
  }
}
</style>
