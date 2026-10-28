/**
 * Which menu the navbar's notch has open: a page of the site (its path), 'gwm' (the
 * announcement), or none. A nav item or the announcement opens it on hover (the keyboard
 * keeps plain links: on focus, each Tab would swap the menu before it could be reached); it
 * closes a moment after the pointer leaves the navbar and its notch (crossing from one to
 * the other keeps it open), when the focus leaves them, on Escape, and once one of their
 * links is clicked. From md, with a real pointer: under it, the navbar has its own menu.
 */
let closing: ReturnType<typeof setTimeout> | undefined
// Content shown on hover closes on Escape without moving the pointer (WCAG 1.4.13)
let opened: Ref<string | null> | undefined
function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && opened) opened.value = null
}
// Where the pointer was when a link closed it. Resting there, it does not open it again: the
// page's view transition, or the new layout's header, enters the item under it once more.
// Moving onto another item does. The pointer's position, not the click's: a link taken with
// Enter closes it as well.
let pointer = { x: 0, y: 0 }
let dismissedAt: typeof pointer | undefined
function track(event: MouseEvent) {
  pointer = { x: event.clientX, y: event.clientY }
}

export function useNavMenu() {
  const active = useState<string | null>('nav-menu', () => null)
  opened = active

  function open(key: string, event?: MouseEvent) {
    // A real pointer only: on a touch screen, a hover handler that changes the page makes
    // Safari swallow the tap, and the link takes two
    if (!window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches)
      return
    document.addEventListener('pointermove', track, { passive: true })
    if (event) track(event)
    if (dismissedAt && Math.hypot(pointer.x - dismissedAt.x, pointer.y - dismissedAt.y) < 4) return
    dismissedAt = undefined
    clearTimeout(closing)
    active.value = key
    document.addEventListener('keydown', onEscape)
  }
  function keep() {
    clearTimeout(closing)
  }
  function close(delay = 180) {
    clearTimeout(closing)
    closing = setTimeout(() => {
      active.value = null
      document.removeEventListener('keydown', onEscape)
    }, delay)
  }
  function dismiss() {
    dismissedAt = pointer
    close(0)
  }

  return { active, open, keep, close, dismiss }
}
