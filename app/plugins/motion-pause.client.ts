// The pause control's stored choice: the CSS stops before the page shows, the components
// follow once it is hydrated
export default defineNuxtPlugin((nuxtApp) => {
  // Once: the hook fires on every navigation, and would pause again what the reader resumed
  restoreMotionPause((done) => nuxtApp.hooks.hookOnce('app:suspense:resolve', done))
})
