<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

const { data: track } = await useFetch('/api/music')

const audio = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(30)

function togglePlay(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (!audio.value) return
  if (isPlaying.value) {
    audio.value.pause()
    isPlaying.value = false
  } else {
    audio.value.play()
    isPlaying.value = true
  }
}

function onTimeUpdate() {
  if (audio.value) {
    currentTime.value = audio.value.currentTime
    duration.value = audio.value.duration || 30
  }
}

function onAudioEnded() {
  isPlaying.value = false
  currentTime.value = 0
}

function seekTo(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (!audio.value) return
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const ratio = (e.clientX - rect.left) / rect.width
  audio.value.currentTime = ratio * duration.value
}

const progress = computed(() => {
  if (duration.value <= 0) return 0
  return (currentTime.value / duration.value) * 100
})

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div v-if="track" class="mt-6">
    <span class="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
      {{ t('music.listeningTo') }}
    </span>

    <!-- Player card -->
    <div
      :class="cn(
        'w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden',
        'bg-neutral-50 dark:bg-neutral-900/50',
        'hover:border-primary-500/50 transition-all',
      )"
    >
      <div class="flex items-center gap-4 p-3">
        <!-- Album art -->
        <div class="relative shrink-0 group/cover">
          <img
            :src="track.cover"
            :alt="track.album"
            width="56"
            height="56"
            class="object-cover"
            style="width: 56px; height: 56px;"
          />
          <!-- Play overlay on cover -->
          <button
            type="button"
            class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity"
            :aria-label="isPlaying ? 'Pause' : 'Play'"
            @click="togglePlay"
          >
            <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-6 h-6">
              <path d="M8 5v14l11-7z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-6 h-6">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
          <!-- Playing indicator -->
          <div
            v-if="isPlaying"
            class="absolute bottom-1 right-1 flex items-end gap-px h-3"
          >
            <span class="w-0.5 bg-primary-500 rounded-full animate-[eq1_0.8s_ease-in-out_infinite]" style="height: 60%;" />
            <span class="w-0.5 bg-primary-500 rounded-full animate-[eq2_0.8s_ease-in-out_infinite]" style="height: 100%;" />
            <span class="w-0.5 bg-primary-500 rounded-full animate-[eq3_0.8s_ease-in-out_infinite]" style="height: 40%;" />
          </div>
        </div>

        <!-- Track info + controls -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <a
                :href="track.link"
                target="_blank"
                rel="noopener noreferrer"
                class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate hover:text-primary-500 transition-colors"
              >
                {{ track.title }}
              </a>
              <span class="block text-xs text-neutral-500 truncate mt-0.5">
                {{ track.artist }} · {{ track.album }}
              </span>
            </div>

            <!-- Play button -->
            <button
              type="button"
              :class="cn(
                'shrink-0 flex items-center justify-center w-8 h-8',
                'text-white bg-primary-500 hover:bg-primary-400',
                'transition-all',
                isPlaying ? 'bg-primary-400' : '',
              )"
              :aria-label="isPlaying ? 'Pause' : 'Play'"
              @click="togglePlay"
            >
              <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            </button>
          </div>

          <!-- Progress bar -->
          <div class="flex items-center gap-2 mt-2">
            <span class="text-[10px] font-mono text-neutral-400 w-7 text-right">
              {{ formatTime(currentTime) }}
            </span>
            <div
              class="flex-1 h-1 bg-neutral-200 dark:bg-neutral-800 cursor-pointer group/bar"
              @click="seekTo"
            >
              <div
                class="h-full bg-primary-500 relative"
                :style="{ width: `${progress}%`, transition: 'width 0.1s linear' }"
              >
                <div class="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary-500 border-2 border-white dark:border-neutral-900 rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity" />
              </div>
            </div>
            <span class="text-[10px] font-mono text-neutral-400 w-7">
              {{ formatTime(duration) }}
            </span>
          </div>
        </div>
      </div>

      <audio
        v-if="track.preview"
        ref="audio"
        :src="track.preview"
        preload="none"
        @timeupdate="onTimeUpdate"
        @ended="onAudioEnded"
        @loadedmetadata="onTimeUpdate"
      />
    </div>
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
