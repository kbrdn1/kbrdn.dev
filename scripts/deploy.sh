#!/usr/bin/env bash
# blue/green deploy zéro-downtime pour kbrdn.dev (prod + preprod)
#
# usage:
#   deploy.sh --env prod    --image ghcr.io/kbrdn1/kbrdn.dev:main
#   deploy.sh --env preprod --image ghcr.io/kbrdn1/kbrdn.dev:dev
#   deploy.sh --env prod    --image ghcr.io/kbrdn1/kbrdn.dev:v1.0.0   # version précise
#   deploy.sh --env prod    --build              # build local, sans registry
#   deploy.sh --env prod    --skip-build         # redeploie l'image actuelle
#   deploy.sh --env prod    --rollback           # redémarre la couleur précédente
#
# deux façons de revenir en arrière, à ne pas confondre :
#   --rollback              rebascule sur la couleur précédente, conservée
#                           stoppée par le dernier deploy. Instantané, mais ne
#                           remonte que d'un cran.
#   --image ...:vX.Y.Z      redéploie une version précise depuis le registry.
#                           Seule option qui traverse plusieurs versions, et la
#                           seule qui survive à une perte des conteneurs — les
#                           tags de version sont immutables (cf. release.yml).
#
# env vars consommées (passées au conteneur runtime):
#   GITHUB_TOKEN       (obligatoire pour github contribs)
#   RESEND_API_KEY     (obligatoire pour contact form)
#   NUXT_STUDIO_TOKEN  (optionnel)

set -euo pipefail

log()  { printf '\033[1;34m[deploy %s]\033[0m %s\n' "${ENV:-?}" "$*"; }
warn() { printf '\033[1;33m[deploy %s]\033[0m %s\n' "${ENV:-?}" "$*" >&2; }
die()  { printf '\033[1;31m[deploy %s]\033[0m %s\n' "${ENV:-?}" "$*" >&2; exit 1; }

# Attend qu'un conteneur passe healthy. Renvoie 1 au lieu de mourir : le deploy
# et le rollback n'ont pas le même ménage à faire en cas d'échec (l'un détruit
# le conteneur neuf, l'autre doit laisser la couleur courante en place).
wait_healthy() {
  local name="$1" deadline=$((SECONDS + 90)) s=""
  log "attente healthy de $name (timeout 90s)"
  while (( SECONDS < deadline )); do
    s=$(docker inspect -f '{{.State.Health.Status}}' "$name" 2>/dev/null || echo missing)
    if [[ "$s" == healthy ]]; then
      log "$name healthy"
      return 0
    fi
    sleep 2
  done
  warn "$name pas healthy (state=$s) — logs:"
  docker logs --tail=50 "$name" >&2 || true
  return 1
}

[[ $EUID -eq 0 ]] || die "doit être lancé en root (modifie nginx)"

ENV=""
IMAGE=""
ACTION="deploy"  # deploy | rollback
BUILD_LOCAL=0
SKIP_BUILD=0
BUILD_CONTEXT="/srv/kbrdn.dev"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)        ENV="$2"; shift 2 ;;
    --image)      IMAGE="$2"; shift 2 ;;
    --build)      BUILD_LOCAL=1; shift ;;
    --skip-build) SKIP_BUILD=1; shift ;;
    --rollback)   ACTION="rollback"; SKIP_BUILD=1; shift ;;
    --context)    BUILD_CONTEXT="$2"; shift 2 ;;
    # jusqu'à la première ligne vide, plutôt qu'une plage figée que le moindre
    # ajout à l'en-tête tronque en silence
    -h|--help)    sed -n '2,/^$/p' "$0"; exit 0 ;;
    *) die "flag inconnu: $1" ;;
  esac
done

[[ -n "$ENV" ]] || die "--env requis (prod|preprod)"

# configuration par environnement
case "$ENV" in
  prod)
    DOMAIN="kbrdn.dev"
    BLUE_PORT=3000
    GREEN_PORT=3001
    UPSTREAM_CONF="/etc/nginx/conf.d/kbrdn-upstream.conf"
    UPSTREAM_NAME="kbrdn_app"
    NAME_PREFIX="kbrdn-prod-"
    LEGACY_NAMES=("kbrdn-blue" "kbrdn-green" "kbrdndev-app-1")
    SITE_URL="https://kbrdn.dev"
    ;;
  preprod)
    DOMAIN="pre-prod.kbrdn.dev"
    BLUE_PORT=3002
    GREEN_PORT=3003
    UPSTREAM_CONF="/etc/nginx/conf.d/kbrdn-preprod-upstream.conf"
    UPSTREAM_NAME="kbrdn_preprod_app"
    NAME_PREFIX="kbrdn-preprod-"
    LEGACY_NAMES=()
    SITE_URL="https://pre-prod.kbrdn.dev"
    ;;
  *) die "env inconnu: $ENV (attendu: prod|preprod)" ;;
esac

[[ -f "$UPSTREAM_CONF" ]] || die "upstream conf manquante: $UPSTREAM_CONF"

# détecte couleur active via upstream
if grep -q "127.0.0.1:$BLUE_PORT" "$UPSTREAM_CONF" 2>/dev/null; then
  CUR=blue;  CUR_PORT=$BLUE_PORT
  NEW=green; NEW_PORT=$GREEN_PORT
else
  CUR=green; CUR_PORT=$GREEN_PORT
  NEW=blue;  NEW_PORT=$BLUE_PORT
fi
CUR_NAME="${NAME_PREFIX}${CUR}"
NEW_NAME="${NAME_PREFIX}${NEW}"
log "actif: $CUR (:$CUR_PORT) — cible: $NEW (:$NEW_PORT)"

if [[ "$ACTION" == "rollback" ]]; then
  # `ps -a` et non `ps` : depuis que le deploy conserve la couleur sortante au
  # lieu de la supprimer, elle est là mais stoppée. Avant ce changement, le
  # deploy la détruisait et ce rollback ne pouvait qu'échouer au repos.
  docker ps -aq --filter "name=^${NEW_NAME}$" | grep -q . \
    || die "rollback impossible: $NEW_NAME absent — viser une version précise avec --image ghcr.io/kbrdn1/kbrdn.dev:vX.Y.Z"

  if ! docker ps -q --filter "name=^${NEW_NAME}$" | grep -q .; then
    log "redémarrage de $NEW_NAME (conservé stoppé par le dernier deploy)"
    docker start "$NEW_NAME" >/dev/null
  fi

  wait_healthy "$NEW_NAME" || die "rollback abandonné, $CUR reste actif"
  log "rollback vers $NEW"
else
  if [[ $BUILD_LOCAL -eq 1 ]]; then
    [[ -d "$BUILD_CONTEXT" ]] || die "context build manquant: $BUILD_CONTEXT"
    log "build local depuis $BUILD_CONTEXT"
    docker compose -f "$BUILD_CONTEXT/docker-compose.yml" build app
    IMAGE="kbrdndev-app:latest"
  elif [[ $SKIP_BUILD -eq 0 ]]; then
    [[ -n "$IMAGE" ]] || die "--image requis (ou --build pour build local)"
    log "pull $IMAGE"
    docker pull "$IMAGE" >/dev/null
  fi

  : "${IMAGE:?--image ou --build requis}"

  docker rm -f "$NEW_NAME" >/dev/null 2>&1 || true

  log "start $NEW_NAME sur 127.0.0.1:$NEW_PORT (image=$IMAGE)"
  docker run -d \
    --name "$NEW_NAME" \
    --restart unless-stopped \
    --label "kbrdn.env=$ENV" \
    --label "kbrdn.color=$NEW" \
    --label "kbrdn.version=${IMAGE##*:}" \
    -e NODE_ENV=production \
    -e HOST=0.0.0.0 \
    -e PORT=3000 \
    -e NUXT_PUBLIC_SITE_URL="$SITE_URL" \
    -e NUXT_APP_ENV="$ENV" \
    -e GITHUB_TOKEN="${GITHUB_TOKEN:-}" \
    -e RESEND_API_KEY="${RESEND_API_KEY:-}" \
    -e NUXT_STUDIO_TOKEN="${NUXT_STUDIO_TOKEN:-}" \
    -p "127.0.0.1:$NEW_PORT:3000" \
    --health-cmd "wget -q -O /dev/null http://127.0.0.1:3000/api/health" \
    --health-interval=5s \
    --health-timeout=3s \
    --health-retries=3 \
    --health-start-period=15s \
    "$IMAGE" >/dev/null

  if ! wait_healthy "$NEW_NAME"; then
    docker rm -f "$NEW_NAME" >/dev/null 2>&1 || true
    die "deploy abandonné, $CUR reste actif"
  fi
fi

# swap atomique upstream
log "swap nginx upstream → :$NEW_PORT"
tmp=$(mktemp)
cat > "$tmp" <<EOF
# upstream $DOMAIN - mis à jour par deploy.sh (couleur: $NEW)
upstream $UPSTREAM_NAME {
    server 127.0.0.1:$NEW_PORT;
    keepalive 32;
}
EOF
mv "$tmp" "$UPSTREAM_CONF"
if ! nginx -t 2>/dev/null; then
  warn "nginx -t fail — restore :$CUR_PORT"
  cat > "$UPSTREAM_CONF" <<EOF
upstream $UPSTREAM_NAME {
    server 127.0.0.1:$CUR_PORT;
    keepalive 32;
}
EOF
  nginx -t || true
  [[ "$ACTION" != rollback ]] && docker rm -f "$NEW_NAME" >/dev/null 2>&1 || true
  die "nginx refuse la config"
fi
systemctl reload nginx

log "drain 5s avant stop ancien"
sleep 5

# La couleur sortante est stoppée mais CONSERVÉE : c'est elle que `--rollback`
# redémarre. Elle était supprimée jusqu'ici, ce qui rendait le rollback
# impossible dès que le déploiement précédent s'était bien passé.
# Pas d'accumulation pour autant : le `docker rm -f "$NEW_NAME"` en début de
# deploy nettoie celle du cycle d'avant, il n'y en a jamais plus d'une.
if docker ps -q --filter "name=^${CUR_NAME}$" | grep -q .; then
  log "stop $CUR_NAME (conservé pour rollback)"
  docker stop "$CUR_NAME" >/dev/null 2>&1 || true
fi

# Les noms legacy, eux, n'ont pas vocation à revenir.
if [[ ${#LEGACY_NAMES[@]} -gt 0 ]]; then
  for name in "${LEGACY_NAMES[@]}"; do
    if docker ps -aq --filter "name=^${name}$" | grep -q .; then
      log "suppression du conteneur legacy $name"
      docker rm -f "$name" >/dev/null 2>&1 || true
    fi
  done
fi

# coupe les compose projects legacy
if [[ -f /srv/kbrdn.dev/docker-compose.yml ]] && docker compose -f /srv/kbrdn.dev/docker-compose.yml ps -q 2>/dev/null | grep -q .; then
  docker compose -f /srv/kbrdn.dev/docker-compose.yml down --remove-orphans 2>&1 | sed 's/^/  /' || true
fi

log "deploy terminé. actif: $NEW (:$NEW_PORT) sur $DOMAIN"
docker ps --filter "label=kbrdn.env=$ENV" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
