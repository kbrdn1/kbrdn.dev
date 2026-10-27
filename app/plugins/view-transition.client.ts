// A page that takes longer than the browser allows (a few seconds) makes its view
// transition give up: the page still shows, only the animation is skipped. Nuxt leaves
// that rejection unhandled, and it lands in the console as an error.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:view-transition:start', (transition) => {
    transition.ready.catch(() => {})
    transition.updateCallbackDone.catch(() => {})
  })
})
