/**
 * Reduced motion: the system setting, or the site's own pause control (UiMotionToggle), which
 * puts `motion-paused` on <html> and keeps it in localStorage. Both stop the same things: every
 * consumer of this composable or of isMotionReduced(), and the CSS (accessibility.css). Moving
 * content must be stoppable from the page itself (RGAA 13.8, WCAG 2.2.2), not only from the OS.
 *
 * @example
 * const reducedMotion = useReducedMotion()
 * const duration = computed(() => (reducedMotion.value ? 0 : 500))
 */
export const MOTION_PAUSED_CLASS = 'motion-paused'
const MOTION_PAUSED_KEY = 'motion-paused'

// Client state, shared by every consumer (never set on the server)
const paused = ref(false)

/** Reduced motion right now, for code outside components (non reactive) */
export function isMotionReduced() {
  return (
    import.meta.client &&
    (document.documentElement.classList.contains(MOTION_PAUSED_CLASS) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  )
}

/** The pause control's state: read once from localStorage, then toggled by the button */
export function useMotionPause() {
  function set(value: boolean) {
    paused.value = value
    document.documentElement.classList.toggle(MOTION_PAUSED_CLASS, value)
    localStorage.setItem(MOTION_PAUSED_KEY, value ? '1' : '0')
  }
  if (import.meta.client && localStorage.getItem(MOTION_PAUSED_KEY) === '1' && !paused.value)
    set(true)
  return { paused: readonly(paused), toggle: () => set(!paused.value) }
}

export function useReducedMotion(): Ref<boolean> {
  const media = ref(false)

  // Only run on client side
  if (import.meta.client) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    media.value = mediaQuery.matches

    // Listen for changes
    const updateMotionPreference = (e: MediaQueryListEvent) => {
      media.value = e.matches
    }

    mediaQuery.addEventListener('change', updateMotionPreference)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', updateMotionPreference)
    })
  }

  return computed(() => media.value || paused.value) as Ref<boolean>
}
