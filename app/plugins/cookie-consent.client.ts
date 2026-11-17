// The cookie banner (CookieConsent) and Google Analytics 4 behind it, only where a measurement
// ID is set (runtimeConfig.public.gaId: the prod build). Consent mode "basic": gtag.js is not
// even downloaded before the reader accepts, so nothing reaches Google until then, not even
// the cookieless pings of the advanced mode. Withdrawing erases the _ga cookies and reloads the
// page, the only way to unload gtag. Page views are GA's own: the initial one from `config`,
// the next ones from enhanced measurement, which follows the router's history changes.
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
    window.gtag('config', id, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      // 13 months, the CNIL's ceiling for an audience cookie (GA's default is 2 years), and
      // not pushed back on each visit, which the CNIL rules out too
      cookie_expires: 13 * 30 * 24 * 60 * 60,
      cookie_update: false,
    })
    cc.loadScript(`https://www.googletagmanager.com/gtag/js?id=${id}`)
  }

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
    const sync = () => {
      if (cc.acceptedCategory('analytics')) loadGtag(cc)
      // Off until the reload autoClear asks for
      else (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = true
    }
    const config: CookieConsentConfig = {
      guiOptions: {
        // Bottom left: the music player's button holds the bottom right corner
        consentModal: { layout: 'box inline', position: 'bottom left', equalWeightButtons: true },
        preferencesModal: { layout: 'box', equalWeightButtons: true },
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        analytics: { autoClear: { cookies: [{ name: /^_ga/ }], reloadPage: true } },
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
