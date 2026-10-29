// Codrops' Line Text Hover Animations (github.com/codrops/LineTextHoverAnimations), without
// GSAP: every character vanishes, then retypes left to right through a few random glyphs
// before settling on itself.
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz!@#$%^&*-_+=;:<>,'

// Per effect, after the demo's tweens: delay between characters, glyph swaps, how long
// each glyph holds, and the pause before the real character comes back. The stagger is
// capped so a long title retypes in about 1.2 s.
const EFFECTS = {
  // V4, titles
  title: { stagger: 60, swaps: 3, hold: 80, settle: 100, budget: 1200 },
  // V1, links: a square cursor sits on the character for its first swap
  link: { stagger: 70, swaps: 4, hold: 70, settle: 30, budget: 900 },
} as const

export type ScrambleEffect = keyof typeof EFFECTS

export interface ScrambleChar {
  char: string
  /** Glyph drawn over the (then invisible) character, or null when it shows itself. */
  glyph: string | null
  hidden: boolean
  cursor: boolean
}

const settled = (char: string): ScrambleChar => ({
  char,
  glyph: null,
  hidden: false,
  cursor: false,
})

/**
 * Characters of `text` and a `play()` that retypes them. The server, and visitors who
 * prefer reduced motion, only ever get the settled text; a new `text` (a locale switch)
 * resets it.
 */
export function useScrambleText(text: MaybeRefOrGetter<string>, effect: ScrambleEffect) {
  const chars = ref<ScrambleChar[]>(Array.from(toValue(text), settled))
  const reducedMotion = useReducedMotion()
  let frame = 0

  function play() {
    cancelAnimationFrame(frame)
    if (import.meta.server || reducedMotion.value) return
    const { stagger, swaps, hold, settle, budget } = EFFECTS[effect]
    const list = chars.value
    const step = Math.min(stagger, budget / Math.max(1, list.length))
    const slots = new Int32Array(list.length).fill(-1)
    let start: number | undefined
    const tick = (now: number) => {
      start ??= now
      const elapsed = now - start
      let busy = false
      list.forEach((c, i) => {
        if (c.char === ' ') return
        const t = elapsed - (i + 1) * step
        if (t >= swaps * hold + settle) {
          if (c.glyph || c.hidden || c.cursor) Object.assign(c, settled(c.char))
          return
        }
        busy = true
        if (t < 0) {
          c.hidden = true
          return
        }
        const slot = Math.min(swaps - 1, Math.floor(t / hold))
        if (slot !== slots[i]) {
          slots[i] = slot
          c.glyph = GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length))
          c.hidden = false
          c.cursor = effect === 'link' && slot === 0
        }
      })
      frame = busy ? requestAnimationFrame(tick) : 0
    }
    frame = requestAnimationFrame(tick)
  }

  watch(
    () => toValue(text),
    (next) => {
      cancelAnimationFrame(frame)
      chars.value = Array.from(next, settled)
    },
  )
  onUnmounted(() => cancelAnimationFrame(frame))

  return { chars, play }
}
