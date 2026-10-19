# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

This root file carries the current `[Unreleased]` section **only**. Every
released version lives in its own file under [`changelogs/`](changelogs/), and
every release candidate under
[`changelogs/pre-releases/`](changelogs/pre-releases/). Cutting a version
migrates `[Unreleased]` into that file and empties this one — see
[`docs/RELEASE.md`](docs/RELEASE.md).

## [Unreleased]

### Added

- **Four pixel shapes for the dither field**
  ([#72](https://github.com/kbrdn1/kbrdn.dev/issues/72)). Squares, circles,
  triangles or diamonds, after codrops' Bayer dithering demo: one shape is
  picked at random on each load and shared by every field of the page
  (background, footer, blog banners). Shapes other than squares need bigger
  cells; the noise and the pointer trail are sampled accordingly, so they keep
  their size on screen. Each shape covers about half a cell and the alpha
  ceiling stays at 18%, so text contrast is unchanged. Drawn in two canvas
  calls per frame whatever the cell count. `localStorage['dither-shape']` pins
  a shape.
- **Pixels that spread on hover**
  ([#72](https://github.com/kbrdn1/kbrdn.dev/issues/72)). After hexagoncircle's
  `<pixel-canvas>`: hovering or focusing a card (pinned projects, blog posts,
  the blog sidebar card) or an accordion header (experiences, studies) grows
  cells of the page's dither shape out from where the pointer came in, which
  shimmer, then shrink away on leave. Under the content, never in the way of a
  click; nothing on touch, a still frame under `prefers-reduced-motion`.

### Changed

- **The pointer ripples the background and leaves a trail of pixels**
  ([#72](https://github.com/kbrdn1/kbrdn.dev/issues/72)). After the
  CursorRipples filter of safzan.dev's hero, with its settings: a damped wave
  field splashed where the pointer moves, harder the faster it goes, displaces
  the dither pattern like water. Cells along the pointer's path light up
  gradually, filled in pixel by pixel by the Bayer matrix, and fade out in
  under a second. 60 fps while something moves, 24 at rest. Replaces 1.1.0's
  spring trail.

## Past releases

- [1.1.0](changelogs/1.1.0.md) — 2026-10-16
- [1.0.2](changelogs/1.0.2.md) — 2026-09-19
- [1.0.1](changelogs/1.0.1.md) — 2026-09-19
- [1.0.0](changelogs/1.0.0.md) — 2026-08-14
