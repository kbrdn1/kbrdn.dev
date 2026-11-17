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
- **A homepage and a privacy policy for Accueil TV Kylian, unlisted**
  ([#150](https://github.com/kbrdn1/kbrdn.dev/issues/150)). The Google OAuth
  consent screen of my LG TV's home screen pointed at the site's root.
  `/apps/tv-kylian` now says what the app is and what it shows, and
  `/apps/tv-kylian/confidentialite` (`/en/apps/tv-kylian/privacy`) what Google
  and other data it reads, where it keeps it, the Limited Use statement and how
  to revoke its access. Nothing on the site links to them and the sitemap leaves
  them out; both carry a `noindex, nofollow` robots meta and `X-Robots-Tag`
  header, and robots.txt does not disallow them, so a crawler can still read
  that noindex.

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
