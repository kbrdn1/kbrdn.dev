import type { RouterConfig } from '@nuxt/schema'

// Smooth, unless the reader asked for less motion; an anchor lands under the floating
// navbar and its notch (they end at 90px)
const behavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

export default <RouterConfig>{
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, top: 112, behavior: behavior() }
    }
    return { top: 0, behavior: behavior() }
  },
}
