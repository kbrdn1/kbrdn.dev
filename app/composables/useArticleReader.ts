/** Who is playing sound, the music (HomeNowPlaying) or the article reader: one at a time */
export const usePlaying = () => useState<'music' | 'speech' | null>('playing', () => null)

// What a listener needs: the text and its headings, not the code, the tables or the images
const BLOCKS = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,dt,dd'
const SKIP = 'pre,table,figure,img,svg,button,[aria-hidden="true"]'

/**
 * Reads the article aloud with the browser's own speech synthesis (Web Speech API, what
 * TTSReader runs on): free, no key, no server, in the best voice the browser has for the
 * article's language (pickVoice). Called by the article page, which hands it to both tables of
 * contents (BlogReader) and to the headings' buttons (BlogReaderHeadings).
 *
 * One utterance per sentence: it keeps Chrome's Google voices from stopping mid-article, and the
 * sentence is what the progress bar counts and seeks to. Pausing cancels and restarts the
 * sentence: speechSynthesis.pause() is unreliable on Chrome's network voices and on Android.
 *
 * Plain refs on purpose: a reactive() would proxy the heading elements (Teleport targets) and
 * the voice handed to the utterance.
 */
export function useArticleReader(title: () => string, lang: () => string) {
  const nowPlaying = usePlaying()

  // Filled once mounted (the server has no voices), then again on voiceschanged: Chrome lists
  // them asynchronously
  const voices = shallowRef<SpeechSynthesisVoice[]>([])
  const voice = computed(() => pickVoice(voices.value, lang()))
  function loadVoices() {
    voices.value = speechSynthesis.getVoices()
  }

  const sentences = shallowRef<{ text: string; section: number }[]>([])
  // The sections, as in the table of contents: the title, then each h1 to h3 by its heading's
  // id (the title has none)
  const sectionIds = shallowRef<string[]>([])

  function read() {
    const list = splitSentences(title(), lang()).map((text) => ({ text, section: 0 }))
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
        if (/^H[1-3]$/.test(el.tagName)) ids.push(el.id)
        for (const sentence of splitSentences(text, lang()))
          list.push({ text: sentence, section: ids.length - 1 })
      })
    sentences.value = list
    sectionIds.value = ids
  }

  const index = ref(0)
  const playing = ref(false)
  const total = computed(() => sentences.value.length)
  // Started and not back at the start: the progress bar shows from the first play to the end
  const started = computed(() => playing.value || index.value > 0)
  const progress = computed(() => (total.value ? (index.value / total.value) * 100 : 0))
  // The heading of the section being read ('' during the title)
  const sectionId = computed(
    () => sectionIds.value[sentences.value[index.value]?.section ?? 0] ?? '',
  )

  // The utterance being spoken: events from any other one (cancelled) are ignored. Holding it
  // also keeps it from being garbage-collected mid-sentence, which silences its onend
  let current: SpeechSynthesisUtterance | undefined

  // Safe without speech synthesis: the language can change on a browser that has none
  function halt() {
    current = undefined
    globalThis.speechSynthesis?.cancel()
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
      if (i + 1 < total.value) return speak(i + 1)
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
    if (!total.value) read()
    nowPlaying.value = 'speech'
    playing.value = true
    speak(index.value)
  }

  function pause() {
    halt()
    playing.value = false
  }

  function toggle() {
    if (playing.value) pause()
    else play()
  }

  function seek(i: number) {
    index.value = Math.max(0, Math.min(total.value - 1, i))
    if (playing.value) speak(index.value)
  }

  function playFrom(id: string) {
    if (!total.value) read()
    const s = sectionIds.value.indexOf(id)
    if (s < 0) return
    index.value = sentences.value.findIndex((x) => x.section === s)
    play()
  }

  // The article's headings, each given a button that reads from it (BlogReaderHeadings). Found
  // once mounted, to be teleported into: Nuxt UI renders them, and overriding its ProseH2/H3
  // would lose their style and anchor
  const headings = shallowRef<HTMLElement[]>([])
  function findHeadings() {
    headings.value = [...document.querySelectorAll<HTMLElement>('.prose-blog :is(h1,h2,h3)[id]')]
  }

  // The music starting stops the reading; the article changing language starts it over, on
  // its new headings
  watch(nowPlaying, (value) => {
    if (value === 'music' && playing.value) pause()
  })
  watch(lang, () => {
    pause()
    sentences.value = []
    index.value = 0
    nextTick(findHeadings)
  })

  onMounted(() => {
    if (!('speechSynthesis' in window)) return
    findHeadings()
    loadVoices()
    speechSynthesis.addEventListener('voiceschanged', loadVoices)
  })

  // Leaving the article: speechSynthesis is global, it would go on reading with no player left
  onBeforeUnmount(() => {
    if (!('speechSynthesis' in window)) return
    halt()
    speechSynthesis.removeEventListener('voiceschanged', loadVoices)
  })

  return {
    voiceName: computed(() => voice.value?.name),
    playing,
    started,
    index,
    total,
    progress,
    sectionId,
    headings,
    toggle,
    seek,
    playFrom,
  }
}

export type ArticleReader = ReturnType<typeof useArticleReader>
