<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

const { data: track } = await useFetch('/api/music')

const audio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)

function togglePlay(e: MouseEvent) {
  e.preventDefault()
  if (!audio.value) return
  if (isPlaying.value) {
    audio.value.pause()
    isPlaying.value = false
  }
  else {
    audio.value.play()
    isPlaying.value = true
  }
}

function onAudioEnded() {
  isPlaying.value = false
}
</script>

<template>
  <div v-if="track" class="mt-4">
    <span class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
      {{ t('music.listeningTo') }}
    </span>
    <a
      :href="track.link"
      target="_blank"
      rel="noopener noreferrer"
      class="group flex items-center gap-3 border border-neutral-200 dark:border-neutral-800 px-3 py-2 transition-colors hover:border-primary-500 dark:hover:border-primary-500 w-fit"
    >
      <img
        :src="track.cover"
        :alt="track.album"
        width="40"
        height="40"
        class="shrink-0 object-cover"
        style="width:40px;height:40px;"
      >

      <div class="flex flex-col min-w-0">
        <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate leading-tight">
          {{ track.title }}
        </span>
        <span class="text-xs text-neutral-500 truncate leading-tight">
          {{ track.artist }}
        </span>
      </div>

      <div class="flex items-center gap-2 ml-2 shrink-0">
        <!-- Equalizer bars when playing -->
        <div v-if="isPlaying" class="flex items-end gap-px h-4">
          <span class="w-0.5 bg-primary-500 animate-[eq1_0.8s_ease-in-out_infinite]" style="height:60%;" />
          <span class="w-0.5 bg-primary-500 animate-[eq2_0.8s_ease-in-out_infinite]" style="height:100%;" />
          <span class="w-0.5 bg-primary-500 animate-[eq3_0.8s_ease-in-out_infinite]" style="height:40%;" />
          <span class="w-0.5 bg-primary-500 animate-[eq1_0.8s_ease-in-out_infinite_0.2s]" style="height:80%;" />
        </div>

        <!-- Play/Pause button -->
        <button
          type="button"
          class="flex items-center justify-center w-7 h-7 text-primary-500 hover:text-primary-400 transition-colors"
          :aria-label="isPlaying ? 'Pause' : 'Play'"
          @click="togglePlay"
        >
          <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>
      </div>

      <audio
        v-if="track.preview"
        ref="audio"
        :src="track.preview"
        preload="none"
        @ended="onAudioEnded"
      />
    </a>
  </div>
</template>

<style scoped>
@keyframes eq1 {
  0%, 100% { height: 30%; }
  50% { height: 100%; }
}
@keyframes eq2 {
  0%, 100% { height: 100%; }
  50% { height: 30%; }
}
@keyframes eq3 {
  0%, 100% { height: 60%; }
  25% { height: 100%; }
  75% { height: 20%; }
}
</style>
