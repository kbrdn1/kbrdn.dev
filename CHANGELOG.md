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

- **CI now checks the OG images**
  ([#44](https://github.com/kbrdn1/kbrdn.dev/issues/44)). They are rendered at
  request time, so lint, typecheck and build never ran them, and the oxfmt
  reformat of 1.0.1 broke them twice with CI green. The build job now serves
  `.output` and compares the OG images of `/`, `/blog` and `/blog/gwm` byte for
  byte against references committed under `scripts/og-smoke/` — rendering is
  identical across platforms, a reference made on macOS matches production bit
  for bit. A gradient split across lines fails it with a 500, single quotes in
  `main.css` fail it on the image itself. An intended change to an OG image
  goes through `scripts/og-smoke.sh --update`.

### Fixed

- **`docs/RELEASE.md` described the release it was supposed to guide wrongly**
  ([#43](https://github.com/kbrdn1/kbrdn.dev/issues/43)). Cutting 1.0.1
  contradicted four passages: the `Linked issue` check applies to pull requests
  into `dev` too, not only `main`; `main` also requires an approval, so the
  promotion is merged with `--admin` — which bypasses the required checks as
  well, and must only come after they are green; `/api/health` cannot tell the
  tag's image from the one `deploy.yml` ships on the merge, so the proof of a
  release is `gh release view`; and re-running an old tag does not rebuild the
  image, it rewrites the release notes from the tag's tree.

## Past releases

- [1.0.1](changelogs/1.0.1.md) — 2026-09-19
- [1.0.0](changelogs/1.0.0.md) — 2026-08-14
