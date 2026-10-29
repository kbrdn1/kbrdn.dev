// Kylian's gitfut card read once the server is up (server/api/gitfut.get.ts): gitfut takes
// seconds when cold, and the first visitor to hatch the hero's easter egg would wait on it.
// From then on the route's cache refreshes in the background. A failure is only logged.
export default defineNitroPlugin(() => {
  setTimeout(() => $fetch('/api/gitfut').catch(() => {}), 3000)
})
