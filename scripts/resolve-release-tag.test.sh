#!/usr/bin/env bash
# Check de resolve-release-tag.sh — c'est lui qui décide si un tag part en prod
# ou en preprod, une erreur d'aiguillage y publie une version non validée sur
# kbrdn.dev.
#
# usage: scripts/resolve-release-tag.test.sh
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESOLVE="$HERE/resolve-release-tag.sh"
FAILED=0

# get <tag> <clé> — valeur résolue, ou vide si le script rejette le tag
get() {
  "$RESOLVE" "$1" kbrdn1/kbrdn.dev 2>/dev/null | grep "^$2=" | cut -d= -f2-
}

expect() {
  local tag="$1" key="$2" want="$3" got
  got=$(get "$tag" "$key")
  if [[ "$got" == "$want" ]]; then
    echo "  ok   $tag → $key=$got"
  else
    echo "  FAIL $tag → $key: attendu '$want', obtenu '$got'"
    FAILED=1
  fi
}

expect_reject() {
  local tag="$1"
  if "$RESOLVE" "$tag" kbrdn1/kbrdn.dev >/dev/null 2>&1; then
    echo "  FAIL $tag aurait dû être rejeté"
    FAILED=1
  else
    echo "  ok   $tag rejeté"
  fi
}

echo "stable → prod"
expect v1.0.0 env prod
expect v1.0.0 prerelease false
expect v1.0.0 notes changelogs/1.0.0.md
expect v1.0.0 url https://kbrdn.dev
expect v1.0.0 image ghcr.io/kbrdn1/kbrdn.dev:v1.0.0
expect v10.20.30 notes changelogs/10.20.30.md

echo "candidat → preprod"
expect v1.1.0-rc.1 env preprod
expect v1.1.0-rc.1 prerelease true
expect v1.1.0-rc.1 notes changelogs/pre-releases/1.1.0-rc.1.md
expect v1.1.0-rc.1 url https://pre-prod.kbrdn.dev
expect v1.1.0-rc.1 image ghcr.io/kbrdn1/kbrdn.dev:v1.1.0-rc.1
expect v2.0.0-beta.3 env preprod
expect v2.0.0-alpha.12 env preprod

echo "core = version cible (ce que package.json doit porter)"
expect v1.1.0-rc.2 core 1.1.0
expect v1.1.0 core 1.1.0

echo "rejets — un candidat mal formé ne doit jamais tomber dans la branche prod"
expect_reject v1.1.0-rc          # pas de numéro de candidat
expect_reject v1.1.0-rc.1.2      # numéro non entier
expect_reject 1.0.0              # sans préfixe v
expect_reject v1.0               # pas un SemVer complet
expect_reject v1.0.0-nightly.1   # identifiant non supporté
expect_reject ""                 # rien
expect_reject v1.0.0-rc.01       # zéro initial interdit par SemVer
expect_reject v01.0.0            # idem sur le majeur
expect_reject v1.02.0            # idem sur le mineur
expect_reject v1.0.00            # idem sur le patch

echo "les zéros légitimes passent toujours"
expect v0.1.0 env prod
expect v1.0.0-rc.10 env preprod

if [[ $FAILED -eq 0 ]]; then
  echo "PASS"
else
  echo "FAIL"
fi
exit $FAILED
