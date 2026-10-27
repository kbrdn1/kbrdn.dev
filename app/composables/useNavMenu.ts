/**
 * Which menu the navbar's notch has open: a page of the site (its path), 'gwm' (the
 * announcement), or none. A nav item or the announcement opens it on hover or focus; it
 * closes a moment after the pointer leaves the navbar and its notch, so crossing from one
 * to the other keeps it open. From md only: under it, the navbar has its own menu.
 */
let closing: ReturnType<typeof setTimeout> | undefined

export function useNavMenu() {
  const active = useState<string | null>('nav-menu', () => null)

  function open(key: string) {
    if (!window.matchMedia('(min-width: 768px)').matches) return
    clearTimeout(closing)
    active.value = key
  }
  function keep() {
    clearTimeout(closing)
  }
  function close(delay = 180) {
    clearTimeout(closing)
    closing = setTimeout(() => (active.value = null), delay)
  }

  return { active, open, keep, close }
}
