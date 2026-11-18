<script setup lang="ts">
// A picture full size over the page, after a click on an illustration (/experience, an
// article's pictures), in the card of Kylian's Herdr modals (#167): a 60px head over the
// dither band, tinted by the context (the blog's blue in an article, the site's orange
// elsewhere), with a 32px mark, the title and a mono line; the picture in a block; the keys
// in the foot. A native modal dialog: the page behind is inert and Escape closes it. A close
// is immediate, focus included; the card then leaves before the veil, in CSS, where the
// browser can keep a closed dialog drawn (@starting-style, allow-discrete).
import { useI18n } from '#imports'

const { t } = useI18n()
const { picture, close, takeOpener } = useLightbox()
const dialog = ref<HTMLDialogElement>()
const route = useRoute()

// The last picture shown: it stays drawn while the card leaves
const shown = ref<{ src: string; alt: string }>()
const size = ref<string>()
const failed = ref(false)
// What opened it gets the focus back on close (showModal's own restoring is recent): the
// button clicked, else what had the focus
let opener: HTMLElement | null = null

watch(
  picture,
  (next) => {
    if (next && !dialog.value?.open) {
      // The same picture again: its <img> stays and does not load twice, so its size and its
      // error stay too
      if (next.src !== shown.value?.src) {
        size.value = undefined
        failed.value = false
      }
      shown.value = next
      const focused = document.activeElement
      opener = takeOpener() ?? (focused instanceof HTMLElement ? focused : null)
      dialog.value?.showModal()
    } else if (!next && dialog.value?.open) dialog.value.close()
  },
  { flush: 'post' },
)

// Escape, the button, the veil and a new page all end here
function onClose() {
  close()
  if (opener?.isConnected) opener.focus()
  opener = null
}

// Another page: the picture belonged to the one left
watch(() => route.fullPath, close)

// Outside the card: the dialog itself is the veil's target
function onClick(event: MouseEvent) {
  if (event.target === dialog.value) close()
}

// The blog layout's blue, as its dither background (layouts/blog.vue)
const band = computed(() =>
  route.meta.layout === 'blog' ? 'var(--color-sky-400)' : 'var(--color-primary-500)',
)
// The file's name and, once loaded, its size: "gwm-tui.png · 1600 × 1000". A stray "%" in a
// name would make decodeURIComponent throw: the name stays as written then
const subtitle = computed(() => {
  const name = shown.value?.src.split(/[?#]/)[0]?.split('/').pop() ?? ''
  let decoded: string
  try {
    decoded = decodeURIComponent(name)
  } catch {
    decoded = name
  }
  return [decoded, size.value].filter(Boolean).join(' · ')
})

// Only the picture shown now: a picture left before it loaded keeps loading, detached, and its
// late load or error would land on the next one
function onLoad(event: Event) {
  const img = event.target as HTMLImageElement
  if (img.getAttribute('src') !== shown.value?.src) return
  size.value = `${img.naturalWidth} × ${img.naturalHeight}`
}

function onError(event: Event) {
  if ((event.target as HTMLImageElement).getAttribute('src') === shown.value?.src)
    failed.value = true
}
</script>

<template>
  <!-- Focus on the dialog itself first: its name is read out, and Tab reaches the button -->
  <dialog
    ref="dialog"
    class="lightbox"
    aria-labelledby="lightbox-title"
    autofocus
    :style="{ '--band': band }"
    @close="onClose"
    @click="onClick"
  >
    <div v-if="shown" class="lightbox-card panel">
      <div class="panel-card overflow-hidden">
        <!-- Plain divs: a header or footer outside a sectioning element is a page's banner -->
        <div class="dither-band flex h-15 items-center gap-3 pr-2 pl-3.5">
          <span class="lightbox-mark" aria-hidden="true">
            <UIcon name="i-lucide-image" class="size-4" />
          </span>
          <div class="min-w-0 flex-1">
            <h2
              id="lightbox-title"
              class="truncate text-sm font-semibold text-(--ui-text-highlighted)"
            >
              {{ shown.alt || t('lightbox.untitled') }}
            </h2>
            <p class="truncate font-mono text-[10.5px] text-(--label)">{{ subtitle }}</p>
          </div>
          <!-- In the dialog: a tooltip in the body would sit under the top layer -->
          <UTooltip :text="t('lightbox.close')" :kbds="['escape']" :portal="dialog ?? false">
            <button
              type="button"
              class="icon-btn shrink-0"
              :aria-label="t('lightbox.close')"
              @click="close"
            >
              <UIcon name="i-heroicons-x-mark-20-solid" class="size-4" aria-hidden="true" />
            </button>
          </UTooltip>
        </div>

        <div class="lightbox-body border-t border-dashed p-2">
          <figure
            class="overflow-hidden rounded-[0.5rem] bg-(--placeholder) ring-1 ring-(--card-border)"
          >
            <p
              v-if="failed"
              class="flex min-h-40 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-(--ui-text-muted)"
              role="alert"
            >
              <UIcon name="i-lucide-image-off" class="size-5" aria-hidden="true" />
              {{ t('lightbox.error') }}
              <a
                :href="shown.src"
                target="_blank"
                rel="noopener noreferrer"
                class="underline underline-offset-4 hover:text-(--accent-text)"
              >
                {{ t('lightbox.openFile') }}
              </a>
            </p>
            <!-- One element per picture: a reused <img> keeps showing the last one, fully
                 loaded, while the new address loads -->
            <img
              v-else
              :key="shown.src"
              :src="shown.src"
              :alt="shown.alt"
              class="lightbox-picture"
              @load="onLoad"
              @error="onError"
            />
          </figure>
        </div>

        <div
          class="flex items-center gap-1.5 border-t border-dashed border-(--card-border) px-3.5 py-2.5 text-xs text-(--label)"
        >
          <UKbd value="escape" />
          {{ t('lightbox.close') }}
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
/* Fixed in its own right, not only while :modal: a closing dialog leaves the top layer, and
   where `overlay` cannot keep it there, it stays put for the card's way out */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 140;
  max-width: min(calc(100vw - 2rem), 80rem);
  max-height: calc(100dvh - 2rem);
  margin: auto;
  padding: 0;
  overflow: visible;
  border: 0;
  /* The card's corners: focused first, the dialog draws the site's focus ring around it */
  border-radius: 1.25rem;
  background: transparent;
  transition:
    display 0.18s allow-discrete,
    overlay 0.18s allow-discrete;
}

/* The veil: fades in with the card, leaves after it */
.lightbox::backdrop {
  background: rgb(0 0 0 / 0);
  backdrop-filter: blur(0);
  transition:
    background-color 0.12s ease-in 0.06s,
    backdrop-filter 0.12s ease-in 0.06s,
    display 0.18s allow-discrete,
    overlay 0.18s allow-discrete;
}

.lightbox[open]::backdrop {
  background: rgb(0 0 0 / 0.72);
  backdrop-filter: blur(6px);
  transition-delay: 0s;
  transition-duration: 0.18s;
  transition-timing-function: var(--ease-out-quint);
}

/* The card: rises 6px into place, sinks back on the way out. The panel's own (slower)
   transitions are replaced */
.lightbox-card {
  min-width: min(22rem, calc(100vw - 2rem));
  opacity: 0;
  translate: 0 6px;
  transition:
    opacity 0.12s ease-in,
    translate 0.12s ease-in;
}

.lightbox[open] .lightbox-card {
  opacity: 1;
  translate: 0 0;
  transition-duration: 0.18s;
  transition-timing-function: var(--ease-out-quint);
}

@starting-style {
  .lightbox[open]::backdrop {
    background: rgb(0 0 0 / 0);
    backdrop-filter: blur(0);
  }

  .lightbox[open] .lightbox-card {
    opacity: 0;
    translate: 0 6px;
  }
}

/* Herdr's mark: the icon on a soft square, edged with the band's colour */
.lightbox-mark {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid color-mix(in srgb, var(--band) 30%, transparent);
  border-radius: 0.625rem;
  background: color-mix(in srgb, var(--card-bg) 90%, transparent);
  color: var(--band);
}

/* The rule under the head, in the band's colour */
.lightbox-body {
  border-top-color: color-mix(in srgb, var(--band) 30%, transparent);
}

/* As large as the window allows, below the head and the foot */
.lightbox-picture {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: calc(100dvh - 12rem);
  margin-inline: auto;
}
</style>
