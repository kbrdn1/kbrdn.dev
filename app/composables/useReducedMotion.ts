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

/** The pause control's state, toggled by the button and kept in localStorage */
export function useMotionPause() {
  function set(value: boolean) {
    paused.value = value
    document.documentElement.classList.toggle(MOTION_PAUSED_CLASS, value)
    localStorage.setItem(MOTION_PAUSED_KEY, value ? '1' : '0')
  }
  return { paused: readonly(paused), toggle: () => set(!paused.value) }
}

/**
 * The stored pause, on load (plugins/motion-pause): the CSS stops at once; the state that
 * templates read follows once the page is hydrated, so the first client render matches the
 * server's (a mismatched attribute is never fixed in production)
 */
export function restoreMotionPause(afterHydration: (done: () => void) => void) {
  if (localStorage.getItem(MOTION_PAUSED_KEY) !== '1') return
  document.documentElement.classList.add(MOTION_PAUSED_CLASS)
  afterHydration(() => (paused.value = true))
}

export function useReducedMotion(): Ref<boolean> {
  const media = ref(false)

  // Read once mounted, not during setup: the server knows nothing of it, and a hydrated
  // template must render what the server did
  if (import.meta.client) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Listen for changes
    const updateMotionPreference = (e: MediaQueryListEvent) => {
      media.value = e.matches
    }

    onMounted(() => {
      media.value = mediaQuery.matches
      mediaQuery.addEventListener('change', updateMotionPreference)
    })

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', updateMotionPreference)
    })
  }

  return computed(() => media.value || paused.value) as Ref<boolean>
}
