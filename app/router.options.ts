import type { RouterConfig } from '@nuxt/schema'
import { START_LOCATION } from 'vue-router'

// An anchor lands under the floating navbar and its notch (they end at 90px)
const TOP = 112

// Smooth, unless the reader asked for less motion
const behavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // Nuxt hands the first client navigation over with START_LOCATION as `from`, whose path
    // is '/' whatever page the reader was on: the real one is in the history entry vue-router
    // has just written (`back`)
    const fromPath =
      from === START_LOCATION
        ? (window.history.state?.back as string | null | undefined)?.split(/[?#]/)[0]
        : from.path
    // An anchor on the same page glides there
    if (to.path === fromPath) {
      return to.hash ? { el: to.hash, top: TOP, behavior: behavior() } : false
    }
    // Another page jumps, once rendered, like Nuxt's default: smooth, it would roll the old
    // page before it leaves, or the new one under the view transition. Said explicitly:
    // html's scroll-behavior is smooth (main.css) and would apply otherwise
    const position = {
      ...(savedPosition ?? (to.hash ? { el: to.hash, top: TOP } : { top: 0 })),
      behavior: 'instant' as const,
    }
    const nuxtApp = useNuxtApp()
    return new Promise((resolve) =>
      nuxtApp.hooks.hookOnce('page:loading:end', () => {
        requestAnimationFrame(() => resolve(position))
      }),
    )
  },
}
