#!/usr/bin/env bash
# Décide si un push sur `main` déploie la prod (le filet de deploy.yml) ou la
# laisse au tag. Émet des lignes `clé=valeur` au format de $GITHUB_OUTPUT.
#
#   version inchangée entre <before> et <after>  →  deploy=true   (filet)
#   version changée                              →  deploy=false  (le tag déploie)
#
# Un push qui change la version de package.json est un merge de release, ou un
# hotfix bumpé : son tag vX.Y.Z suit, et release.yml déploie après ses gates
# (version = tag, notes présentes, ancêtre de main). Le filet enverrait le même
# code en prod avant elles, avec un build différent : deux swaps pour une
# release, et des chunks du premier absents du second (#139).
#
# Dans le doute, on déploie (fail open) : `before` nul (branche créée),
# introuvable (force-push) ou sans version lisible.
#
# Vit ici et pas inline dans deploy.yml pour être rejouable hors CI :
# `scripts/resolve-main-push.test.sh` en dépend.
#
# usage: resolve-main-push.sh <before-sha> [after-sha]   (depuis le dépôt)
set -euo pipefail

BEFORE="${1:-}"
AFTER="${2:-HEAD}"

version_at() {
  git show "$1:package.json" 2>/dev/null | jq -r '.version // empty' 2>/dev/null
}

TO=$(version_at "$AFTER" || true)
FROM=""
if [[ -n "$BEFORE" && ! "$BEFORE" =~ ^0+$ ]]; then
  FROM=$(version_at "$BEFORE" || true)
fi

if [[ -n "$FROM" && -n "$TO" && "$FROM" != "$TO" ]]; then
  DEPLOY=false
else
  DEPLOY=true
fi

cat <<EOF
deploy=$DEPLOY
from=$FROM
to=$TO
EOF
