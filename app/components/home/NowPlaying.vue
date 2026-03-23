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
  slideDirection.value = 'left'
  shouldAutoPlay.value = true
  isPlaying.value = false
  currentTime.value = 0
  if (!tracks.value?.length) return
  const nextIdx = pickNextIndex('next')
  isTransitioning.value = true
  setTimeout(() => {
    currentIndex.value = nextIdx
    currentTime.value = 0
    isTransitioning.value = false
  }, 300)
}

const shouldAutoPlay = ref(false)
const slideDirection = ref<'left' | 'right'>('left')

function nextTrack() {
  slideDirection.value = 'left'
  if (!tracks.value?.length) return
  shouldAutoPlay.value = isPlaying.value
  if (audio.value) { audio.value.pause(); isPlaying.value = false }
  const nextIdx = pickNextIndex('next')
  isTransitioning.value = true
  setTimeout(() => {
    currentIndex.value = nextIdx
    currentTime.value = 0
    isTransitioning.value = false
  }, 300)
}

function prevTrack() {
  slideDirection.value = 'right'
  if (!tracks.value?.length) return
  shouldAutoPlay.value = isPlaying.value
  if (audio.value) { audio.value.pause(); isPlaying.value = false }
  const prevIdx = pickNextIndex('prev')
  isTransitioning.value = true
  setTimeout(() => {
    currentIndex.value = prevIdx
    currentTime.value = 0
    isTransitioning.value = false
  }, 300)
}

function goToTrack(index: number) {
  if (index === currentIndex.value) return
  slideDirection.value = index > currentIndex.value ? 'left' : 'right'
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
const showListing = ref(false)
const shuffleMode = ref(false)

function pickNextIndex(direction: 'next' | 'prev'): number {
  if (!tracks.value?.length) return 0
  if (shuffleMode.value) {
    let randomIndex: number
    do {
      randomIndex = Math.floor(Math.random() * tracks.value.length)
    } while (randomIndex === currentIndex.value && tracks.value.length > 1)
    return randomIndex
  }
  if (direction === 'next') {
    return (currentIndex.value + 1) % tracks.value.length
  }
  return (currentIndex.value - 1 + tracks.value.length) % tracks.value.length
}

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
        :class="{
          'player-hidden-left': isTransitioning && slideDirection === 'left',
          'player-hidden-right': isTransitioning && slideDirection === 'right',
          'player-visible': !isTransitioning,
        }"
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

            <!-- Controls: prev / play / next + shuffle & listing grouped -->
            <div class="flex items-center gap-0.5 shrink-0">
              <UTooltip :text="t('music.previous')">
                <button
                  type="button"
                  class="flex items-center justify-center w-7 h-7 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                  :aria-label="t('music.previous')"
                  @click.prevent.stop="prevTrack"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                </button>
              </UTooltip>
              <UTooltip :text="isPlaying ? t('music.pause') : t('music.play')">
                <button
                  type="button"
                  :class="cn(
                    'flex items-center justify-center w-8 h-8',
                    'text-white bg-primary-500 hover:bg-primary-400',
                    'transition-all cursor-pointer',
                  )"
                  :aria-label="isPlaying ? t('music.pause') : t('music.play')"
                  @click="togglePlay"
                >
                  <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 ml-0.5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                </button>
              </UTooltip>
              <UTooltip :text="t('music.next')">
                <button
                  type="button"
                  class="flex items-center justify-center w-7 h-7 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                  :aria-label="t('music.next')"
                  @click.prevent.stop="nextTrack"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                </button>
              </UTooltip>
              <span class="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-0.5" />
              <UTooltip :text="shuffleMode ? t('music.shuffleOff') : t('music.shuffleOn')">
                <button
                  type="button"
                  :class="cn('flex items-center justify-center w-7 h-7 transition-colors cursor-pointer', shuffleMode ? 'text-primary-500' : 'text-neutral-400 hover:text-primary-500')"
                  :aria-label="shuffleMode ? t('music.shuffleOff') : t('music.shuffleOn')"
                  @click.prevent.stop="shuffleMode = !shuffleMode"
                >
                  <UIcon name="i-heroicons-arrows-right-left" class="w-3.5 h-3.5" />
                </button>
              </UTooltip>
              <UTooltip :text="showListing ? t('music.hideList') : t('music.showList')">
                <button
                  type="button"
                  :class="cn('flex items-center justify-center w-7 h-7 transition-colors cursor-pointer', showListing ? 'text-primary-500' : 'text-neutral-400 hover:text-primary-500')"
                  :aria-label="showListing ? t('music.hideList') : t('music.showList')"
                  @click.prevent.stop="showListing = !showListing"
                >
                  <UIcon name="i-heroicons-queue-list" class="w-3.5 h-3.5" />
                </button>
              </UTooltip>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="flex items-center gap-2 mt-2">
            <span class="text-[10px] font-mono text-neutral-400 w-7 text-right">
              {{ formatTime(currentTime) }}
            </span>
            <div
              class="progress-bar flex-1 h-1 bg-neutral-200 dark:bg-neutral-800 cursor-pointer group/bar relative"
              role="slider"
              tabindex="0"
              :aria-label="'Track progress'"
              :aria-valuenow="Math.round(currentTime)"
              :aria-valuemin="0"
              :aria-valuemax="Math.round(duration)"
              :aria-valuetext="`${formatTime(currentTime)} of ${formatTime(duration)}`"
              :class="{ 'h-1.5': isSeeking }"
              style="transition: height 0.15s ease;"
              @mousedown="startSeek"
              @keydown.left.prevent="audio && (audio.currentTime = Math.max(0, audio.currentTime - 5))"
              @keydown.right.prevent="audio && (audio.currentTime = Math.min(duration, audio.currentTime + 5))"
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
      <div v-if="tracks.length > 1 && !showListing" class="flex items-center justify-center gap-2 px-3 pb-3">
        <button
          v-for="(_, index) in tracks"
          :key="index"
          type="button"
          :aria-label="`Track ${index + 1} of ${tracks.length}${currentIndex === index ? ' (current)' : ''}`"
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

      <!-- Track listing -->
      <div
        class="border-t border-neutral-200 dark:border-neutral-800 grid overflow-hidden"
        :class="showListing ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 border-t-transparent'"
        style="transition: grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease, border-color 200ms ease !important;"
      >
        <div class="overflow-hidden">
          <div class="max-h-48 overflow-y-auto">
            <button
              v-for="(t, index) in tracks"
              :key="index"
              type="button"
              :class="cn(
                'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                currentIndex === index
                  ? 'bg-primary-500/10'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/50',
              )"
              @click.prevent.stop="goToTrack(index)"
            >
              <span :class="cn('text-[10px] font-mono w-4 text-right shrink-0', currentIndex === index ? 'text-primary-500' : 'text-neutral-400')">
                {{ currentIndex === index && isPlaying ? '▸' : String(index + 1) }}
              </span>
              <img :src="t.cover" :alt="t.album" class="w-8 h-8 shrink-0 object-cover" />
              <div class="min-w-0 flex-1">
                <span :class="cn('block text-xs truncate', currentIndex === index ? 'text-primary-500 font-medium' : 'text-neutral-900 dark:text-neutral-100')">
                  {{ t.title }}
                </span>
                <span class="block text-[10px] text-neutral-500 truncate">
                  {{ t.artist }}
                </span>
              </div>
            </button>
          </div>
        </div>
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
