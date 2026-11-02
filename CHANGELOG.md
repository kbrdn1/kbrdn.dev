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

- **A release deployed production twice**
  ([#139](https://github.com/kbrdn1/kbrdn.dev/issues/139)). The merge to
  `main` shipped `:main` to prod, then the tag shipped `:vX.Y.Z` about a minute
  later: two swaps, the first one before `release.yml`'s gates had run, and two
  builds of the same commit whose chunks differ, so a visitor served by the
  first could hit 404s on chunks the second no longer had. A push to `main`
  that bumps the version now builds `:main` without deploying it: production
  belongs to the tag. If the tag's deploy fails, production stays on the
  previous version until `gh run rerun --failed`.

## Past releases

- [2.1.0](changelogs/2.1.0.md) · 2026-11-02
- [2.0.0](changelogs/2.0.0.md) · 2026-10-29
- [1.1.0](changelogs/1.1.0.md) · 2026-10-16
- [1.0.2](changelogs/1.0.2.md) · 2026-09-19
- [1.0.1](changelogs/1.0.1.md) · 2026-09-19
- [1.0.0](changelogs/1.0.0.md) · 2026-08-14
