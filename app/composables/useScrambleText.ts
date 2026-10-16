// Glyphs a character cycles through before it settles.
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789-_/\\[]{}=+*^?#'
// Reveal: 400 ms + 110 ms per character, capped so long titles do not drag on.
const BASE_MS = 400
const PER_CHAR_MS = 110
const MAX_MS = 2400
// How long a random glyph holds before it changes.
const GLYPH_MS = 70

/**
 * Text that resolves left to right out of random glyphs once mounted, like the title on
 * safzan.dev, and again whenever the source text changes (a locale switch). The server,
 * and visitors who prefer reduced motion, get the plain text.
 *
 * @example
 * const title = useScrambleText(() => t('blog.title'))
 */
export function useScrambleText(text: MaybeRefOrGetter<string>): Ref<string> {
  const value = ref(toValue(text))
  const reducedMotion = useReducedMotion()
  let frame = 0

  function play(source: string) {
    cancelAnimationFrame(frame)
    value.value = source
    if (import.meta.server || reducedMotion.value) return
    const chars = Array.from(source)
    const total = Math.min(MAX_MS, BASE_MS + PER_CHAR_MS * chars.length)
    const msPerChar = total / Math.max(1, chars.length)
    let start: number | undefined
    let lastSwap = -Infinity
    let lastSettled = -1
    const tick = (now: number) => {
      start ??= now
      const settled = Math.floor((now - start) / msPerChar)
      if (settled !== lastSettled || now - lastSwap >= GLYPH_MS) {
        lastSwap = now
        lastSettled = settled
        value.value = chars
          .map((char, i) =>
            char === ' ' || i < settled
              ? char
              : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)),
          )
          .join('')
      }
      if (settled < chars.length) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }

  onMounted(() => play(toValue(text)))
  watch(() => toValue(text), play)
  onUnmounted(() => cancelAnimationFrame(frame))

  return value
}
