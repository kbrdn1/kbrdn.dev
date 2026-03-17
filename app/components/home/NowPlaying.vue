<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()

interface Track {
  title: string
  artist: string
  album: string
  cover: string
  preview: string
  link: string
}

const { data: tracks } = await useFetch<Track[]>('/api/music')

const currentIndex = ref(0)
const isTransitioning = ref(false)
const track = computed(() => tracks.value?.[currentIndex.value] || null)

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
  shouldAutoPlay.value = true
  isPlaying.value = false
  currentTime.value = 0
  if (!tracks.value?.length) return
  isTransitioning.value = true
  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % tracks.value!.length
    currentTime.value = 0
    isTransitioning.value = false
  }, 300)
}

const shouldAutoPlay = ref(false)

function nextTrack() {
  if (!tracks.value?.length) return
  shouldAutoPlay.value = isPlaying.value
  if (audio.value) { audio.value.pause(); isPlaying.value = false }
  isTransitioning.value = true
  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % tracks.value!.length
    currentTime.value = 0
    isTransitioning.value = false
  }, 300)
}

function prevTrack() {
  if (!tracks.value?.length) return
  shouldAutoPlay.value = isPlaying.value
  if (audio.value) { audio.value.pause(); isPlaying.value = false }
  isTransitioning.value = true
  setTimeout(() => {
    currentIndex.value = (currentIndex.value - 1 + tracks.value!.length) % tracks.value!.length
    currentTime.value = 0
    isTransitioning.value = false
  }, 300)
}

function goToTrack(index: number) {
  if (index === currentIndex.value) return
  shouldAutoPlay.value = isPlaying.value
  if (audio.value) { audio.value.pause(); isPlaying.value = false }
  isTransitioning.value = true
  setTimeout(() => {
    currentIndex.value = index
    currentTime.value = 0
    isTransitioning.value = false
  }, 300)
}

function onCanPlay() {
  if (shouldAutoPlay.value && audio.value) {
    audio.value.play()
    isPlaying.value = true
    shouldAutoPlay.value = false
  }
}

// Auto-rotate every 45s when not playing
let rotateInterval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  rotateInterval = setInterval(() => {
    if (!isPlaying.value) nextTrack()
  }, 45000)
})

onUnmounted(() => {
  if (rotateInterval) clearInterval(rotateInterval)
})

const isSeeking = ref(false)

function seekTo(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (!audio.value) return
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  audio.value.currentTime = ratio * duration.value
}

function startSeek(e: MouseEvent) {
  isSeeking.value = true
  seekTo(e)
  const onMove = (ev: MouseEvent) => {
    if (!audio.value) return
    const bar = document.querySelector('.progress-bar') as HTMLElement
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width))
    audio.value.currentTime = ratio * duration.value
    currentTime.value = ratio * duration.value
  }
  const onUp = () => {
    isSeeking.value = false
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
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
  <div v-if="tracks?.length" class="mt-6">
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
      <div
        class="flex items-center gap-4 p-3"
        :class="{ 'opacity-0 translate-x-6': isTransitioning, 'opacity-100 translate-x-0': !isTransitioning }"
        :style="{ transition: 'opacity 0.4s ease, transform 0.4s ease' }"
      >
        <!-- Album art -->
        <div class="relative shrink-0 group/cover">
          <img
            v-if="track"
            :src="track.cover"
            :alt="track?.album"
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

            <!-- Controls: prev / play / next -->
            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                class="flex items-center justify-center w-7 h-7 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                aria-label="Previous"
                @click.prevent.stop="prevTrack"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
              </button>
              <button
                type="button"
                :class="cn(
                  'flex items-center justify-center w-8 h-8',
                  'text-white bg-primary-500 hover:bg-primary-400',
                  'transition-all',
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
              <button
                type="button"
                class="flex items-center justify-center w-7 h-7 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                aria-label="Next"
                @click.prevent.stop="nextTrack"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
              </button>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="flex items-center gap-2 mt-2">
            <span class="text-[10px] font-mono text-neutral-400 w-7 text-right">
              {{ formatTime(currentTime) }}
            </span>
            <div
              class="progress-bar flex-1 h-1 bg-neutral-200 dark:bg-neutral-800 cursor-pointer group/bar relative"
              :class="{ 'h-1.5': isSeeking }"
              style="transition: height 0.15s ease;"
              @mousedown="startSeek"
            >
              <div
                class="h-full bg-primary-500 relative"
                :style="{ width: `${progress}%`, transition: isSeeking ? 'none' : 'width 1s linear' }"
              >
                <div
                  :class="cn(
                    'absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 border-2 border-white dark:border-neutral-900 rounded-full',
                    'transition-transform duration-150',
                    isSeeking ? 'scale-125 opacity-100' : 'scale-0 group-hover/bar:scale-100 opacity-0 group-hover/bar:opacity-100',
                  )"
                />
              </div>
            </div>
            <span class="text-[10px] font-mono text-neutral-400 w-7">
              {{ formatTime(duration) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Track indicators -->
      <div v-if="tracks.length > 1" class="flex items-center justify-center gap-2 px-3 pb-3">
        <button
          v-for="(_, index) in tracks"
          :key="index"
          :class="cn(
            'h-0.5 cursor-pointer',
            currentIndex === index
              ? 'bg-primary-500'
              : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500',
          )"
          :style="{
            width: currentIndex === index ? '24px' : '12px',
            transition: 'width 300ms ease, background-color 300ms ease',
          }"
          @click.prevent.stop="goToTrack(index)"
        />
      </div>

      <audio
        v-if="track?.preview"
        :key="track.preview"
        ref="audio"
        :src="track.preview"
        preload="auto"
        @timeupdate="onTimeUpdate"
        @ended="onAudioEnded"
        @loadedmetadata="onTimeUpdate"
        @canplay="onCanPlay"
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
