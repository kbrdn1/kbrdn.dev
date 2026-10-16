<script setup lang="ts">
// Floating player: a button bottom-right opens HomeNowPlaying in a bar fixed at the bottom
// of the page. Mounted in app.vue, so the music keeps playing across pages and layouts.
// The player, and its /api/music fetch, only mounts on first open, then stays mounted while
// hidden so playback carries on.
const { t } = useI18n()
const open = ref(false)
const loaded = ref(false)

function toggle() {
  loaded.value = true
  open.value = !open.value
}
</script>

<template>
  <Transition
    enter-from-class="translate-y-full"
    leave-to-class="translate-y-full"
    enter-active-class="transition-transform duration-300 ease-out motion-reduce:transition-none"
    leave-active-class="transition-transform duration-200 ease-in motion-reduce:transition-none"
  >
    <section
      v-if="loaded"
      v-show="open"
      id="music-dock"
      :aria-label="t('music.listeningTo')"
      class="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md"
    >
      <!-- Aligned on the page content; the right padding keeps the controls clear of the
           toggle until the column is narrow enough to clear it on its own. -->
      <div class="mx-auto max-w-5xl px-6 py-4 pr-20 xl:pr-6">
        <HomeNowPlaying />
      </div>
    </section>
  </Transition>
  <button
    type="button"
    class="fixed bottom-4 right-4 z-50 flex size-11 items-center justify-center border border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md text-neutral-600 dark:text-neutral-300 transition-colors hover:text-primary-500 hover:border-primary-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
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
