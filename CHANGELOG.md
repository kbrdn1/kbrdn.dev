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

### Changed

- **The mascot in low-poly 3D, in the notch, Explore and the OG images**
  ([#127](https://github.com/kbrdn1/kbrdn.dev/issues/127)). A bank of scenes of
  the mascot in a stylised low-poly world, in the site's palette, generated with
  codex (`public/images/lowpoly`, `docs/LOWPOLY.md`): coding, debugging,
  deploying, gwm, vellum, LazyCurl, open source, writing, reading, game
  development, the journey, contact, collaboration and sponsoring, and two
  backgrounds in light and dark. The navbar's notch shows them in place of the
  voxel cities and of the apps' screenshots (gwm's, reused for unrelated links
  too, and LazyCurl's); the posts' and the journey's banners, the portrait and
  the avatar stay. The home's Explore carousel gets one per slide, with a light
  variant in light mode, instead of the voxel cities. The pages' OG images show
  the page's scene in place of its pixel hero, and the home's in place of the
  drawn portrait; a post's OG keeps its banner. They are served through
  IPX as WebP (about 70 KB in the carousel), never as the 1.5 MB PNGs. The
  pages' heroes keep their animated pixel scenes.

## Past releases

- [2.0.0](changelogs/2.0.0.md) · 2026-10-29
- [1.1.0](changelogs/1.1.0.md) · 2026-10-16
- [1.0.2](changelogs/1.0.2.md) · 2026-09-19
- [1.0.1](changelogs/1.0.1.md) · 2026-09-19
- [1.0.0](changelogs/1.0.0.md) · 2026-08-14
