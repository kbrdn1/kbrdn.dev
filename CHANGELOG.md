# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This root file carries the current `[Unreleased]` section **only**. Every
released version lives in its own file under [`changelogs/`](changelogs/), and
every release candidate under
[`changelogs/pre-releases/`](changelogs/pre-releases/). Cutting a version
migrates `[Unreleased]` into that file and empties this one, see
[`docs/RELEASE.md`](docs/RELEASE.md).

## [Unreleased]

### Added

- **A Cloudflare Turnstile check on the contact form**
  ([#143](https://github.com/kbrdn1/kbrdn.dev/issues/143)). Bots were posting to
  `/api/contact` directly. The form now carries a Turnstile widget (theme and
  language follow the site's), and the server checks its token with Cloudflare
  before anything is sent: no token or an invalid one, the message is refused.
  The token is single-use, so the widget resets after every attempt.
- **gwm-gpui on /apps** ([#149](https://github.com/kbrdn1/kbrdn.dev/issues/149)).
  The native desktop app for gwm, built on GPUI, gets its panel next to gwm's,
  tagged "In development" like vellum: what it does, from its README, and a
  link to its repository. The notch's /apps menu links to it, and its latest
  release is read with the others', so its version shows once one ships. The
  page's SEO description no longer calls the apps "terminal apps".
- **Cookie banner, Google Analytics 4 and a terms of use page**
  ([#147](https://github.com/kbrdn1/kbrdn.dev/issues/147)). A
  [CookieConsent](https://cookieconsent.orestbida.com) banner dressed as the
  site's panels (light, dark and blur) asks before any audience measurement:
  gtag.js is only downloaded once a reader accepts, and withdrawing (the
  "Cookies" button in the footer) erases the `_ga` cookies. Behind it, GA4
  counts page views, clicks on links and buttons with where they sit
  (`ui_click`), articles read to the end (`article_read`), sent contact
  messages (`generate_lead`) and the hero's easter egg. Prod only, through the
  `GA_ID` repository variable: without it, no banner and no Google at all. The
  new `/cgu` (`/en/terms`) page holds the legal notice, the terms of use,
  personal data and the cookies, linked from the footer and the banner.

### Security

- **Dependencies updated, 120 known vulnerabilities down to 7**
  ([#145](https://github.com/kbrdn1/kbrdn.dev/issues/145)). Every dependency
  moved to its latest version within its declared range (Nuxt 4.6.4, Vue
  3.5.45, Nuxt UI 4.12.2, vue-router 5.5.1…), which clears the critical `tar`
  advisory and the high ones on the server path (`h3`, `defu`,
  `@vue/server-renderer`, `ws`). The seven left have no fix within those
  ranges: `sharp` 0.34 only comes with the disabled `nuxt-studio`, `zod` 3 is
  required by Nuxt Content, the rest is build tooling or waits on a major
  (`satori`).

## Past releases

- [2.1.0](changelogs/2.1.0.md) · 2026-11-02
- [2.0.0](changelogs/2.0.0.md) · 2026-10-29
- [1.1.0](changelogs/1.1.0.md) · 2026-10-16
- [1.0.2](changelogs/1.0.2.md) · 2026-09-19
- [1.0.1](changelogs/1.0.1.md) · 2026-09-19
- [1.0.0](changelogs/1.0.0.md) · 2026-08-14
