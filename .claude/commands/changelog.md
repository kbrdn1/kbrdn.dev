---
description: "Génère le changelog (extract → rédaction → split), rangé dans changelogs/"
argument-hint: "X.Y.Z [--entries=verbose|normal|short] [--version=verbose|normal|short|null] [--base=main] [--compare=dev]"
allowed-tools: Bash(changelog-generator:*), Bash(git :*), Bash(bun :*), Read, Write, Edit
---

# /changelog — kbrdn.dev

Config (gravée dans `changelog.config.json`, surchargeable par flags) :
- Entrées **verbose** · Détails version **normal** · base **main** → compare **dev** · sortie `./changelogs`.

Format du repo (à respecter) : **Keep a Changelog** (`## [X.Y.Z] - YYYY-MM-DD`, sections `### Added/Changed/Fixed/Docs`), fichiers **sans préfixe `v`** (`changelogs/X.Y.Z.md`), pré-releases dans `changelogs/pre-releases/X.Y.Z-rc.N.md`, **langue EN**. Pré-release = suffixe `-rc.N` / `-beta.N` / `-alpha.N`.

Arguments : `$ARGUMENTS` (1er = version `X.Y.Z` ou `X.Y.Z-rc.N` ; flags optionnels d'override).

## Étapes

1. **Extract** : `changelog-generator extract --base main --compare dev` → `git-log.txt`.
2. **Rédaction** : écrire la section de la version dans `CHANGELOG.md` au format Keep a Changelog (EN), verbosité **verbose** (titre + `#issue` / `[#pr]` + contexte technique : ce qui était cassé, pourquoi, ce qui change). En-tête de version **normal**.
3. **Split** : `changelog-generator split --output-dir ./changelogs --clean` → `changelogs/X.Y.Z.md` (pré-release → `changelogs/pre-releases/`).
4. Vérifier que le root `CHANGELOG.md` ne garde qu'un `[Unreleased]` vide + l'index `## Past releases` mis à jour.

## Garde-fous

- Evidence-based : se baser sur `git-log.txt` réel, ne rien inventer, ne pas réécrire les versions passées.
- Le fichier de notes **doit** exister avant de pousser le tag : `release.yml` refuse de publier sans lui (`test -f`), et il échoue **après** le build mais **avant** le déploiement.
- Étape 1 du protocole de release — la suite est dans [`docs/RELEASE.md`](../../docs/RELEASE.md) et dans le skill `me:release`.
