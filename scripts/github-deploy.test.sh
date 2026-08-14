#!/usr/bin/env bash
# Check de github-deploy.sh — c'est le point d'entrée root du pipeline de
# déploiement. Ce qu'on vérifie : l'allowlist ne laisse pas passer une variable
# capable de détourner l'exécution (PATH en tête), et les commandes réellement
# émises par les workflows continuent de fonctionner.
#
# usage: scripts/github-deploy.test.sh
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FAILED=0

# `deploy` et `rollback` finissent par un `exec /srv/deploy.sh` absent en local.
# On neutralise ça avec un faux /srv via PATH ? Non : le chemin est absolu. On
# se limite donc aux chemins qui n'exécutent pas deploy.sh (refus d'une
# variable, action inconnue, ping), plus une vérification que les variables
# autorisées sont bien exportées — via `ping`, qui n'exec rien.
run() {  # run <SSH_ORIGINAL_COMMAND> ; imprime stdout+stderr, renvoie le code
  SSH_ORIGINAL_COMMAND="$1" bash "$HERE/github-deploy.sh" 2>&1
}

expect_reject() {  # une variable hors allowlist doit faire échouer AVANT tout exec
  local desc="$1" cmd="$2" out rc
  out=$(run "$cmd"); rc=$?
  if [[ $rc -ne 0 ]] && grep -q "variable refusée" <<< "$out"; then
    echo "  ok   $desc"
  else
    echo "  FAIL $desc — rc=$rc, sortie: $out"
    FAILED=1
  fi
}

expect_ok() {  # doit aboutir (chemins sans exec)
  local desc="$1" cmd="$2" needle="$3" out rc
  out=$(run "$cmd"); rc=$?
  if [[ $rc -eq 0 ]] && grep -q "$needle" <<< "$out"; then
    echo "  ok   $desc"
  else
    echo "  FAIL $desc — rc=$rc, sortie: $out"
    FAILED=1
  fi
}

echo "variables hors allowlist refusées"
expect_reject "PATH détourné"        'PATH=/tmp/evil ENV=prod IMAGE=x deploy'
expect_reject "LD_PRELOAD"           'LD_PRELOAD=/tmp/x.so ENV=prod IMAGE=x deploy'
expect_reject "BASH_ENV"             'BASH_ENV=/tmp/x ENV=prod IMAGE=x ping'
expect_reject "IFS"                  'IFS=: ENV=prod IMAGE=x ping'
expect_reject "variable inconnue"    'TOTO=1 ping'

echo "commandes réellement émises par les workflows"
# Exactement ce que construisent deploy.yml et release.yml (secrets tronqués).
expect_ok "5 variables autorisées + ping" \
  'ENV=prod IMAGE=ghcr.io/kbrdn1/kbrdn.dev:v1.0.0 GITHUB_TOKEN=t RESEND_API_KEY=r NUXT_STUDIO_TOKEN=s ping' \
  'pong from'
expect_ok "secrets vides (NUXT_STUDIO_TOKEN non défini)" \
  'ENV=preprod IMAGE=ghcr.io/kbrdn1/kbrdn.dev:dev GITHUB_TOKEN=t RESEND_API_KEY= NUXT_STUDIO_TOKEN= ping' \
  'pong from'

echo "actions"
# Pas d'`expect_ok` ici : il attend rc=0, or une action inconnue doit sortir
# en non nul.
out=$(run 'ENV=prod frobnicate'); rc=$?
if [[ $rc -ne 0 ]] && grep -q "action inconnue" <<< "$out"; then
  echo "  ok   action inconnue → exit non nul"
else
  echo "  FAIL action inconnue — rc=$rc, sortie: $out"
  FAILED=1
fi

if [[ $FAILED -eq 0 ]]; then echo "PASS"; else echo "FAIL"; fi
exit $FAILED
