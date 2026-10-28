// The pause control's stored choice, applied before the page mounts: nothing starts moving
// only to stop once the header's button loads
export default defineNuxtPlugin(() => {
  useMotionPause()
})
