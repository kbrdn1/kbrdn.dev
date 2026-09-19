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

### Changed

- **The site no longer says I work at Jewely x Flippad**
  ([#33](https://github.com/kbrdn1/kbrdn.dev/issues/33)). The contract ended in
  September 2026, but the hero badge, the footer status and the OG image still
  read "In contract at Jewely x Flippad", and the experience was still flagged
  current. The experience now closes on `2026-09` with the role renamed to Full
  Stack Engineer, and the status reads "Open to opportunities".

- **Linting and formatting move to oxc**
  ([#37](https://github.com/kbrdn1/kbrdn.dev/issues/37)). `oxlint` replaces
  ESLint and `@nuxt/eslint`, with the rules migrated from the old config. Not
  carried over: the template-only rules of eslint-plugin-vue, which oxlint does
  not implement, and three Nuxt-specific rules that would have kept an ESLint
  plugin around. `oxfmt` formats the code — Markdown and MDX are left alone —
  and CI now fails on unformatted code. The one-off reformat commit is listed in
  `.git-blame-ignore-revs`.

### Fixed

- **The typecheck was not running in CI**
  ([#35](https://github.com/kbrdn1/kbrdn.dev/issues/35)). `vue-tsc` was not a
  dependency, so `nuxt typecheck` fetched it through `npx`, which resolved its
  `typescript` peer to `latest` — TypeScript `7.0.2`, which no longer exports
  `./lib/tsc`. `vue-tsc` died on load, and `continue-on-error: true` on the step
  kept the job green: the v1.0.0 release run (2026-08-14) already failed on it. `vue-tsc` and
  `typescript@~5.9` are now pinned devDependencies, the step fails the job
  again, and the 38 type errors it had been hiding are fixed (mostly unchecked
  index access; `titles` added to the pages schema, the dead i18n `lazy`
  option removed).

## Past releases

- [1.0.0](changelogs/1.0.0.md) — 2026-08-14
