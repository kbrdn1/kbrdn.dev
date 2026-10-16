// Glyphs a character cycles through before it settles.
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789-_/\\[]{}=+*^?#'

/**
 * Text that resolves left to right out of random glyphs once mounted, like the title on
 * safzan.dev. The server, and visitors who prefer reduced motion, get the plain text.
 *
 * @example
 * const title = useScrambleText('Kylian Bardini')
 */
export function useScrambleText(text: string): Ref<string> {
  const value = ref(text)
  const reducedMotion = useReducedMotion()
  let frame = 0

  onMounted(() => {
    if (reducedMotion.value) return
    const chars = Array.from(text)
    // Whole reveal lasts 240 ms + 60 ms per character.
    const msPerChar = (240 + 60 * chars.length) / Math.max(1, chars.length)
    let start: number | undefined
    const tick = (now: number) => {
      start ??= now
      const settled = Math.floor((now - start) / msPerChar)
      value.value = chars
        .map((char, i) =>
          char === ' ' || i < settled
            ? char
            : GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)),
        )
        .join('')
      if (settled < chars.length) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  })

  onUnmounted(() => cancelAnimationFrame(frame))

  return value
}
