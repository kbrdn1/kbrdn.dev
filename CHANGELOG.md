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

- **An apps page, `/apps`**
  ([#79](https://github.com/kbrdn1/kbrdn.dev/issues/79)). gwm (available),
  vellum (in development) and LazyCurl (archived), each with its features and
  licence, links to its site, repository and releases, and for gwm the install
  commands of its README. The latest release is read from GitHub instead of
  written down.

- **A third theme, glass**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). The theme button now
  cycles light, dark and glass. Glass is the dark theme with translucent panels
  blurred over the dither field, which then fills the whole screen, unfaded;
  everything styled for dark applies to it. Under
  `prefers-reduced-transparency` the panels turn opaque again.
- **Pictures seen through a pixel layer**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Banners, app
  screenshots and the carousel's voxel scenes are redrawn as a grid of the
  page's pixel shape, the one of the dither field, each cell the picture's
  colour there. Hovering clears the layer block by block from the pointer down
  to the crisp picture, and a new picture sweeps in block by block; at once
  under `prefers-reduced-motion`. Banners go through IPX at a few hundred pixels
  instead of the 11 MB originals.
- **An activity page, `/activity`**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). The open source work
  (shared with `/experience`), the contribution chart, and the recent public
  GitHub activity read live and told in plain words, day by day: pushes folded
  per branch and day, comments per issue, pull requests merged or opened. Cached
  ten minutes server side; the page says when GitHub was last checked.
- **A contact page, `/contact`**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). The form leaves the
  footer for its own page (after isrod.eu): name, email, company, the topic as
  chips, the message, with the details beside it. The footer keeps a button to
  it and signs with the logo.
- **The new theme spreads from the button**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). A circle grows from
  the theme button over a still snapshot of the old theme, edged with a halo in
  the new theme's colour (yellow to light, orange to dark, cyan to glass),
  instead of every colour fading on its own. A plain switch without view
  transitions or under `prefers-reduced-motion`.
- **Numbers roll in**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). The figures in view
  (open source counts, contribution totals, reading times, the carousel's
  position, the 404's pixels in place) spin one turn of a slot machine reel when
  they appear, blurred while fast, and roll to the new value when it changes.
  The server renders the final value; copied text and screen readers get the
  number alone.

### Changed

- **The navigation leads to pages**
  ([#80](https://github.com/kbrdn1/kbrdn.dev/issues/80)). Journey, Apps and
  Blog, on every page and on mobile, instead of the home page's anchors; one
  list shared by the header, the blog header and the footer, with the current
  page marked. On wide screens (1700px and up), the home page gets a table of
  contents in the margin, like an article's, following the section being read.

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

- **The home page in panels, after disarto**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Each section is a
  rounded panel holding cards, with disarto.co's own radii (20 px, 4 px of
  padding, concentric 16 px cards): a title in Inter, mono eyebrows over large
  Inter figures, a footer with mono meta and pill buttons. The GitHub chart's
  views are a segmented control, availability a status tag, and the pinned
  repositories' languages are cut into ticks. The hero sits open on the page,
  its mascot floating and changing expression; the carousel becomes a panel,
  its slide in a card beside its scene, moved on by a tick timer that pauses
  on hover and focus and is gone under `prefers-reduced-motion`. Corners are no
  longer sharp (`--ui-radius`), and the orange buttons get dark text: white on
  `#d4825d` fails AA.
- **The other pages in panels too**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). `/apps`: one card per
  app, its features ticked, then its install commands and its demo after
  dashed rules. `/experience`: a card per role and degree, company logos as
  rounded tiles, and the open source work as a card of figures (a tick bar per
  group, coloured by status) over its lists, one at a time behind a segmented
  control. `/blog`: a filter bar, the posts as cards, the pages in the panel's
  footer. Articles: the header is a card, the banner inset at its top.
- **A floating navbar, the announcement as a notch under it**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). The navbar is
  detached from the top, a panel as wide as the home page's, its pages a
  segmented control; the announcement banner hangs under it as a notch with
  concave shoulders, on every page. The footer, the music player and the table
  of contents take the panel surfaces too.
- **The roles strip follows the reading on `/experience`**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Once scrolled away,
  it comes back compact under the navbar, marks the role or degree being read
  with a sliding ink and keeps the address on its anchor; anchors scroll
  smoothly.
- **Motion, everywhere the same**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Pages cross-fade
  through view transitions and every panel comes in as it is scrolled to (what
  is on screen at load stays put). Segmented controls get one pill that glides
  to the active segment. A new slide, track or hero title leaves on one side and
  comes in from the other, and in the player only the cover and title move.
  Refilled lists (blog, contribution calendars, open source) drop their old
  items at once and bring the new ones in one after the other.
- **Projects under their role on `/experience`**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). After isrod.eu's
  sub-entries: under Jewely x Flippad, a section set in for each project
  (Jewely E-commerce, Fiches Pédagogiques, the configurator, Assmat Facile, the
  ERP) with its client, role and period, what was done, the stack and links to
  the public site or the blog post. They join the roles strip, marked ↳; the
  role's own missions keep only what spans the projects.
- **The error page lives in the site**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Navbar, footer and the
  three themes, an intro like the other pages, and the status code in pixels
  in a panel: drag them with a mouse, pen or finger, a counter says how many are
  back in place. Any status shows its own code.
- **Blog cards and the table of contents**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Cards after an event
  card (banner on top, reading time, one meta line); the table of contents as a
  checklist of the sections read. The music player's controls and listing in
  the panel style.

### Fixed

- **The gwm card on `/apps` overflowed on mobile**
  ([#84](https://github.com/kbrdn1/kbrdn.dev/issues/84)). Its longest install
  line set the width of the whole column, and the card clipped the text and the
  video on the right; the line now scrolls inside its code block.
- **The contact form trusted what it received**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Every field went into
  the email's HTML as is: they are now escaped, capped in length and required to
  be strings (an array crashed the route), the topic limited to a closed list.
- **Glass lost its blur while things moved**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Fades on a wrapper
  (page transitions, section entrances, the compact strip, the player) turned
  the panels' blur off until they ended; and an unlayered global colour
  transition overrode every transition of the components, so the strip's ink
  jumped and focus rings snapped.

## Past releases

- [1.1.0](changelogs/1.1.0.md) — 2026-10-16
- [1.0.2](changelogs/1.0.2.md) — 2026-09-19
- [1.0.1](changelogs/1.0.1.md) — 2026-09-19
- [1.0.0](changelogs/1.0.0.md) — 2026-08-14
