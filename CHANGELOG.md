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

- **An animated pixel-dither background, interactive with the pointer**
  ([#51](https://github.com/kbrdn1/kbrdn.dev/issues/51)). Two scrolling noise
  layers, thresholded through a 4×4 Bayer matrix into a few alpha levels of the
  primary orange, drawn at cell resolution and upscaled with
  `image-rendering: pixelated`. On every page, a fixed band over the top 85% of
  the viewport fades out downwards, and the pointer leaves a trail that lights
  up and pushes the noise. The trail is squishy: it follows the pointer on a
  spring, so it lags, overshoots and wobbles before settling, and its brush
  stretches along the motion. The pattern is random on each load. The footer and
  the blog banners (article header and list thumbnails, on top of their image)
  carry the same field, animated but not interactive. Canvas 2D, no dependency:
  the noise is generated in a Web Worker, the colour follows the theme toggle,
  the animation pauses off screen and in hidden tabs, a single frozen frame is
  drawn under `prefers-reduced-motion`, and touch input leaves no trail. The
  densest level stays at 18% alpha: in dark, text that met the 4.5:1 contrast
  still does over it; in light, small grey labels drop to about 4.0:1 under
  the densest cells, a trade-off kept for a visible field.
- **A floating "Listening to" player**
  ([#54](https://github.com/kbrdn1/kbrdn.dev/issues/54)). The music player
  leaves the home page's About section for a button in the bottom-right corner
  of every page, which opens it in a bar fixed at the bottom. Mounted outside
  the layouts, so the music keeps playing from the home page to the blog; the
  playlist is only fetched on first open.
- **A decoding hero title**
  ([#53](https://github.com/kbrdn1/kbrdn.dev/issues/53)). On load, the name
  resolves left to right out of random glyphs; the server sends the plain
  text, screen readers get the real name, and `prefers-reduced-motion` keeps
  it still.

### Changed

- **The home page, reworked**
  ([#53](https://github.com/kbrdn1/kbrdn.dev/issues/53)). The skills tabs
  give way to a stack list (a column of categories, then each one's tools with
  their icon). The contact links (GitHub, Twitter, LinkedIn) move into the
  hero, next to "Book a call", in place of the "View on GitHub" and "Read the
  blog" buttons; the Contact section goes. The "Open to opportunities" badge
  turns green, the avatar loses its stripes and border, and the About text
  loses its em dashes.

- **A cleaner page frame**
  ([#51](https://github.com/kbrdn1/kbrdn.dev/issues/51)). Outside the 80rem
  column, a muted 24px grid and a border along the column, continuing the
  header's, fade out downwards; the column itself carries no grid. Drawn once
  by the layout instead of side zones repeated in every page (diagonal stripes
  on the home page, a full-height grid on the blog). The full-height borders
  around the column, the separators between sections and the corner triangles
  are gone; corners stay sharp. The dark background goes from
  `#1a1a1a` to `#121212`, and the footer gets an opaque background, with the
  blur over its content column.

## Past releases

- [1.0.2](changelogs/1.0.2.md) — 2026-09-19
- [1.0.1](changelogs/1.0.1.md) — 2026-09-19
- [1.0.0](changelogs/1.0.0.md) — 2026-08-14
