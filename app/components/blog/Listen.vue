<script setup lang="ts">
// Reads the article aloud with the browser's own speech synthesis (Web Speech API, what
// TTSReader runs on): free, no key, no server, in the best voice the browser has for the
// article's language (pickVoice). A button where it is placed, and a player in the music
// dock's place, built from the music player's pieces. One utterance per sentence: it keeps
// Chrome's Google voices from stopping mid-article, and the sentence is what the progress bar
// counts and seeks to. Pausing cancels and restarts the sentence: speechSynthesis.pause() is
// unreliable on Chrome's network voices and on Android.
import { useI18n } from '#imports'

const props = defineProps<{
  title: string
  // The article's language, not the page's: an untranslated article is read in its own
  lang: string
}>()

const { t } = useI18n()
const dock = useDock()
const open = computed(() => dock.value === 'speech')
const trigger = ref<HTMLButtonElement>()

// Filled once mounted (the server has no voices), then again on voiceschanged: Chrome lists
// them asynchronously
const voices = shallowRef<SpeechSynthesisVoice[]>([])
const voice = computed(() => pickVoice(voices.value, props.lang))
function loadVoices() {
  voices.value = speechSynthesis.getVoices()
}

// What a listener needs: the text and its headings, not the code, the tables or the images
const BLOCKS = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,dt,dd'
const SKIP = 'pre,table,figure,img,svg,button,[aria-hidden="true"]'

const sentences = shallowRef<{ text: string; section: number }[]>([])
// The sections, as in the table of contents: the title, then each h1 to h3, and their heading's
// id (the title has none), which a heading's button asks to read from
const sections = shallowRef<string[]>([])
const sectionIds = shallowRef<string[]>([])

function read() {
  const list = splitSentences(props.title, props.lang).map((text) => ({ text, section: 0 }))
  const heads = [props.title]
  const ids = ['']
  document
    .querySelector('.prose-blog')
    ?.querySelectorAll(BLOCKS)
    .forEach((el) => {
      if (el.closest(SKIP)) return
      // Its own text only: a nested block (a list in a list item) is read on its own
      const own = el.cloneNode(true) as Element
      own.querySelectorAll(`${BLOCKS},${SKIP}`).forEach((node) => node.remove())
      const text = own.textContent?.replace(/\s+/g, ' ').trim()
      if (!text) return
      if (/^H[1-3]$/.test(el.tagName)) {
        heads.push(text)
        ids.push(el.id)
      }
      for (const sentence of splitSentences(text, props.lang))
        list.push({ text: sentence, section: heads.length - 1 })
    })
  sentences.value = list
  sections.value = heads
  sectionIds.value = ids
}

const index = ref(0)
const playing = ref(false)
const section = computed(() => sentences.value[index.value]?.section ?? 0)
const direction = ref<'next' | 'prev'>('next')
watch(section, (now, before) => (direction.value = now < before ? 'prev' : 'next'))
const sectionStarts = computed(() =>
  sections.value.map((_, s) => sentences.value.findIndex((x) => x.section === s)),
)
const progress = computed(() =>
  sentences.value.length ? (index.value / sentences.value.length) * 100 : 0,
)

// The utterance being spoken: events from any other one (cancelled) are ignored. Holding it
// also keeps it from being garbage-collected mid-sentence, which silences its onend
let current: SpeechSynthesisUtterance | undefined

function halt() {
  current = undefined
  speechSynthesis.cancel()
}

function speak(i: number) {
  halt()
  const sentence = sentences.value[i]
  if (!sentence || !voice.value) return
  index.value = i
  const utterance = new SpeechSynthesisUtterance(sentence.text)
  utterance.voice = voice.value
  utterance.lang = voice.value.lang
  utterance.onend = () => {
    if (utterance !== current) return
    if (i + 1 < sentences.value.length) return speak(i + 1)
    // The end: the next play starts over
    current = undefined
    playing.value = false
    index.value = 0
  }
  utterance.onerror = () => {
    if (utterance === current) pause()
  }
  current = utterance
  speechSynthesis.speak(utterance)
}

function play() {
  if (!sentences.value.length) read()
  dock.value = 'speech'
  playing.value = true
  speak(index.value)
}

function pause() {
  halt()
  playing.value = false
}

function seek(i: number) {
  index.value = Math.max(0, Math.min(sentences.value.length - 1, i))
  if (playing.value) speak(index.value)
}

// Previous: back to the start of the section, or to the previous one from its start
function previous() {
  const start = sectionStarts.value[section.value] ?? 0
  seek(index.value > start ? start : (sectionStarts.value[section.value - 1] ?? 0))
}

function next() {
  const start = sectionStarts.value[section.value + 1]
  if (start !== undefined) seek(start)
}

function seekAt(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  seek(Math.floor(((e.clientX - rect.left) / rect.width) * sentences.value.length))
}

// The button is at the top of the article: focusing it must not scroll the reader back there
function close() {
  dock.value = null
  trigger.value?.focus({ preventScroll: true })
}

const showList = ref(false)

// The headings' buttons (BlogListenFrom): shown once there is a voice, and each one asks to
// read from its heading
const { ready, from } = useListen()
watch(voice, (value) => (ready.value = !!value))
watch(from, (id) => {
  if (!id) return
  from.value = null
  if (!sentences.value.length) read()
  const s = sectionIds.value.indexOf(id)
  if (s < 0) return
  index.value = sectionStarts.value[s] ?? 0
  play()
})

// The player hidden (closed, or the music took the dock) stops reading; the article changing
// language starts it over
watch(open, (value) => {
  if (!value) pause()
})
watch(
  () => props.lang,
  () => {
    pause()
    sentences.value = []
    index.value = 0
  },
)

// Escape closes the player and gives focus back to the button, like the music dock
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) close()
}

onMounted(() => {
  if (!('speechSynthesis' in window)) return
  loadVoices()
  speechSynthesis.addEventListener('voiceschanged', loadVoices)
  window.addEventListener('keydown', onKeydown)
})

// Leaving the article: speechSynthesis is global, it would go on reading with no player left
onBeforeUnmount(() => {
  ready.value = false
  if (!('speechSynthesis' in window)) return
  halt()
  speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  window.removeEventListener('keydown', onKeydown)
  if (open.value) dock.value = null
})
</script>

<template>
  <!-- Rendered by the server already, invisible until a voice is found: the header keeps its
       height whether the browser can read or not -->
  <button
    ref="trigger"
    type="button"
    :class="cn('btn btn-outline btn-sm -my-2 shrink-0', !voice && 'invisible')"
    @click="playing ? pause() : play()"
  >
    <UIcon
      :name="playing ? 'i-heroicons-pause-16-solid' : 'i-heroicons-speaker-wave-16-solid'"
      class="size-4"
      aria-hidden="true"
    />
    {{ playing ? t('listen.pause') : t('listen.listen') }}
  </button>

  <Teleport to="body">
    <!-- The music dock's slide, from under the viewport's edge -->
    <Transition
      enter-from-class="translate-y-[calc(100%+5rem)]"
      leave-to-class="translate-y-[calc(100%+5rem)]"
      enter-active-class="transition-transform duration-500 ease-out-quint motion-reduce:transition-none"
      leave-active-class="transition-transform duration-300 ease-in motion-reduce:transition-none"
    >
      <section
        v-if="open"
        id="article-reader"
        :aria-label="t('listen.player')"
        class="fixed bottom-17 xl:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(61rem,calc(100vw-2rem))]"
      >
        <div class="panel w-full overflow-hidden">
          <div class="flex items-center gap-4 p-3">
            <!-- In the cover's place: the speaker, and the equalizer while it reads -->
            <div
              class="relative flex size-14 shrink-0 items-center justify-center rounded-[0.625rem] bg-primary-500/10 text-primary-500"
            >
              <UIcon name="i-heroicons-speaker-wave" class="size-6" aria-hidden="true" />
              <div v-if="playing" class="absolute right-1 bottom-1 flex h-3 items-end gap-px">
                <span
                  class="w-0.5 rounded-full bg-primary-500 animate-[eq1_0.8s_ease-in-out_infinite]"
                  style="height: 60%"
                />
                <span
                  class="w-0.5 rounded-full bg-primary-500 animate-[eq2_0.8s_ease-in-out_infinite]"
                  style="height: 100%"
                />
                <span
                  class="w-0.5 rounded-full bg-primary-500 animate-[eq3_0.8s_ease-in-out_infinite]"
                  style="height: 40%"
                />
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <!-- The section swaps sideways, the way the reading went, like a track -->
                <div class="min-w-0">
                  <Transition :name="`swap-${direction}`" mode="out-in">
                    <p
                      :key="section"
                      class="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100"
                      :lang="lang"
                    >
                      {{ sections[section] ?? title }}
                    </p>
                  </Transition>
                  <p class="mt-0.5 truncate text-xs text-neutral-500">
                    {{ t('listen.voice', { name: voice?.name ?? '' }) }}
                  </p>
                </div>

                <div class="ml-auto flex shrink-0 items-center gap-0.5">
                  <UTooltip :text="t('listen.previous')">
                    <button
                      type="button"
                      class="icon-btn size-8 cursor-pointer"
                      :aria-label="t('listen.previous')"
                      @click="previous"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        class="w-3.5 h-3.5"
                        aria-hidden="true"
                      >
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                      </svg>
                    </button>
                  </UTooltip>
                  <UTooltip :text="playing ? t('listen.pause') : t('listen.play')">
                    <button
                      type="button"
                      class="mx-0.5 flex size-9 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-neutral-950 transition-colors hover:bg-primary-400"
                      :aria-label="playing ? t('listen.pause') : t('listen.play')"
                      @click="playing ? pause() : play()"
                    >
                      <svg
                        v-if="!playing"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        class="w-4 h-4 ml-0.5"
                        aria-hidden="true"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        class="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    </button>
                  </UTooltip>
                  <UTooltip :text="t('listen.next')">
                    <button
                      type="button"
                      class="icon-btn size-8 cursor-pointer"
                      :aria-label="t('listen.next')"
                      @click="next"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        class="w-3.5 h-3.5"
                        aria-hidden="true"
                      >
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                      </svg>
                    </button>
                  </UTooltip>
                  <span class="mx-1 h-4 w-px bg-(--panel-border)" aria-hidden="true" />
                  <UTooltip :text="showList ? t('listen.hideList') : t('listen.showList')">
                    <button
                      type="button"
                      class="segment size-8 cursor-pointer px-0"
                      :aria-expanded="showList"
                      aria-controls="article-reader-sections"
                      :aria-label="t('listen.sections')"
                      @click="showList = !showList"
                    >
                      <UIcon name="i-heroicons-queue-list" class="w-3.5 h-3.5" />
                    </button>
                  </UTooltip>
                  <UTooltip :text="t('listen.close')">
                    <button
                      type="button"
                      class="icon-btn size-8 cursor-pointer"
                      :aria-label="t('listen.close')"
                      @click="close"
                    >
                      <UIcon name="i-heroicons-x-mark" class="w-4 h-4" aria-hidden="true" />
                    </button>
                  </UTooltip>
                </div>
              </div>

              <!-- The music's tick slider, counting sentences: a voice gives no reliable time,
                   so the ends show the section, out of how many -->
              <div class="mt-2 flex items-center gap-2">
                <span class="eyebrow w-8 text-right tabular-nums">
                  <UiRollingNumber :value="section + 1" />
                </span>
                <div
                  class="group/bar relative h-4 flex-1 cursor-pointer"
                  role="slider"
                  tabindex="0"
                  :aria-label="t('listen.progress')"
                  :aria-valuenow="index + 1"
                  :aria-valuemin="1"
                  :aria-valuemax="sentences.length"
                  :aria-valuetext="
                    t('listen.sentenceOf', { n: index + 1, total: sentences.length })
                  "
                  @click="seekAt"
                  @keydown.left.prevent="seek(index - 1)"
                  @keydown.right.prevent="seek(index + 1)"
                >
                  <div
                    class="ticks absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 bg-neutral-300 dark:bg-neutral-700"
                  >
                    <div
                      class="h-full bg-primary-500 transition-[width] duration-300"
                      :style="{ width: `${progress}%` }"
                    />
                  </div>
                  <div
                    class="absolute top-1/2 h-4 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-900 transition-[left] duration-300 dark:bg-white"
                    :style="{ left: `${progress}%` }"
                  />
                </div>
                <span class="eyebrow w-8 tabular-nums">{{ sections.length }}</span>
              </div>
            </div>
          </div>

          <!-- The sections, like the music's tracklist -->
          <UiExpand :open="showList">
            <div
              id="article-reader-sections"
              class="panel-card mt-1 max-h-56 overflow-y-auto p-1.5"
              :lang="lang"
            >
              <button
                v-for="(heading, s) in sections"
                :key="s"
                type="button"
                :aria-current="section === s ? 'true' : undefined"
                :class="
                  cn(
                    'row flex w-full items-center gap-3 px-2.5 py-2 text-left',
                    section === s && 'bg-primary-500/10 hover:bg-primary-500/15',
                  )
                "
                @click="seek(sectionStarts[s] ?? 0)"
              >
                <span
                  :class="
                    cn(
                      'eyebrow w-5 shrink-0 text-right tabular-nums',
                      section === s && 'text-(--accent-text)',
                    )
                  "
                >
                  <UIcon
                    v-if="section === s && playing"
                    name="i-heroicons-speaker-wave-16-solid"
                    class="size-3.5"
                    aria-hidden="true"
                  />
                  <template v-else>{{ String(s + 1).padStart(2, '0') }}</template>
                </span>
                <span
                  :class="
                    cn(
                      'min-w-0 flex-1 truncate text-sm',
                      section === s
                        ? 'text-(--accent-text)'
                        : 'text-neutral-900 dark:text-neutral-100',
                    )
                  "
                >
                  {{ heading }}
                </span>
              </button>
            </div>
          </UiExpand>
        </div>
      </section>
    </Transition>
  </Teleport>
</template>
