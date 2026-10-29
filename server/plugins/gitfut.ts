// Kylian's gitfut card read once the server is up (server/api/gitfut.get.ts): gitfut takes
// seconds when cold, and the first visitor to hatch the hero's easter egg would wait on it.
// From then on the route's cache refreshes in the background. A failure is only logged. Not
// in the prerenderer that every build starts: only a server that serves needs it.
export default defineNitroPlugin((nitroApp) => {
  if (import.meta.prerender) return
  const timer = setTimeout(() => $fetch('/api/gitfut').catch(() => {}), 3000)
  nitroApp.hooks.hook('close', () => clearTimeout(timer))
})
