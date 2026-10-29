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
- **The navbar's notch opens into menus**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Hovering a page in the navbar opens the notch under it into that page's menu: a line of
  context, its sections (the latest posts for the blog) and an illustration that
  follows the link under the pointer and stays on the last one; it widens as it
  opens, and the navbar's
  pill moves to the page whose menu is open. The announcement opens gwm's, which
  now leads to gwm.kbrdn.dev. Desktop only.
- **A face on the site**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). A portrait in
  `/contact`'s details, through the pixel layer; a small round photo beside the
  hero's handle, the drawn avatar on hover; and the hero's mascot now takes turns
  with drawn portraits of me. Re-encoded without metadata.
- **A pixel on the pointer**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). A pixel in the accent
  sits on the pointer's tip; now and then it grows block by block into an arcade
  invader, hops off in one of a D-pad's eight directions, marches on a block per
  frame like in the arcade, sometimes turns into another one, then hops back
  onto the tip. A click throws eight blocks along the D-pad. A triple click calls
  Ichigo Kurosaki, from his Jump Ultimate Stars sprites (21 moves, Shikai and
  Bankai): he grows out of the pixel, plays a move drawn at random (never the
  same twice in a row; three are specials whose Getsuga Tenshō flies across the
  screen), then folds back; every third click calls him again. The
  sprites load on the first triple click (123 KB). A shift click turns the
  pixel into a sight that tightens on each click, the system pointer a cross.
  Mouse and trackpad only, never under `prefers-reduced-motion`.
- **Illustrations full size**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). A click on an
  illustration of `/experience` opens it crisp and full size in a native dialog
  (Escape, a click beside it or its button close it), as an article's pictures
  already zoom.
- **Where the companies, clients and schools live**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Under each entry of
  `/experience`, links to flippad.com and jewely.fr, the clients' sites
  (bijouterie-julian.com, crown-dp.com, martin-media.fr), the school's, and the
  projects' own site and article.
- **Share an article from the device**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Where the browser has
  one, a button opens the device's share sheet (Web Share), beside Copy link.
- **Featured projects, personal and professional**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Two tabs on the home:
  the repositories pinned on GitHub, and the projects built at Jewely x Flippad
  in the same cards, the project's logo, its site, its client and its years, a
  bar showing when it ran within those years; each leads to it on
  `/experience`.
- **An invader on the footer's edge**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Now and then one of
  the pointer's invaders runs in on the footer's top edge, in its own colour of
  the theme, and runs back and forth, a trail of pixels behind it that follows
  its jumps. Its favourite food pops up here and there, animated (pellets for
  the squid, cherries for the crab, stars, mushrooms or cookies for the
  others), and it leaps to eat it; it vaults the obstacles that rise in its way
  (a rock, spikes, a cactus, a crate) and ducks under the birds that fly at it.
  After a while it runs off and another one comes later; a click blows it up
  and the cycle goes on. One at a time, only while the footer is in view, never
  under `prefers-reduced-motion`.
- **A pixel scene in the pages' hero**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Beside the hero, under
  it on a phone, a detailed loop in the theme's palette with no background, the
  sun by day, the moon and stars by night: a crab climbs the mountain's trail to
  its flag and cheers in confetti on `/experience`; an invader sits on a monitor
  typing gwm's commands on `/apps`; another fills a contribution graph on
  `/activity`; on `/blog`, a writing nook at night after Kirokaze's and
  Waneella's rooms, rain over the city, the article typed then sent off as a
  paper plane, a ginger cat asleep on the books; a bird posts a letter on
  `/contact`. It plays only on screen and holds still under
  `prefers-reduced-motion`. The pages' OG images show the same scene.
- **What is going on right now, on `/activity`**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). What is being learnt,
  what is being read, and what is welcome, with a link to write.
- **The blog's blue in its dither**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). The dither field takes
  an optional second colour in slow patches; the blog's layout uses its sky blue.
- **A CV to download**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Between the roles and
  the degrees on `/experience`, and in `/contact`'s details, in the site's
  language. The PDFs are hosted outside this public repository: their addresses
  come from the repository variables `CV_URL_FR` and `CV_URL_EN` at build time;
  without them, nothing shows.
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
  they appear, blurred while fast, and roll to the new value when it changes;
  so do the table of contents' counter and step. Text rolls the same way, letter
  by letter: the hero's rotating title, the mobile table of contents' section.
  The server renders the final value; copied text and screen readers get the
  plain value.
- **Listen to an article**
  ([#104](https://github.com/kbrdn1/kbrdn.dev/issues/104)). The table of
  contents reads the article aloud, sidebar and mobile bar alike: a play button
  at its head, then, once started, the music player's tick bar that seeks by
  sentence, in place of the scroll progress. Its steps are the sections: the
  one being read shows the music player's equalizer, and clicking a step while
  listening reads from there. Hovering a section heading shows a button that
  reads from it too (always shown on touch screens). It runs on the browser's
  own speech synthesis (the Web Speech API, what TTSReader uses): free, no key,
  no server. The voice is the cleanest the browser has in the article's
  language (Edge's neural voices, then Chrome's Google voices, then downloaded
  system voices), so its quality depends on the browser. Code blocks, tables
  and images are not read. Starting a reading stops the music and the other
  way round; leaving the article stops it.

- **Pixel scenes in every section**
  ([#100](https://github.com/kbrdn1/kbrdn.dev/issues/100)). Now and then (a
  first one 5 to 11 s after a page shows, then one every 18 to 38 s, one at a
  time on the whole site), a small pixel scene grows out of a section block by
  block like Ichigo, plays and folds back: a camera beside the About figures, a
  pencil beside the post titles, gears beside the tools, a rocket in the
  projects' footer, the Octocat beside the contribution graph, a crab climbing
  steps, a mortarboard beside the degrees, a saucer in Explore's header, a sheet
  folding into a paper plane by the contact form's button, a letter beside the
  address, an hourglass, a flip calendar on the timeline, a printer on the CV, a
  git merge on Open source, a bell on the activity feed, a cannon shooting an
  invader in the apps, and on the blog a bookworm, a coffee and a megaphone. In
  a card a scene takes the rightmost stretch wide enough that no text, picture
  or control crosses, and does not play where there is none. Canvas only while one plays,
  never under `prefers-reduced-motion`.
- **Redrawn page heroes**
  ([#100](https://github.com/kbrdn1/kbrdn.dev/issues/100)). The pixel scenes of
  /parcours (a living metro map of the career), /apps (gwm's TUI on a retro
  screen), /activity (an invader filling a contribution graph), /blog (a writing
  nook, a cat asleep on the books) and /contact (a bird posting a letter at a
  front door) are redrawn at the sections' scenes' level: shaded, outlined,
  looping seamlessly, painted only while on screen, a resting frame under
  reduced motion.
- **The stack orbits the mascot**
  ([#100](https://github.com/kbrdn1/kbrdn.dev/issues/100)). On the home page,
  badges of the stack (TypeScript, Rust, Vue, Laravel, Nuxt, Go) orbit the
  mascot like a tilted ring, behind it on the far side and in front of it on the
  near one.
- **A glow along the column's borders**
  ([#100](https://github.com/kbrdn1/kbrdn.dev/issues/100)). From 1280 px wide, a
  light now and then runs up or down one of the borders that frame the 80rem
  column.
- **Languages on the Pro cards**
  ([#100](https://github.com/kbrdn1/kbrdn.dev/issues/100)). The client projects
  show the share of each language like the pinned repositories (measured on the
  private repositories), their frameworks, and a swatch in the framework's
  colour.

### Changed

- **Nuxt 4.6, nuxt-og-image 7 and @nuxt/fonts 1.2**
  ([#90](https://github.com/kbrdn1/kbrdn.dev/issues/90)). The three
  Dependabot updates (#67, #69 and the minor-and-patch group) only work
  together: Nuxt 4.6 checks the island request hash that nuxt-og-image 6 does
  not send. OG image URLs are now signed with the app secret: **production
  needs `NUXT_APP_SECRET`** (at least 32 characters, a repo secret passed by
  `deploy.yml` and `release.yml`), or every `/_og/*` request returns 500 and
  `scripts/deploy.sh` warns. The VPS wrapper's allowlist accepts it: sync
  `/srv/` before the first deploy that sends it (`docs/RELEASE.md`).

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
  The five colour variants are in `public/images/logo/`. Every corner is
  rounded with the same radius, 4 on the 96 grid
  ([#101](https://github.com/kbrdn1/kbrdn.dev/issues/101)). On hover or
  keyboard focus of the logo or the button that carries it, the bar runs along
  its diagonal, leaves at the top, comes back from the bottom and cuts the
  branch again on its way through: the two orange pieces spring apart, then
  back. Still under `prefers-reduced-motion` and the site's pause button.
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
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Changing page is a
  focus pull through view transitions, the navbar staying sharp and still, and
  every panel comes in as it is scrolled to (what is on screen at load stays
  put). Segmented controls get one pill that glides
  to the active segment. A new slide, track or hero title leaves on one side and
  comes in from the other, and in the player only the cover and title move.
  Collapses (a role's missions, the player's list, the mobile menu) open on
  their height, their content unblurring in step with it. Refilled lists (blog,
  contribution calendars, open source) close their removed rows from the last
  one up and open the new ones one after the other, so a list showing less
  shrinks instead of jumping.
- **`/experience` as a vertical timeline**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Roles and degrees on
  a rail that fills in the accent as the page is read, the years beside it; each
  role's projects under it (Jewely E-commerce, Fiches Pédagogiques, the
  configurator, Assmat Facile, the ERP) with their client, role and period, and
  an illustration from their public site, their README or their maker's site
  seen through the pixel layer. Each entry unfolds its stack, what was done and
  its links. Figures on top (years at work, client projects, open source tools,
  degrees) roll in. On a phone, no rail: the sticky strip of roles tells where
  the reader is. The home's Parcours section shows the same timeline, one line
  per stop, and its About the same figures.
- **The error page lives in the site**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Navbar, footer and the
  three themes, an intro like the other pages, and the status code in pixels
  in a panel: drag them with a mouse, pen or finger, a counter says how many are
  back in place. Any status shows its own code.
- **OG images as the site's components, in the repos' banners' design**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). One panel on the
  pixel field, two dashed construction lines along its sides and nothing else
  outside it, its height following its content: a header, then a card (name and
  title in Fenix or the article's title, buttons; the drawn portrait or the
  article's banner beside its facts; the figures on the home, the stack or the
  summary after a dashed rule), then a footer with the address in mono. Articles
  keep the field tinted with the blog's blue. The README's banner follows the
  same design, with the home as its picture.
- **Sections swing in**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Below the fold, each
  panel comes in slightly turned and off to one side, from the left and the
  right in turn.
- **Blog cards and the table of contents**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Cards after an event
  card (banner on top, reading time, one meta line), frosting the banner's edge
  in glass, and a hatched card for the next post in the empty slot of an odd
  page; the table of contents as a
  checklist of the sections read in the accent, the mobile one included. The
  music player's controls and listing in the panel style.
- **The hero's button gets in touch**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). The disabled "Book a
  call" gives way to "Get in touch", a link to `/contact`.
- **Articles in the site's design**
  ([#106](https://github.com/kbrdn1/kbrdn.dev/issues/106)). Code blocks and
  tables are cards (1rem corners, the cards' border and surface, opaque in
  glass), table heads are mono labels, bullets are orange as on `/experience`,
  inline code sits on the controls' surface. Hovered links no longer get a
  second line under their underline. Headings are unchanged. The `:deep()`
  rules of `prose.css` never applied (a global sheet drops them): they are
  gone, and the elements are themed through Nuxt UI's prose theme in
  `app/app.config.ts`.
- **Article pictures open in the site's viewer**
  ([#106](https://github.com/kbrdn1/kbrdn.dev/issues/106)). The same one as
  `/experience`'s illustrations, from a real button: Enter or Space opens it,
  Escape, the close button or a click outside closes it, and focus goes back
  to the picture. Nuxt UI's zoom, a second viewer out of the keyboard's reach,
  is gone.

- **OG images draw the redrawn heroes**
  ([#100](https://github.com/kbrdn1/kbrdn.dev/issues/100)). A page with a scene
  shows its new hero at its resting frame. The header's window icons and the
  footer's toolbar icons give way to the page's address (top right) and the
  site's K with its two languages, the page's one lit (bottom left).

### Fixed

- **OG images render the same on every machine**
  ([#90](https://github.com/kbrdn1/kbrdn.dev/issues/90)). Google serves Inter
  as a variable font, which satori cannot read, and nuxt-og-image's fallback
  download varied: Inter on a Mac, Fenix on the CI runner, so in production.
  The OG templates now use `Inter OG`, a static Latin subset of Inter 400 and
  500 in `public/fonts/inter`, never preloaded by the site. The CI no longer
  caches `node_modules`, which bun left with stale nested packages after a
  lockfile change.

- **An OG image could come in the other language**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). Both languages share
  the pages' paths, and the image rendered first was served to the other one
  from the cache; each language now has its own.
- **The contribution chart's arrow keys lost the focus**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). They looked for the
  selected tab across the whole page, so focus jumped to the featured projects'
  or open source tabs; it now stays in the chart's own tabs.
- **Pictures overflowed their frame's corners**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)). The carousel's scene
  and the full-size illustration were rounded wider than the panel around them;
  their corners now follow it.
- **Activity sat under Projects in the home's table of contents**
  ([#86](https://github.com/kbrdn1/kbrdn.dev/issues/86)), and its French label
  had lost its accent.
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

- **The kbrdn.dev card shows the site's logo**
  ([#100](https://github.com/kbrdn1/kbrdn.dev/issues/100)). It came from the
  default branch's favicon, still the old logo and coloured by the system's
  theme rather than the site's.

- **Article pictures arrive as committed**
  ([#116](https://github.com/kbrdn1/kbrdn.dev/issues/116)). They went through
  the image server, which re-encoded them on every request with no resize, no
  format change and no cache: the gwm demo GIF took 16 s to reach preprod, 1.49
  MB for 884 KB committed, and answered 500 in production; PNGs came out 76 to
  84% heavier. They are now plain static files: the gwm article's pictures
  weigh 1.9 MB instead of 3.3 MB.

## Past releases

- [1.1.0](changelogs/1.1.0.md) · 2026-10-16
- [1.0.2](changelogs/1.0.2.md) · 2026-09-19
- [1.0.1](changelogs/1.0.1.md) · 2026-09-19
- [1.0.0](changelogs/1.0.0.md) · 2026-08-14
