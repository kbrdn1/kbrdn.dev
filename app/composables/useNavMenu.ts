/**
 * Which menu the navbar's notch has open: a page of the site (its path), 'gwm' (the
 * announcement), or none. A nav item or the announcement opens it on hover (the keyboard
 * keeps plain links: on focus, each Tab would swap the menu before it could be reached); it
 * closes a moment after the pointer leaves the navbar and its notch (crossing from one to
 * the other keeps it open), when the focus leaves them, and on Escape. From md, with a
 * real pointer: under it, the navbar has its own menu.
 */
let closing: ReturnType<typeof setTimeout> | undefined
// Content shown on hover closes on Escape without moving the pointer (WCAG 1.4.13)
let opened: Ref<string | null> | undefined
function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && opened) opened.value = null
}

export function useNavMenu() {
  const active = useState<string | null>('nav-menu', () => null)
  opened = active

  function open(key: string) {
    // A real pointer only: on a touch screen, a hover handler that changes the page makes
    // Safari swallow the tap, and the link takes two
    if (!window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches)
      return
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

  return { active, open, keep, close }
}
