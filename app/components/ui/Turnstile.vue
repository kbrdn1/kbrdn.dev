<script setup lang="ts">
// Cloudflare Turnstile: v-model carries the token, checked by the server (/api/contact).
// Rendered explicitly: the form sits in a <ClientOnly> and /contact is reached by client
// navigation too, where the script's implicit scan of the page would have run already.
// A token is single-use: the parent calls reset() after every submit.
import { useI18n } from '#imports'

interface Turnstile {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}
type WithTurnstile = Window & { turnstile?: Turnstile }

const token = defineModel<string>({ default: '' })
const { turnstileSiteKey } = useRuntimeConfig().public
const { locale } = useI18n()
const colorMode = useColorMode()
const el = ref<HTMLElement>()
let widgetId: string | undefined

function loadScript() {
  const w = window as WithTurnstile
  if (w.turnstile) return Promise.resolve(w.turnstile)
  return new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => resolve(w.turnstile!)
    script.onerror = reject
    document.head.append(script)
  })
}

function render(turnstile: Turnstile) {
  if (!el.value) return
  if (widgetId) turnstile.remove(widgetId)
  token.value = ''
  widgetId = turnstile.render(el.value, {
    sitekey: turnstileSiteKey,
    theme: isDarkMode(colorMode.value) ? 'dark' : 'light',
    language: locale.value,
    size: 'flexible',
    callback: (value: string) => (token.value = value),
    'expired-callback': () => (token.value = ''),
    'error-callback': () => {
      token.value = ''
    },
  })
}

// Blocked script (an ad blocker) or no site key: no token, and the server turns the message
// down, which the form reports
onMounted(() => {
  if (!turnstileSiteKey) return
  loadScript().then(render, () => console.error('Turnstile script failed to load'))
})

// The widget's theme and language are set at render: draw it again when either changes
watch([() => colorMode.value, locale], () => {
  const turnstile = (window as WithTurnstile).turnstile
  if (turnstile && widgetId) render(turnstile)
})

onBeforeUnmount(() => {
  if (widgetId) (window as WithTurnstile).turnstile?.remove(widgetId)
})

defineExpose({
  reset() {
    token.value = ''
    if (widgetId) (window as WithTurnstile).turnstile?.reset(widgetId)
  },
})
</script>

<template>
  <div ref="el" />
</template>
