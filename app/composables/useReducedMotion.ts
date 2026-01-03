/**
 * Composable to detect user's reduced motion preference
 *
 * @returns {Ref<boolean>} Whether the user prefers reduced motion
 *
 * @example
 * const prefersReducedMotion = useReducedMotion()
 *
 * // Use in computed styles
 * const duration = computed(() => prefersReducedMotion.value ? 0 : 500)
 */
export function useReducedMotion(): Ref<boolean> {
  const prefersReducedMotion = ref(false)

  // Only run on client side
  if (import.meta.client) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes
    const updateMotionPreference = (e: MediaQueryListEvent) => {
      prefersReducedMotion.value = e.matches
    }

    mediaQuery.addEventListener('change', updateMotionPreference)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', updateMotionPreference)
    })
  }

  return prefersReducedMotion
}
