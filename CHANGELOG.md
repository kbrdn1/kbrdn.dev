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
- **Lighter hover pixels on large cards**
  ([#153](https://github.com/kbrdn1/kbrdn.dev/issues/153)). A card on /apps
  holds about 17,000 cells, and each frame rebuilt a canvas path out of every
  one of them. They are now drawn by the GPU in a single call (WebGL2, one
  context shared by the whole page), with the same shapes, colours and
  animation. Drawing that card's cells takes 0.3 to 0.5 ms of script per frame
  instead of 1.6 to 3.7; on the page, hovering it with the circle shape costs
  about half the main-thread and GPU time it did. A browser without WebGL2
  (hardware acceleration turned off) still draws them the old way.
- **The deploy no longer depends on `ssh-keyscan`**
  ([#42](https://github.com/kbrdn1/kbrdn.dev/issues/42),
  [#163](https://github.com/kbrdn1/kbrdn.dev/issues/163)). The `Setup ssh`
  step of `deploy.yml` and `release.yml` fetched the VPS's host key at deploy
  time, and `ssh-keyscan`'s silent timeouts failed the v1.0.0 and v1.0.1
  releases with nothing to go on. The key is now pinned in the `VPS_HOST_KEY`
  secret, read on the VPS itself, and the deploy's `ssh` checks it strictly:
  one SSH connection per deploy instead of up to six. A missing or malformed
  secret, a changed host key or an unreachable VPS each fail with their reason
  in the log, the host, its resolved addresses and its key's fingerprint
  masked as `***`.

## Past releases

- [2.2.0](changelogs/2.2.0.md) · 2026-11-17
- [2.1.0](changelogs/2.1.0.md) · 2026-11-02
- [2.0.0](changelogs/2.0.0.md) · 2026-10-29
- [1.1.0](changelogs/1.1.0.md) · 2026-10-16
- [1.0.2](changelogs/1.0.2.md) · 2026-09-19
- [1.0.1](changelogs/1.0.1.md) · 2026-09-19
- [1.0.0](changelogs/1.0.0.md) · 2026-08-14
