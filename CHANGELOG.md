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

- **The first client-side navigation to a content page**
  ([#160](https://github.com/kbrdn1/kbrdn.dev/issues/160)). It loads Nuxt
  Content's database in the browser, 2.6 to 7 s cold in prod, and the screen
  stayed frozen on an emptied page meanwhile: the view transition held the
  paint until the new page was ready, until Chrome gave up after 4 s. A view
  transition still waiting after 600 ms is now dropped, and a thin bar in the
  site's orange runs along the top (`NuxtLoadingIndicator`). Warm navigations,
  130 to 480 ms, keep their transition. The database dumps are served
  `immutable` (their address carries the content's checksum), and a
  Cloudflare Cache Rule lets the edge keep them and the wasm
  (`docs/CONFIGURATION.md`).

## Past releases

- [2.2.0](changelogs/2.2.0.md) · 2026-11-17
- [2.1.0](changelogs/2.1.0.md) · 2026-11-02
- [2.0.0](changelogs/2.0.0.md) · 2026-10-29
- [1.1.0](changelogs/1.1.0.md) · 2026-10-16
- [1.0.2](changelogs/1.0.2.md) · 2026-09-19
- [1.0.1](changelogs/1.0.1.md) · 2026-09-19
- [1.0.0](changelogs/1.0.0.md) · 2026-08-14
