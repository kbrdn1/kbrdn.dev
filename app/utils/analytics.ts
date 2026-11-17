// Google Analytics 4, behind the cookie banner (plugins/cookie-consent.client.ts): window.gtag
// only exists once the reader has accepted, so an event sent before that goes nowhere.
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function trackEvent(name: string, params?: Record<string, string | number | undefined>) {
  window.gtag?.('event', name, params)
}
