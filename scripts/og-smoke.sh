#!/usr/bin/env bash
# Smoke test des images OG (#44). Elles sont rendues à la requête par satori :
# ni le lint, ni le typecheck, ni le build ne les exécutent. Le reformatage
# oxfmt de #37 les a cassées deux fois sans que la CI bouge — un dégradé coupé
# sur deux lignes (/_og/* en 500), puis `@import 'tailwindcss'` en guillemets
# simples dans main.css (200, mais police de repli). Le statut attrape le
# premier, seule la comparaison à une référence attrape le second.
#
# Sert le build `.output`, lit l'og:image de chaque page, exige 200 +
# image/png, puis compare l'image à sa référence versionnée dans
# scripts/og-smoke/, octet par octet. Le rendu est déterministe d'une
# plateforme à l'autre : une référence générée sur macOS arm64 est identique
# au bit près à ce que sert la prod (linux x64).
#
# Un changement volontaire d'une image OG (texte du hero, article, composant
# satori) passe par une mise à jour explicite de la référence : `--update`,
# puis on commite les PNG.
#
# usage: scripts/og-smoke.sh [--update]      (après `bun run build`)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REF="$ROOT/scripts/og-smoke"
# Port fixe : l'URL OG de la home embarque l'origine (avatar, bannière). Les
# pixels n'en dépendent pas, mais une URL stable se rejoue à la main.
PORT=3939
BASE="http://127.0.0.1:$PORT"
UPDATE=false
[[ "${1:-}" == "--update" ]] && UPDATE=true

# nom:chemin — la home (Default avec avatar et bannière), l'index du blog
# (Default nu) et un article (Blog : tags, bannière, Fenix).
PAGES=(home:/ blog:/blog blog-gwm:/blog/gwm)

test -f "$ROOT/.output/server/index.mjs" || { echo "pas de build : lancer bun run build" >&2; exit 2; }

# Un serveur déjà présent sur le port répondrait à notre place et ferait passer
# le test sur autre chose que ce build.
if curl -s -m 2 -o /dev/null "$BASE"; then
  echo "le port $PORT est déjà occupé" >&2
  exit 2
fi

OUT="$(mktemp -d)"
# node et pas bun : sous bun, ipx ne résout pas `ofetch` depuis
# .output/server/node_modules et le serveur meurt au démarrage.
PORT=$PORT HOST=127.0.0.1 node "$ROOT/.output/server/index.mjs" > "$OUT/server.log" 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do
  curl -sf -m 5 -o /dev/null "$BASE/api/health" && break
  kill -0 $SERVER 2>/dev/null || { cat "$OUT/server.log" >&2; exit 1; }
  sleep 1
done
curl -sf -m 5 -o /dev/null "$BASE/api/health" || { echo "le serveur ne répond pas" >&2; cat "$OUT/server.log" >&2; exit 1; }

FAILED=0 DIFFERS=0
for entry in "${PAGES[@]}"; do
  name="${entry%%:*}" page="${entry#*:}"
  # og:image est absolu sur site.url (https://kbrdn.dev) : on garde le chemin
  # et on le demande au serveur local.
  # Le décodage de &amp; passe par sed : `${url//&amp;/&}` ne donne pas la
  # même chose en bash 3.2 (macOS) et en bash 5.2 (patsub_replacement).
  # `|| true` : sous set -e, un serveur mort ou un rendu bloqué (-m) ferait
  # sortir le script ici sans un mot. On veut la ligne FAIL et le log.
  html=$(curl -s -m 30 "$BASE$page") || true
  url=$(printf '%s' "$html" | sed -n 's/.*property="og:image" content="\([^"]*\)".*/\1/p' | head -1 | sed 's/&amp;/\&/g')
  if [[ -z "$url" ]]; then
    echo "  FAIL $page : pas de réponse, ou pas d'og:image dans la page"
    FAILED=1
    continue
  fi
  rel="/${url#*://*/}"
  got="$OUT/$name.png"
  meta=$(curl -s -m 30 -o "$got" -w '%{http_code} %{content_type}' "$BASE$rel") || true
  if [[ "$meta" != "200 image/png" ]]; then
    echo "  FAIL $page : $meta sur $rel"
    FAILED=1
    continue
  fi
  if $UPDATE; then
    mkdir -p "$REF" && cp "$got" "$REF/$name.png"
    echo "  maj  $page → scripts/og-smoke/$name.png"
  elif cmp -s "$got" "$REF/$name.png"; then
    echo "  ok   $page"
  else
    echo "  FAIL $page : l'image diffère de scripts/og-smoke/$name.png (obtenue : $got)"
    # Des octets différents pour des pixels identiques ne viennent que d'un
    # changement d'encodeur PNG : régénérer la référence suffit.
    command -v compare > /dev/null &&
      echo "       pixels différents (AE) : $(compare -metric AE "$got" "$REF/$name.png" null: 2>&1)"
    FAILED=1 DIFFERS=1
  fi
done

if [[ $FAILED -eq 0 ]]; then
  rm -rf "$OUT"
else
  # Un 500 de satori laisse sa trace ici, pas dans la réponse.
  echo "--- server.log"
  tail -20 "$OUT/server.log"
fi
[[ $DIFFERS -eq 1 ]] &&
  echo "changement voulu ? scripts/og-smoke.sh --update, puis commiter scripts/og-smoke/*.png"
exit $FAILED
