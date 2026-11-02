#!/usr/bin/env bash
# Check de resolve-main-push.sh : c'est lui qui décide si un push sur main
# déploie la prod. Une erreur dans un sens rejoue le double déploiement des
# releases (#139), dans l'autre elle coupe le filet des pushes sans bump.
#
# usage: scripts/resolve-main-push.test.sh
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESOLVE="$HERE/resolve-main-push.sh"
FAILED=0

REPO=$(mktemp -d)
trap 'rm -rf "$REPO"' EXIT
cd "$REPO" || exit 1
git init -q
git config user.email check@example.invalid
git config user.name check

# commit <json> : commite ce package.json, affiche le sha
commit() {
  printf '%s\n' "$1" > package.json
  git add package.json
  git commit -q --allow-empty -m x
  git rev-parse HEAD
}

# expect <libellé> <before> <after> <deploy attendu>
expect() {
  local got
  got=$("$RESOLVE" "$2" "$3" 2>/dev/null | grep '^deploy=' | cut -d= -f2)
  if [[ "$got" == "$4" ]]; then
    echo "  ok   $1 → deploy=$got"
  else
    echo "  FAIL $1 → attendu deploy=$4, obtenu '$got'"
    FAILED=1
  fi
}

A=$(commit '{"name":"x","version":"1.0.0"}')
B=$(commit '{"name":"x","version":"1.1.0"}')
C=$(commit '{"name":"x","version":"1.1.0","dependencies":{"nuxt":"4"}}')
D=$(commit '{"name":"x","version":"1.1.0","dependencies":{"nuxt":"4"}}')
UNVERSIONED=$(commit '{"name":"x"}')
REVERTED=$(commit '{"name":"x","version":"1.0.0"}')
V1_9=$(commit '{"name":"x","version":"1.9.0"}')
V1_10=$(commit '{"name":"x","version":"1.10.0"}')

echo "bump de version → le tag déploie"
expect "merge de release" "$A" "$B" false
expect "push de plusieurs commits" "$A" "$D" false
expect "1.9.0 → 1.10.0 (ordre de version, pas lexical)" "$V1_9" "$V1_10" false

echo "version inchangée ou redescendue → filet"
expect "push sans bump" "$C" "$D" true
expect "bump de dépendance seul" "$B" "$C" true
expect "revert d'une release (1.1.0 → 1.0.0)" "$D" "$REVERTED" true
expect "1.10.0 → 1.9.0" "$V1_10" "$V1_9" true

echo "dans le doute, on déploie"
expect "before nul (branche créée)" 0000000000000000000000000000000000000000 "$B" true
expect "before vide" "" "$B" true
expect "before introuvable (force-push)" deadbeefdeadbeefdeadbeefdeadbeefdeadbeef "$B" true
expect "version absente avant" "$UNVERSIONED" "$B" true
expect "version absente après" "$D" "$UNVERSIONED" true

if [[ "$FAILED" -ne 0 ]]; then
  echo "resolve-main-push: échecs"
  exit 1
fi
echo "resolve-main-push: tout passe"
