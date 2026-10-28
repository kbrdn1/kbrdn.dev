<script setup lang="ts">
// Floating player: a button bottom-right opens HomeNowPlaying's card, floating centred at the
// bottom of the viewport, as wide as the page content (max-w-5xl minus its padding). No panel
// around it: the card carries its own background. Mounted in app.vue, so the music keeps
// playing across pages and layouts. The player, and its /api/music fetch, only mounts on
// first open, then stays mounted while hidden so playback carries on.
const { t } = useI18n()
const open = ref(false)
const loaded = ref(false)
const toggleButton = ref<HTMLButtonElement>()

function toggle() {
  loaded.value = true
  open.value = !open.value
}

// Escape closes the card and gives focus back to the button that opened it.
function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !open.value) return
  open.value = false
  toggleButton.value?.focus()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <!-- Slides up from under the viewport's edge, without a fade: opacity on this wrapper
       would turn the player's glass off for the whole transition -->
  <Transition
    enter-from-class="translate-y-[calc(100%+5rem)]"
    leave-to-class="translate-y-[calc(100%+5rem)]"
    enter-active-class="transition-transform duration-500 ease-out-quint motion-reduce:transition-none"
    leave-active-class="transition-transform duration-300 ease-in motion-reduce:transition-none"
  >
    <!-- Above the toggle until xl, where the centred column no longer reaches it. -->
    <section
      v-if="loaded"
      v-show="open"
      id="music-dock"
      :aria-label="t('music.listeningTo')"
      class="fixed bottom-17 xl:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(61rem,calc(100vw-2rem))]"
    >
      <HomeNowPlaying />
    </section>
  </Transition>
  <button
    ref="toggleButton"
    type="button"
    class="fixed bottom-4 right-4 z-50 flex size-11 items-center justify-center rounded-full border border-(--panel-border) bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md text-neutral-600 dark:text-neutral-300 transition-colors hover:text-primary-500 hover:border-primary-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 dark:focus-visible:ring-primary-500"
    :aria-label="open ? t('music.closePlayer') : t('music.openPlayer')"
    :aria-expanded="open"
    aria-controls="music-dock"
    @click="toggle"
  >
    <UIcon
      :name="open ? 'i-heroicons-x-mark' : 'i-heroicons-musical-note'"
      class="size-5"
      aria-hidden="true"
    />
  </button>
</template>
