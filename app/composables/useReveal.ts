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
    if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (target.getBoundingClientRect().top < window.innerHeight) return
    hidden.value = true
    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
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
