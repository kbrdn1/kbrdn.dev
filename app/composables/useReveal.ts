/**
 * Whether an element still waits to come in: true once mounted for an element below the
 * fold, false again when it is scrolled into view. What the server rendered on screen is
 * never hidden, so nothing blinks out before hydration, and reduced motion skips it all.
 *
 * Set the hidden state on the element that carries the glass, never on a wrapper: an
 * ancestor with opacity below 1 is a backdrop root, and the blur under it turns off.
 */
export function useReveal(el: Ref<HTMLElement | null | undefined>): Ref<boolean> {
  const hidden = ref(false)
  let observer: IntersectionObserver | undefined

  onMounted(() => {
    const target = el.value
    if (!target || isMotionReduced()) return
    let first = true
    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        // On screen or not, from the first observation: it comes after the navigation's scroll
        // (the router scrolls in the frame after the page is in, router.options), where a
        // measure at mount still had the old page's scroll, and let a new page's panels below
        // the fold show at once
        if (first) {
          first = false
          if (entry.boundingClientRect.top < window.innerHeight) observer?.disconnect()
          else hidden.value = true
          return
        }
        if (!entry.isIntersecting) return
        hidden.value = false
        observer?.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(target)
  })
  onBeforeUnmount(() => observer?.disconnect())

  return hidden
}
