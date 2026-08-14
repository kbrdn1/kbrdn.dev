#!/usr/bin/env bash
# Résout un tag de release en cible de déploiement, statut pre-release et
# chemin de notes. Émet des lignes `clé=valeur` sur stdout, au format attendu
# par $GITHUB_OUTPUT.
#
#   v1.1.0        →  env=prod     prerelease=false  notes=changelogs/1.1.0.md
#   v1.1.0-rc.2   →  env=preprod  prerelease=true   notes=changelogs/pre-releases/1.1.0-rc.2.md
#
# Vit ici et pas inline dans release.yml pour être rejouable hors CI —
# `scripts/resolve-release-tag.test.sh` en dépend.
#
# usage: resolve-release-tag.sh <tag> [repository]
set -euo pipefail

TAG="${1:-}"
REPO="${2:-${GITHUB_REPOSITORY:-kbrdn1/kbrdn.dev}}"
REGISTRY="${REGISTRY:-ghcr.io}"

if [[ -z "$TAG" ]]; then
  echo "usage: $0 <vX.Y.Z[-rc.N]> [owner/repo]" >&2
  exit 2
fi

if [[ "$TAG" != v* ]]; then
  echo "tag attendu sous la forme vX.Y.Z, reçu: $TAG" >&2
  exit 1
fi

VERSION="${TAG#v}"

if [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+-(rc|alpha|beta)\.[0-9]+$ ]]; then
  ENV=preprod
  PRERELEASE=true
  NOTES="changelogs/pre-releases/${VERSION}.md"
elif [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  ENV=prod
  PRERELEASE=false
  NOTES="changelogs/${VERSION}.md"
else
  echo "version non reconnue: $VERSION (attendu X.Y.Z ou X.Y.Z-rc.N / -alpha.N / -beta.N)" >&2
  exit 1
fi

if [[ "$ENV" == prod ]]; then
  URL="https://kbrdn.dev"
else
  URL="https://pre-prod.kbrdn.dev"
fi

# `tr` plutôt que ${REPO,,} : bash 3.2 (macOS par défaut) ne connaît pas
# l'expansion en minuscules, et ce script doit tourner hors CI.
REPO_LC=$(printf '%s' "$REPO" | tr '[:upper:]' '[:lower:]')

cat <<EOF
tag=$TAG
version=$VERSION
core=${VERSION%%-*}
env=$ENV
prerelease=$PRERELEASE
notes=$NOTES
url=$URL
image=${REGISTRY}/${REPO_LC}:${TAG}
EOF
