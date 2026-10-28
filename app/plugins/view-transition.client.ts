// A page that takes longer than the browser allows (a few seconds) makes its view
// transition give up: the page still shows, only the animation is skipped. Nuxt leaves
// that rejection unhandled, and it lands in the console as an error.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:view-transition:start', (transition) => {
    // The site's pause control counts as reduced motion, like the system setting
    if (isMotionReduced()) transition.skipTransition()
    transition.ready.catch(() => {})
    transition.updateCallbackDone.catch(() => {})
  })
})
