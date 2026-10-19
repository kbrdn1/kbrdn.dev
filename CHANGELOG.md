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
- **Text links retype on hover**
  ([#73](https://github.com/kbrdn1/kbrdn.dev/issues/73)). After effect 1 of
  codrops' Line Text Hover Animations: a block cursor runs along the label as
  each character retypes through random glyphs, on hover or keyboard focus of
  the header and blog navigation (desktop), the footer lists and the projects'
  "view all".

- **A mascot**
  ([#74](https://github.com/kbrdn1/kbrdn.dev/issues/74)). A monkey in a
  backwards cap, in 31 moods, shows up where something did not go as planned:
  shocked on the 404 page, thinking when no blog post matches, sad when GitHub
  does not answer, clapping or nervous after sending the contact form, and
  quietly next to the copyright. Small and decorative, always next to text that
  already says what happened; 384px webp, 616 KB for the whole set.
- **An animated 404 page**
  ([#74](https://github.com/kbrdn1/kbrdn.dev/issues/74)). The "404" pixels
  arrive scattered and spring back into place, now and then one of them slips
  out of line, "Reset" replays the same return, the mascot floats and gets
  dizzy while you drag a pixel, the interactive dither field replaces the
  diagonal stripes and the subtitle retypes like the titles. Still under
  `prefers-reduced-motion`.

- **A journey page, `/experience`**
  ([#78](https://github.com/kbrdn1/kbrdn.dev/issues/78)). Laid out like an
  editorial spread (after isrod.eu): an intro, a strip of every role and
  degree, then one spread each, the story on the left and the stack and
  missions on the right, with "show more". Then the open source work, every
  item linked to its pull request or issue: the projects I maintain (gwm,
  vellum, LazyCurl, herdr-plugin-gwm, claude-crosstalk, kbrdn-docs), the
  contributions (winget, aqua-registry and awesome-ratatui merged, nixpkgs in
  review) and the bugs reported upstream. On the home page, the Parcours
  accordions give way to a one-line-per-role teaser linking to it.

### Changed

- **A new logo**
  ([#74](https://github.com/kbrdn1/kbrdn.dev/issues/74)). A K drawn from a
  rising bar and two orange pieces, redrawn as SVG on a 45° grid, replaces the
  bracket monogram everywhere: header, favicon (`.svg` that follows the system
  theme, all-orange `.ico` from 16 to 256 px), OG images and the README banner.
  The five colour variants are in `public/images/logo/`.
- **OG images in the site's current design**
  ([#74](https://github.com/kbrdn1/kbrdn.dev/issues/74)). `#121212`
  background, the dither field frozen at the top, a grid and column border
  fading out downwards instead of diagonal stripes, no separators, a green
  "open to opportunities" badge and the mascot as an unframed avatar. The
  blog's image now carries the same badge and avatar as the home page's.
- **The hero avatar is the GitHub one**
  ([#74](https://github.com/kbrdn1/kbrdn.dev/issues/74)): the mascot in its
  hoodie.
- **Pinned projects**
  ([#74](https://github.com/kbrdn1/kbrdn.dev/issues/74)). A "Featured
  projects" label repeated the section title right under it: gone. Each card
  now shows a GitHub mark, next to the site link when there is one; the whole
  card already opened the repository, nothing said so.

- **Titles retype on appearance and on hover**
  ([#73](https://github.com/kbrdn1/kbrdn.dev/issues/73)). After effect 4 of the
  same demo, in place of the left-to-right decode of 1.1.0: every character of
  a page or section title vanishes, then retypes left to right through a few
  random glyphs when the title first scrolls into view, and again on hover
  while a tinted block rises behind it. No GSAP: each glyph is drawn over its
  own transparent character, so nothing reflows; screen readers get the plain
  text, and nothing moves under `prefers-reduced-motion`.

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
