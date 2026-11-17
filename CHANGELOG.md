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

- **Lighter hover pixels on large cards**
  ([#153](https://github.com/kbrdn1/kbrdn.dev/issues/153)). A card on /apps
  holds about 17,000 cells, and each frame rebuilt a canvas path out of every
  one of them. They are now drawn by the GPU in a single call (WebGL2, one
  context shared by the whole page), with the same shapes, colours and
  animation. Drawing that card's cells takes 0.3 to 0.5 ms of script per frame
  instead of 1.6 to 3.7; on the page, hovering it with the circle shape costs
  about half the main-thread and GPU time it did. A browser without WebGL2
  (hardware acceleration turned off) still draws them the old way.

## Past releases

- [2.2.0](changelogs/2.2.0.md) · 2026-11-17
- [2.1.0](changelogs/2.1.0.md) · 2026-11-02
- [2.0.0](changelogs/2.0.0.md) · 2026-10-29
- [1.1.0](changelogs/1.1.0.md) · 2026-10-16
- [1.0.2](changelogs/1.0.2.md) · 2026-09-19
- [1.0.1](changelogs/1.0.1.md) · 2026-09-19
- [1.0.0](changelogs/1.0.0.md) · 2026-08-14
