# Configuration: secrets and variables

What the CI, the deployment and the running site need, where each value lives and how it
reaches the container. **No real value ever goes in this file: the repository is public.**

## Repository secrets

**Settings → Secrets and variables → Actions → Secrets.**

| Secret | Purpose | Read by | Format |
|--------|---------|---------|--------|
| `VPS_HOST` | SSH target of the deployment | `deploy.yml`, `release.yml` | hostname or IP |
| `VPS_USER` | SSH user on the VPS | `deploy.yml`, `release.yml` (falls back to `root`) | `root` |
| `VPS_SSH_PRIVATE_KEY` | Key of the restricted CI account, see [The deploy key](#the-deploy-key) | `deploy.yml`, `release.yml` | OpenSSH ed25519 private key |
| `GH_TOKEN` | GitHub API: contribution chart, activity feed | `ci.yml` (build), then the container as `GITHUB_TOKEN` | `ghp_…` or `github_pat_…` |
| `RESEND_API_KEY` | Contact form emails | `ci.yml` (build), then the container | `re_…` |
| `NUXT_APP_SECRET` | Signs the OG image URLs (`/_og/*`, nuxt-og-image 7) | the container | 64 hex chars |
| `TURNSTILE_SECRET_KEY` | Checks the contact form's Cloudflare Turnstile token | the container | `0x4AAA…` |

`GITHUB_TOKEN` (the built-in one) needs no configuration: it pushes the image to GHCR and
creates the GitHub releases.

`NUXT_STUDIO_TOKEN` is passed by `deploy.yml` and `release.yml` but is **not defined**, and
nothing reads it: `nuxt-studio` is disabled in `nuxt.config.ts`. Re-enabling the module means
setting up its GitHub OAuth app and documenting its secrets here.

## Repository variables

**Settings → Secrets and variables → Actions → Variables.** Not secrets: they are baked into
the image and served to every visitor.

| Variable | Purpose | Read by |
|----------|---------|---------|
| `CV_URL_FR` / `CV_URL_EN` | Addresses of the CV PDFs, hosted on the VPS outside this repository | `deploy.yml`, `release.yml`, as Docker build args |
| `TURNSTILE_SITE_KEY` | Site key of the contact form's Turnstile widget | `deploy.yml`, `release.yml`, as a Docker build arg |
| `GA_ID` | Google Analytics 4 measurement ID (`G-…`) | `deploy.yml`, `release.yml`, as a Docker build arg, **prod builds only** |

Empty, the CV sections of `/experience` and `/contact` stay hidden. Without
`TURNSTILE_SITE_KEY` the widget does not render, so no message can be sent.

`GA_ID` only reaches the prod build, so preprod never feeds the property. Without it there is
no cookie banner and no Google Analytics at all (`app/plugins/cookie-consent.client.ts`):
gtag.js is only downloaded once a reader accepts the analytics cookies. To try it locally,
`NUXT_PUBLIC_GA_ID=G-… bun run dev`.

## From the workflow to the container

The image is built **without** the runtime secrets; they reach the container at deploy time:

```
deploy.yml / release.yml
  └─ ssh $VPS_USER@$VPS_HOST "ENV=… IMAGE=… GITHUB_TOKEN=… RESEND_API_KEY=…
                              NUXT_STUDIO_TOKEN=… NUXT_APP_SECRET=… TURNSTILE_SECRET_KEY=… deploy"
       └─ ForceCommand: /srv/github-deploy.sh   (copy: scripts/github-deploy.sh)
            refuses any variable outside its allowlist
            └─ /srv/deploy.sh                    (copy: scripts/deploy.sh)
                 └─ docker run -e GITHUB_TOKEN -e RESEND_API_KEY -e NUXT_APP_SECRET
                               -e TURNSTILE_SECRET_KEY …
```

A new runtime secret therefore needs four changes: the two workflows, the allowlist of
`scripts/github-deploy.sh`, the `-e` list of `scripts/deploy.sh`, and a manual sync of the
VPS (`docs/RELEASE.md`, « Synchroniser le VPS ») **before** the first deploy that sends it.
Otherwise the wrapper refuses the variable and the deploy fails.

Build-time values (`GIT_SHA`, `APP_VERSION`, `APP_ENV`, `CV_URL_*`, `TURNSTILE_SITE_KEY`,
`GA_ID`) are Docker build args, baked into the image.

## How to obtain each secret

### The deploy key

A dedicated key, used by the CI only:

1. `ssh-keygen -t ed25519 -f kbrdn-deploy -C github-actions`
2. On the VPS, add the public key to `~/.ssh/authorized_keys` of `VPS_USER`, restricted to
   the wrapper:
   ```
   restrict,command="/srv/github-deploy.sh" ssh-ed25519 AAAA… github-actions
   ```
3. Store the private key in `VPS_SSH_PRIVATE_KEY`, and the host in `VPS_HOST`.

With that key the CI can only run `deploy`, `rollback`, `status` or `ping`, with the
variables of the allowlist.

### GH_TOKEN

1. GitHub **Settings → Developer settings → Personal access tokens**
2. A classic token with the `read:user` and `repo` scopes
3. The site ignores placeholders and tokens of 20 characters or fewer
   (`server/utils/githubToken.ts`)

### RESEND_API_KEY

1. [resend.com](https://resend.com) → **API Keys** → create a key
2. Without it, contact form submissions are only logged

The messages go from `contact@email.kbrdn.dev` (the domain verified in Resend) to
`hello@kbrdn.dev`. If that address ever bounces, Resend puts it on its suppression list and
drops every later message as `suppressed`, silently: the form still answers success. Check
**Emails → Suppressions** (or `GET /suppressions`) and remove it once the mailbox works again.

### TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY

1. Cloudflare dashboard → **Turnstile** → add a widget, mode **Managed**, hostnames
   `kbrdn.dev` and `pre-prod.kbrdn.dev` (one widget, one site key for both images)
2. `gh variable set TURNSTILE_SITE_KEY` with the site key, `gh secret set TURNSTILE_SECRET_KEY`
   with the secret key
3. Sync the VPS **before** the first deploy that sends the secret, see
   [From the workflow to the container](#from-the-workflow-to-the-container)

The check fails closed: without the secret, `/api/contact` answers 503 and sends nothing
(`scripts/deploy.sh` warns); without a valid token, 403. Locally, `.env.example` carries
Cloudflare's always-pass test keys.

### NUXT_APP_SECRET

1. `openssl rand -hex 32` (at least 32 characters)
2. `openssl rand -hex 32 | gh secret set NUXT_APP_SECRET`, then redeploy

Missing or too short, the container starts and passes its health check, but every OG image
returns 500; `scripts/deploy.sh` warns without blocking (a rollback to an image older than
nuxt-og-image 7 does not need it). Rotating it invalidates the OG URLs already cached by
social networks.

## Cloudflare

### Cache Rule: Nuxt Content's database

The first client-side navigation to a content page (`/blog`, a post, the home's latest posts,
`/cgu`) runs Nuxt Content's queries in the browser: it downloads `/_nuxt/sqlite3.*.wasm`
(about 400 KB brotli) and the collection's dump (`/__nuxt_content/<collection>/sql_dump.txt?v=<checksum>`).
Cloudflare does not cache `.wasm` nor `.txt` by default (`cf-cache-status: DYNAMIC`), so every
reader went to the VPS for them. One Cache Rule makes them eligible:

| Field | Value |
|-------|-------|
| Name | `Nuxt Content database (wasm + dumps)` |
| Expression | `(starts_with(http.request.uri.path, "/_nuxt/") and ends_with(http.request.uri.path, ".wasm")) or (starts_with(http.request.uri.path, "/__nuxt_content/") and ends_with(http.request.uri.path, "/sql_dump.txt"))` |
| Cache eligibility | Eligible for cache |
| Edge TTL / Browser TTL | Respect origin |

Both are safe to keep: the wasm's name carries its hash, the dump's address its content
checksum (`?v=`, part of the cache key), so a new build is a new address. The origin marks them
`immutable` (`routeRules` in `nuxt.config.ts` for the dumps). Check with two requests: the second
answers `cf-cache-status: HIT`.

It lives in the zone's cache settings (**Caching → Cache Rules**), outside this repository. The
phase holds a single ruleset per zone: add the rule beside the others, never replace the
ruleset.

## Local development

Copy `.env.example` to `.env` (ignored by git):

```bash
GITHUB_TOKEN=ghp_your_token_here
RESEND_API_KEY=re_your_key_here   # optional
TURNSTILE_SITE_KEY=1x00000000000000000000AA              # Cloudflare test keys,
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA # always pass
CV_URL_FR=                        # gh variable get CV_URL_FR
CV_URL_EN=                        # gh variable get CV_URL_EN
```

Without the `CV_URL_*` values, the CV sections of `/parcours` and `/contact` stay hidden, as
in a deploy without the variables. They are read when Nuxt starts: restart `bun run dev`
after setting them.

`bun run dev` needs no `NUXT_APP_SECRET`: Nuxt generates one for development.
`docker compose up` and a production build served locally do: add it to `.env`.
`scripts/og-smoke.sh` generates a throwaway one by itself.

## Troubleshooting

- **The deploy fails with `variable refusée: X`**: the workflow sends a variable the VPS
  wrapper does not allow yet. Sync `/srv/github-deploy.sh` and `/srv/deploy.sh`.
- **OG images return 500**: `NUXT_APP_SECRET` is missing or too short in the container; the
  deploy log carries the warning.
- **The contact form only logs**: `RESEND_API_KEY` did not reach the container.
- **The contact form always fails**: 503 in the container logs (`TURNSTILE_SECRET_KEY is not
  set`) → the secret did not reach it; `Turnstile check failed` → the site key baked into the
  image and the secret belong to different widgets, or the hostname is not on the widget.
- **The form says sent, nothing arrives**: `hello@kbrdn.dev` is on Resend's suppression list,
  see [RESEND_API_KEY](#resend_api_key).
- **No contribution chart or activity**: `GH_TOKEN` is missing, or a placeholder.

## Security notes

- Never commit a real value: this file, `.env.example` and the workflows are public.
- Rotate tokens periodically, with the minimal scopes.
- The CI key never gets a shell: `ForceCommand` plus the wrapper's allowlist.
