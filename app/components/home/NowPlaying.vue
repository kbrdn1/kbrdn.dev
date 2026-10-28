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
  if (!tracks.value?.length) return
  showTrack(pickNextIndex('next'), 'next')
}

const shouldAutoPlay = ref(false)
// The cover and the title swap sideways, the way the track went; the controls stay put
const direction = ref<'next' | 'prev'>('next')

function showTrack(index: number, towards: 'next' | 'prev') {
  direction.value = towards
  currentIndex.value = index
  currentTime.value = 0
}

function switchTrack(index: number, towards: 'next' | 'prev') {
  shouldAutoPlay.value = isPlaying.value
  if (audio.value) {
    audio.value.pause()
    isPlaying.value = false
  }
  showTrack(index, towards)
}

function nextTrack() {
  if (!tracks.value?.length) return
  switchTrack(pickNextIndex('next'), 'next')
}

function prevTrack() {
  if (!tracks.value?.length) return
  switchTrack(pickNextIndex('prev'), 'prev')
}

function goToTrack(index: number) {
  if (index === currentIndex.value) return
  switchTrack(index, index > currentIndex.value ? 'next' : 'prev')
}

function onCanPlay() {
  if (shouldAutoPlay.value && audio.value) {
    audio.value.play()
    isPlaying.value = true
    shouldAutoPlay.value = false
  }
}

// The article reader takes the dock: the music stops instead of talking over it
const dock = useDock()
watch(dock, (value) => {
  if (value !== 'speech' || !isPlaying.value) return
  audio.value?.pause()
  isPlaying.value = false
})

// Auto-rotate every 45s when not playing, and not while motion is reduced or paused
let rotateInterval: ReturnType<typeof setInterval> | undefined
const reducedMotion = useReducedMotion()

onMounted(() => {
  rotateInterval = setInterval(() => {
    if (!isPlaying.value && !reducedMotion.value) nextTrack()
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
  <div v-if="tracks?.length">
    <!-- Player card: a panel floating over the page (LayoutMusicDock) -->
    <div class="panel w-full overflow-hidden transition-all hover:border-primary-500/50">
      <div class="flex items-center gap-4 p-3">
        <!-- Album art -->
        <div class="relative shrink-0 overflow-hidden rounded-[0.625rem] group/cover">
          <div class="size-14">
            <Transition :name="`swap-${direction}`" mode="out-in">
              <img
                v-if="track"
                :key="track.cover"
                :src="track.cover"
                :alt="track?.album"
                width="56"
                height="56"
                class="size-14 object-cover"
              />
            </Transition>
          </div>
          <!-- Play overlay on cover -->
          <button
            type="button"
            class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/cover:opacity-100 focus-visible:opacity-100 transition-opacity"
            :aria-label="isPlaying ? t('music.pause') : t('music.play')"
            @click="togglePlay"
          >
            <svg
              v-if="!isPlaying"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              class="w-6 h-6"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              class="w-6 h-6"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
          <!-- Playing indicator -->
          <div v-if="isPlaying" class="absolute bottom-1 right-1 flex items-end gap-px h-3">
            <span
              class="w-0.5 bg-primary-500 rounded-full animate-[eq1_0.8s_ease-in-out_infinite]"
              style="height: 60%"
            />
            <span
              class="w-0.5 bg-primary-500 rounded-full animate-[eq2_0.8s_ease-in-out_infinite]"
              style="height: 100%"
            />
            <span
              class="w-0.5 bg-primary-500 rounded-full animate-[eq3_0.8s_ease-in-out_infinite]"
              style="height: 40%"
            />
          </div>
        </div>

        <!-- Track info + controls -->
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <Transition :name="`swap-${direction}`" mode="out-in">
              <div :key="currentIndex" class="min-w-0">
                <a
                  :href="track?.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate hover:text-primary-500 transition-colors"
                >
                  {{ track?.title }}
                </a>
                <span class="block text-xs text-neutral-500 truncate mt-0.5">
                  {{ track?.artist }} · {{ track?.album }}
                </span>
              </div>
            </Transition>

            <!-- Controls: prev / play / next + shuffle & listing grouped -->
            <div class="ml-auto flex items-center gap-0.5 shrink-0">
              <UTooltip :text="t('music.previous')">
                <button
                  type="button"
                  class="icon-btn size-8 cursor-pointer"
                  :aria-label="t('music.previous')"
                  @click.prevent.stop="prevTrack"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-3.5 h-3.5"
                  >
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                  </svg>
                </button>
              </UTooltip>
              <UTooltip :text="isPlaying ? t('music.pause') : t('music.play')">
                <button
                  type="button"
                  class="mx-0.5 flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-neutral-950 transition-colors hover:bg-primary-400"
                  :aria-label="isPlaying ? t('music.pause') : t('music.play')"
                  @click="togglePlay"
                >
                  <svg
                    v-if="!isPlaying"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-4 h-4 ml-0.5"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-4 h-4"
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                </button>
              </UTooltip>
              <UTooltip :text="t('music.next')">
                <button
                  type="button"
                  class="icon-btn size-8 cursor-pointer"
                  :aria-label="t('music.next')"
                  @click.prevent.stop="nextTrack"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-3.5 h-3.5"
                  >
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                  </svg>
                </button>
              </UTooltip>
              <span class="mx-1 h-4 w-px bg-(--panel-border)" aria-hidden="true" />
              <UTooltip :text="shuffleMode ? t('music.shuffleOff') : t('music.shuffleOn')">
                <button
                  type="button"
                  class="segment size-8 cursor-pointer px-0"
                  :aria-pressed="shuffleMode"
                  :aria-label="t('music.shuffle')"
                  @click.prevent.stop="shuffleMode = !shuffleMode"
                >
                  <UIcon name="i-heroicons-arrows-right-left" class="w-3.5 h-3.5" />
                </button>
              </UTooltip>
              <UTooltip :text="showListing ? t('music.hideList') : t('music.showList')">
                <button
                  type="button"
                  class="segment size-8 cursor-pointer px-0"
                  :aria-expanded="showListing"
                  aria-controls="music-tracklist"
                  :aria-label="t('music.tracklist')"
                  @click.prevent.stop="showListing = !showListing"
                >
                  <UIcon name="i-heroicons-queue-list" class="w-3.5 h-3.5" />
                </button>
              </UTooltip>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="flex items-center gap-2 mt-2">
            <!-- Start and end times roll like the site's numbers -->
            <span class="eyebrow w-8 text-right tabular-nums">
              <UiRollingNumber :value="formatTime(currentTime)" />
            </span>
            <!-- A tick slider, after disarto's cost estimate: ticks filled up to a pill handle -->
            <div
              class="progress-bar group/bar relative h-4 flex-1 cursor-pointer"
              role="slider"
              tabindex="0"
              :aria-label="t('music.progress')"
              :aria-valuenow="Math.round(currentTime)"
              :aria-valuemin="0"
              :aria-valuemax="Math.round(duration)"
              :aria-valuetext="
                t('music.timeOf', { current: formatTime(currentTime), total: formatTime(duration) })
              "
              @mousedown="startSeek"
              @keydown.left.prevent="
                audio && (audio.currentTime = Math.max(0, audio.currentTime - 5))
              "
              @keydown.right.prevent="
                audio && (audio.currentTime = Math.min(duration, audio.currentTime + 5))
              "
            >
              <div
                class="ticks absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 bg-neutral-300 dark:bg-neutral-700"
              >
                <div
                  class="h-full bg-primary-500"
                  :style="{
                    width: `${progress}%`,
                    transition: isSeeking ? 'none' : 'width 1s linear',
                  }"
                />
              </div>
              <div
                class="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900 transition-transform duration-150 dark:bg-white"
                :class="isSeeking ? 'scale-110' : ''"
                :style="{
                  left: `${progress}%`,
                  transition: isSeeking ? 'none' : 'left 1s linear',
                }"
              />
            </div>
            <span class="eyebrow w-8 tabular-nums">
              <UiRollingNumber :value="formatTime(duration)" />
            </span>
          </div>
        </div>
      </div>

      <!-- Track indicators -->
      <!-- Track indicators: dots, the current one a longer orange pill; each button is
           larger than its dot, to be easy to hit -->
      <div v-if="tracks.length > 1 && !showListing" class="flex items-center justify-center pb-2">
        <button
          v-for="(_, index) in tracks"
          :key="index"
          type="button"
          class="group/dot cursor-pointer p-1"
          :aria-label="t('music.track', { n: index + 1, total: tracks.length })"
          :aria-current="currentIndex === index ? 'true' : undefined"
          @click.prevent.stop="goToTrack(index)"
        >
          <span
            :class="
              cn(
                'block h-1.5 rounded-full transition-[width,background-color] duration-300',
                currentIndex === index
                  ? 'w-4 bg-primary-500'
                  : 'w-1.5 bg-neutral-300 group-hover/dot:bg-neutral-400 dark:bg-neutral-700 dark:group-hover/dot:bg-neutral-500',
              )
            "
          />
        </button>
      </div>

      <!-- Track listing: a card under the player, after disarto's ground station rows -->
      <UiExpand :open="showListing">
        <div id="music-tracklist" class="panel-card mt-1 max-h-56 overflow-y-auto p-1.5">
          <button
            v-for="(t, index) in tracks"
            :key="index"
            type="button"
            :aria-current="currentIndex === index ? 'true' : undefined"
            :class="
              cn(
                'row flex w-full items-center gap-3 px-2.5 py-2 text-left',
                currentIndex === index && 'bg-primary-500/10 hover:bg-primary-500/15',
              )
            "
            @click.prevent.stop="goToTrack(index)"
          >
            <span
              :class="
                cn(
                  'eyebrow w-5 shrink-0 text-right tabular-nums',
                  currentIndex === index && 'text-(--accent-text)',
                )
              "
            >
              <UIcon
                v-if="currentIndex === index && isPlaying"
                name="i-heroicons-speaker-wave-16-solid"
                class="size-3.5"
                aria-hidden="true"
              />
              <template v-else>{{ String(index + 1).padStart(2, '0') }}</template>
            </span>
            <img
              :src="t.cover"
              :alt="t.album"
              class="size-9 shrink-0 rounded-lg object-cover ring-1 ring-(--card-border)"
            />
            <span class="min-w-0 flex-1">
              <span
                :class="
                  cn(
                    'block truncate text-sm',
                    currentIndex === index
                      ? 'text-(--accent-text)'
                      : 'text-neutral-900 dark:text-neutral-100',
                  )
                "
              >
                {{ t.title }}
              </span>
              <span class="eyebrow block truncate">{{ t.artist }}</span>
            </span>
          </button>
        </div>
      </UiExpand>

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
