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
  of every page, which opens it floating at the bottom, centred and as wide as the content
  (Escape closes it). Mounted outside
  the layouts, so the music keeps playing from the home page to the blog; the
  playlist is only fetched on first open.
- **Decoding page titles**
  ([#53](https://github.com/kbrdn1/kbrdn.dev/issues/53)). On load, the main title of
  every page (home, blog, articles) resolves left to right out of random glyphs,
  in up to 2.4 s, without shifting the layout; the server sends the plain
  text, screen readers get the real name, and `prefers-reduced-motion` keeps
  it still.
- **Weekly dependency updates with Dependabot**
  ([#56](https://github.com/kbrdn1/kbrdn.dev/issues/56)). Bun packages, GitHub
  Actions and the `oven/bun` base image, as PRs against `dev`, with minor and
  patch bumps grouped per ecosystem. The PR checks used to fail such PRs by
  construction (branch name, no linked issue); they now let PRs opened by
  Dependabot through, the title check still applies. Dependabot reads its
  config from `main`, so it starts once this version is released.

### Changed

- **The home page, reworked**
  ([#53](https://github.com/kbrdn1/kbrdn.dev/issues/53)). The skills tabs
  give way to a stack list (a column of categories, then each one's tools with
  their icon, linking to its official site). The contact links (GitHub,
  Twitter, LinkedIn) move into the hero as icon-only ghost buttons, next to
  "Book a call", in place of the "View on GitHub" and "Read the blog" buttons; the Contact section goes.
  The "Open to opportunities" badge turns green, the avatar loses its stripes,
  border and hover zoom, and the About text loses its em dashes. Featured projects are
  now the repositories pinned on GitHub, as compact cards (logo or language
  icon, stars, forks, a language bar along the bottom edge). GitHub activity
  opens on a "Recent" tab, the rolling last 12 months as on the GitHub
  profile, and its month labels no longer overlap. Loading skeletons now have
  the shape of what they stand for, one per section.

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

### Fixed

- **GitHub activity showed made-up numbers in production**
  ([#53](https://github.com/kbrdn1/kbrdn.dev/issues/53)). The token was read
  from a runtime config frozen at build time, empty in the Docker image, so the
  API fell back to random data on every request. The server now reads
  `GITHUB_TOKEN` at request time, and returns an error instead of random data
  when it cannot reach GitHub.
- **Contact form messages were most likely never emailed**
  ([#53](https://github.com/kbrdn1/kbrdn.dev/issues/53)). Same cause with the
  Resend key: without it, the form only logged the message and reported
  success. The key is now read at request time too.

## Past releases

- [1.0.2](changelogs/1.0.2.md) — 2026-09-19
- [1.0.1](changelogs/1.0.1.md) — 2026-09-19
- [1.0.0](changelogs/1.0.0.md) — 2026-08-14
