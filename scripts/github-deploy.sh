#!/usr/bin/env bash
# wrapper restreint pour la clé github-actions
#
# ⚠️ COPIE DE RÉFÉRENCE. Le fichier qui s'exécute vit sur le VPS en
# /srv/github-deploy.sh, imposé par un ForceCommand dans authorized_keys :
#
#   restrict,command="/srv/github-deploy.sh" ssh-ed25519 AAAA...
#
# Il n'était versionné nulle part — la pièce centrale du pipeline de
# déploiement était donc invisible depuis le repo et non reproductible. Cette
# copie corrige ça ; elle n'est pas déployée automatiquement, cf. la section
# « Synchroniser le VPS » de docs/RELEASE.md.
#
# Chaîne complète, du CI au conteneur :
#
#   ssh root@vps "ENV=prod IMAGE=ghcr.io/... GITHUB_TOKEN=... deploy"
#     └─ ForceCommand ignore la commande du client et lance ce fichier,
#        la commande d'origine restant lisible dans $SSH_ORIGINAL_COMMAND
#     └─ ici : les tokens `clé=valeur` sont exportés, le premier token nu
#        (`deploy` / `rollback` / `status` / `ping`) devient l'action
#     └─ exec /srv/deploy.sh --env <env> --image <image>   (le moteur blue/green)
#
# C'est ce maillon qui réconcilie deux interfaces en apparence incompatibles :
# le workflow passe sa configuration par variables d'environnement, alors que
# scripts/deploy.sh attend des flags.
#
# Note de durcissement (non appliquée, à faire depuis le VPS où c'est testable) :
# `export "$tok"` accepte n'importe quelle variable, `PATH` compris — or
# deploy.sh résout `docker`, `nginx` et `systemctl` via le PATH, en root. Une
# allowlist (ENV, IMAGE, GITHUB_TOKEN, RESEND_API_KEY, NUXT_STUDIO_TOKEN)
# fermerait la porte. L'escalade suppose déjà la clé privée SSH — donc un
# attaquant capable de déployer l'image de son choix en root — mais le coût du
# correctif est faible.
set -euo pipefail
ORIG="${SSH_ORIGINAL_COMMAND:-}"
declare -a CMD=()
for tok in $ORIG; do
  if [[ "$tok" == *=* && "$tok" != *' '* ]]; then
    export "$tok"
  else
    CMD+=("$tok")
  fi
done
ACTION="${CMD[0]:-deploy}"
case "$ACTION" in
  deploy)
    : "${ENV:?ENV requis (prod|preprod)}"
    : "${IMAGE:?IMAGE requis (ghcr.io/...)}"
    exec /srv/deploy.sh --env "$ENV" --image "$IMAGE" ;;
  rollback)
    : "${ENV:?ENV requis (prod|preprod)}"
    exec /srv/deploy.sh --env "$ENV" --rollback ;;
  status)
    docker ps --filter "label=kbrdn.env" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' ;;
  ping)
    echo "pong from $(hostname) at $(date -Is)" ;;
  *)
    echo "action inconnue: $ACTION (attendu: deploy|rollback|status|ping)" >&2; exit 1 ;;
esac
