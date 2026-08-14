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
set -euo pipefail
ORIG="${SSH_ORIGINAL_COMMAND:-}"

# Allowlist des variables acceptées. Sans elle, `export "$tok"` prend
# n'importe quoi, `PATH` compris — et deploy.sh résout `docker`, `nginx` et
# `systemctl` par le PATH, en root : un `PATH=/tmp/x deploy` exécuterait des
# binaires choisis par l'appelant. L'escalade suppose déjà la clé privée SSH,
# donc quelqu'un qui peut de toute façon déployer l'image de son choix, mais
# refermer la porte ne coûte rien.
#
# Refus explicite plutôt qu'ignorance silencieuse : une variable inattendue
# signale un workflow désynchronisé, ça doit se voir.
ALLOWED_VARS=(ENV IMAGE GITHUB_TOKEN RESEND_API_KEY NUXT_STUDIO_TOKEN)

declare -a CMD=()
for tok in $ORIG; do
  if [[ "$tok" == *=* && "$tok" != *' '* ]]; then
    key="${tok%%=*}"
    allowed=0
    for ok in "${ALLOWED_VARS[@]}"; do
      # `if` et non `[[ ... ]] && ...` : en dernière commande du corps de
      # boucle, l'AND-list renvoie 1 quand la condition est fausse et `set -e`
      # tuerait le script au premier nom qui ne correspond pas.
      if [[ "$key" == "$ok" ]]; then allowed=1; break; fi
    done
    if [[ "$allowed" -ne 1 ]]; then
      echo "variable refusée: $key (autorisées: ${ALLOWED_VARS[*]})" >&2
      exit 1
    fi
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
