import type { RouterConfig } from '@nuxt/schema'
import { START_LOCATION } from 'vue-router'

// An anchor lands under the floating navbar and its notch (they end at 90px)
const TOP = 112

// Smooth, unless the reader asked for less motion
const behavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // An anchor on the same page glides there
    if (to.path === from.path) {
      return to.hash ? { el: to.hash, top: TOP, behavior: behavior() } : false
    }
    // Another page jumps, once rendered, like Nuxt's default: smooth, it would roll the old
    // page before it leaves, or the new one under the view transition. Said explicitly:
    // html's scroll-behavior is smooth (main.css) and would apply otherwise
    const position = {
      ...(savedPosition ?? (to.hash ? { el: to.hash, top: TOP } : { top: 0 })),
      behavior: 'instant' as const,
    }
    if (from === START_LOCATION) return position
    const nuxtApp = useNuxtApp()
    return new Promise((resolve) =>
      nuxtApp.hooks.hookOnce('page:loading:end', () => {
        requestAnimationFrame(() => resolve(position))
      }),
    )
  },
}
