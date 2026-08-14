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

- **A release flow, where there was none**
  ([#18](https://github.com/kbrdn1/kbrdn.dev/issues/18)). The site deployed
  fine, but nothing tied a deployment to a version: images were tagged `:main`
  and `:dev` (both mutable), `package.json` carried no `version` field at all,
  and no one could answer "which version is live on pre-prod right now".

  Tags now drive deployment. `vX.Y.Z-rc.N` builds an immutable
  `ghcr.io/kbrdn1/kbrdn.dev:vX.Y.Z-rc.N`, ships it to **preprod** and opens a
  GitHub pre-release; `vX.Y.Z` does the same for **prod** and publishes the
  release. Pushing to `dev` still redeploys preprod for day-to-day iteration —
  that path is untouched.

- **`GET /api/health`** returning `{ status, version, sha, env }`, with the
  version baked in at build time from `package.json` and the sha passed as a
  Docker build arg. The container `HEALTHCHECK` now points at it instead of
  `/`: the old probe passed as soon as the home page rendered server-side,
  which stays true even when the API layer behind `/api/github/*` and
  `/api/contact` is dead.

### Changed

- **Rollback actually rolls back**
  ([#18](https://github.com/kbrdn1/kbrdn.dev/issues/18)). `scripts/deploy.sh`
  used to `docker rm -f` the outgoing colour at the end of every deploy, which
  left `--rollback` requiring a container that had just been destroyed — at
  steady state it could only fail. The outgoing colour is now **stopped and
  kept**, so `--rollback` restarts it and swaps nginx back, and the immutable
  per-version images make `--image ghcr.io/kbrdn1/kbrdn.dev:vX.Y.Z` a real
  return to a known version rather than a colour flip.

- Containers carry a `kbrdn.version` label, so `docker inspect` answers the
  same question as `/api/health` from inside the VPS.

## Past releases

_None yet. `1.0.0` will be the first cut — see
[`docs/RELEASE.md`](docs/RELEASE.md)._
