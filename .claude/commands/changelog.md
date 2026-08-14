---
description: "Migre [Unreleased] vers changelogs/<version>.md et réamorce le root"
argument-hint: "X.Y.Z | X.Y.Z-rc.N"
allowed-tools: Bash(git :*), Read, Write, Edit
---

# /changelog — kbrdn.dev

Étape 1 du protocole de release ([`docs/RELEASE.md`](../../docs/RELEASE.md)).

Arguments : `$ARGUMENTS` — la version (`1.1.0`) ou le candidat (`1.1.0-rc.1`).

## Format du repo

Un fichier par version, **sans préfixe `v`** :

- stable → `changelogs/X.Y.Z.md`
- candidat → `changelogs/pre-releases/X.Y.Z-rc.N.md`

Chaque fichier commence par `# [X.Y.Z] - YYYY-MM-DD`, suivi d'un paragraphe de
résumé puis des sections `### Added` / `### Changed` / `### Fixed`. **En
anglais.** Les entrées disent ce qui était cassé et pourquoi, pas seulement ce
qui change — cf. `changelogs/` et les fichiers de `gwm-cli` / `kbrdn-docs`.

Le `CHANGELOG.md` racine ne porte que la section `## [Unreleased]` en cours,
plus l'index `## Past releases`.

## Étapes

1. **Rassembler la matière** :

   ```bash
   git log --no-merges --pretty='%h %s' origin/main..dev
   ```

   Se baser sur les commits réels et les issues qu'ils référencent. Ne rien
   inventer, ne pas réécrire les versions passées.

2. **Rédiger** la section dans `## [Unreleased]` du `CHANGELOG.md` racine, si
   ce n'est pas déjà fait au fil de l'eau.

3. **Migrer** : déplacer le contenu de `## [Unreleased]` vers le fichier de
   version, en remplaçant le titre par `# [X.Y.Z] - YYYY-MM-DD` (date du jour).

4. **Réamorcer** le root : `## [Unreleased]` redevient vide, et la version
   rejoint l'index `## Past releases` :

   ```markdown
   ## Past releases

   - [1.1.0](changelogs/1.1.0.md) — 2026-08-20
   - [1.0.0](changelogs/1.0.0.md) — 2026-08-14
   ```

   Un candidat ne touche **pas** l'index ni le root : il photographie
   `[Unreleased]` dans `changelogs/pre-releases/` et le laisse en place, la
   version stable qui suit reprendra la même matière.

## Pourquoi pas `changelog-generator split`

La skill `changelog-generator` sait faire un `split`, mais pas vers ce format :
`renderVersion` réécrit le contenu en `# Version X.Y.Z` + `## Features` /
`## Fixes` / `## Chores`, ne retient comme détail que les lignes préfixées `>`,
et déduit la catégorie d'un marqueur en gras — les sections `### Added` sont
ignorées et la prose est perdue. C'est bien pour ça que les fichiers de
`gwm-cli` et `kbrdn-docs` sont au format `# [X.Y.Z] - date` : ils ne sortent
pas de cet outil.

Et son `--clean` supprime tout `.md` de `changelogs/` absent du `CHANGELOG.md`
courant (`findOrphans`). Comme le root ne garde qu'`[Unreleased]`, un second cut
effacerait **toutes** les versions déjà publiées — et le tag suivant échouerait
sur le `test -f "$NOTES"` de `release.yml`.

La migration est une copie de section : la faire à la main coûte moins cher que
de contourner un outil qui vise un autre format.

## Garde-fous

- Le fichier de notes **doit** exister avant de pousser le tag : `release.yml`
  refuse de publier sans lui, après le build mais avant le déploiement.
- La release GitHub est un snapshot — corriger le `.md` après coup ne la met pas
  à jour (`gh release edit vX.Y.Z --notes-file changelogs/X.Y.Z.md`).
