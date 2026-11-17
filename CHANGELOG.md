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

### Fixed

- **Google Analytics page views on client-side navigation.** GA's own
  history-based page view fired as the address changed, before Nuxt had
  rendered the next page: up to 7 s before on a first visit to `/blog`, which
  downloads the content database, so the page was counted under the previous
  page's title. The cookie plugin now sends the page view itself, once the new
  page and its title are on screen. A clicked row with no heading (the home's
  latest posts) is labelled with a space between its date and its title.

## Past releases

- [2.2.0](changelogs/2.2.0.md) · 2026-11-17
- [2.1.0](changelogs/2.1.0.md) · 2026-11-02
- [2.0.0](changelogs/2.0.0.md) · 2026-10-29
- [1.1.0](changelogs/1.1.0.md) · 2026-10-16
- [1.0.2](changelogs/1.0.2.md) · 2026-09-19
- [1.0.1](changelogs/1.0.1.md) · 2026-09-19
- [1.0.0](changelogs/1.0.0.md) · 2026-08-14
