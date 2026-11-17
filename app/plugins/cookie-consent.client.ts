// The cookie banner (CookieConsent) and Google Analytics 4 behind it, only where a measurement
// ID is set (runtimeConfig.public.gaId: the prod build). Consent mode "basic": gtag.js is not
// even downloaded before the reader accepts, so nothing reaches Google until then, not even
// the cookieless pings of the advanced mode. Withdrawing turns gtag off, erases the _ga cookies
// and reloads the page, the only way to unload gtag. The landing page view is the tag's own;
// the next ones are sent here (pageView).
//
// The tag's settings live in GA, not here: the Google tag ignores an on-page `config` that
// repeats its own (ignoreDupeGtagConfigCalls), parameters included. So its cookies (13 months
// from the first visit, the CNIL's ceiling), Google signals (off) and the history-based page
// views (off) are set in the stream's tag settings, and the `config` below stays bare.
import type { CookieConsentConfig, Translation } from 'vanilla-cookieconsent'

export default defineNuxtPlugin((nuxtApp) => {
  const id = useRuntimeConfig().public.gaId
  if (!id) return
  const { t, locale } = nuxtApp.$i18n
  const legal = () => nuxtApp.$localePath({ name: 'cgu' })

  // Built when the language is applied, so `t` reads the messages of the locale just loaded
  // The banner stays small: two equal buttons, no "choose" one (a single optional category,
  // accept or decline says it all); the details are in the preferences, reached from the
  // footer's "Cookies" button
  const translation = (): Translation => ({
    consentModal: {
      title: t('cookies.title'),
      description: `${t('cookies.description')} <a href="${legal()}">${t('cookies.learnMore')}</a>`,
      acceptAllBtn: t('cookies.accept'),
      acceptNecessaryBtn: t('cookies.reject'),
    },
    preferencesModal: {
      title: t('cookies.preferences'),
      acceptAllBtn: t('cookies.accept'),
      acceptNecessaryBtn: t('cookies.reject'),
      savePreferencesBtn: t('cookies.save'),
      closeIconLabel: t('cookies.close'),
      sections: [
        { description: t('cookies.intro') },
        {
          title: t('cookies.necessary.title'),
          description: t('cookies.necessary.description'),
          linkedCategory: 'necessary',
        },
        {
          title: t('cookies.analytics.title'),
          description: t('cookies.analytics.description'),
          linkedCategory: 'analytics',
        },
        {
          title: t('cookies.more.title'),
          description: `${t('cookies.more.description')} <a href="${legal()}">${t('cookies.terms')}</a>`,
        },
      ],
    },
  })

  // The address of the last page counted, the referrer of the next one
  let lastPage = ''

  function loadGtag(cc: typeof import('vanilla-cookieconsent')) {
    const w = window as unknown as Record<string, unknown>
    w[`ga-disable-${id}`] = false
    if (window.gtag) return
    window.dataLayer = window.dataLayer || []
    // gtag.js reads the arguments object itself, not an array
    window.gtag = function () {
      // oxlint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
    window.gtag('js', new Date())
    window.gtag('config', id)
    cc.loadScript(`https://www.googletagmanager.com/gtag/js?id=${id}`)
    // The tag counts the page it loads on
    lastPage = location.href
  }

  // A page view once the next page is on screen, with its title. GA's own history-based one
  // fires on pushState, which Nuxt does before that page has loaded: up to 7 s before on a
  // first visit to /blog, which downloads the content database, so it got the previous title
  function pageView() {
    if (!window.gtag || location.href === lastPage) return
    window.gtag('event', 'page_view', {
      page_location: location.href,
      page_referrer: lastPage || document.referrer,
      page_title: document.title,
    })
    lastPage = location.href
  }
  // The new page's head is written after page:finish, on unhead's next render (a timeout):
  // the page view goes with that render
  let pagePending = false
  nuxtApp.hook('page:finish', () => {
    pagePending = true
  })
  // The client head always has hooks; the type is the shared one, as in Nuxt's own head plugin
  injectHead().hooks?.hook('dom:rendered', () => {
    if (!pagePending) return
    pagePending = false
    pageView()
  })

  // Where readers click: every link and button, named by its label and placed by the nearest
  // section with an id, else its landmark. The banner's own buttons are not counted
  function onClick(event: MouseEvent) {
    const el = (event.target as Element | null)?.closest?.('a, button')
    if (!el || el.closest('#cc-main')) return
    const area = el.parentElement?.closest(
      'section[id], header, nav, footer, aside, main, [role="dialog"]',
    )
    // Its name as read out: the aria-label, else its text without the decorative copies
    // (UiScrambleText draws its letters again, aria-hidden); a card, its title alone
    const text = el.cloneNode(true) as Element
    text.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove())
    const title = text.querySelector('h1, h2, h3, h4')
    trackEvent('ui_click', {
      label: (el.getAttribute('aria-label') || (title ?? text).textContent || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100),
      area: area ? area.id || area.getAttribute('role') || area.tagName.toLowerCase() : 'page',
      link_url: el instanceof HTMLAnchorElement ? el.href : undefined,
    })
  }

  // After the page has settled: the banner is no reason to hold its first paint
  onNuxtReady(async () => {
    const [cc] = await Promise.all([
      import('vanilla-cookieconsent'),
      import('~/assets/css/cookie-consent.css'),
    ])
    const w = window as unknown as Record<string, unknown>
    // The site's other open pages (tabs, windows side by side) hear a withdrawal at once
    const channel = new BroadcastChannel('cookie-consent')
    // Withdrawing with gtag loaded: off first, then the cookies, then the reload. In the other
    // order a hit in between (the reload's own, on pagehide) writes _ga back right after
    // autoClear erased it.
    // ponytail: until the reload commits, a loaded gtag can still send a ping (no cookie, no
    // client id: storage is denied); ga-disable set after load does not stop it. Blocking
    // Google's requests in that window means patching sendBeacon and fetch, if it ever matters
    const withdraw = () => {
      w[`ga-disable-${id}`] = true
      window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
      cc.eraseCookies(/^_ga/)
      channel.postMessage('withdrawn')
      location.reload()
    }
    const sync = () => {
      if (cc.acceptedCategory('analytics')) loadGtag(cc)
      else if (window.gtag) withdraw()
      else {
        w[`ga-disable-${id}`] = true
        // Refused here without gtag (a banner older than an "accept" given elsewhere): the
        // pages that did load it still have to hear it
        channel.postMessage('withdrawn')
      }
    }
    // A withdrawal made elsewhere, confirmed by the saved cookie (getCookie reads it again):
    // on the channel's message, and for the pages it cannot reach, when a frozen tab comes
    // back and when the back-forward cache restores the page (it runs nothing else)
    const recheck = () => {
      if (window.gtag && !cc.getCookie('categories')?.includes('analytics')) withdraw()
    }
    channel.onmessage = recheck
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') recheck()
    })
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) recheck()
    })
    const config: CookieConsentConfig = {
      guiOptions: {
        // Bottom left: the music player's button holds the bottom right corner
        consentModal: { layout: 'box inline', position: 'bottom left', equalWeightButtons: true },
        preferencesModal: { layout: 'box', equalWeightButtons: true },
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        // No reload from autoClear: withdraw() reloads, once gtag is off
        analytics: { autoClear: { cookies: [{ name: /^_ga/ }] } },
      },
      language: {
        default: locale.value,
        translations: { fr: translation, en: translation },
      },
      onConsent: sync,
      onChange: sync,
    }
    await cc.run(config)
    nuxtApp.hook('i18n:localeSwitched', ({ newLocale }) => {
      cc.setLanguage(newLocale)
    })
    document.addEventListener('click', onClick, { capture: true })
  })
})
