# Release — kbrdn.dev

Protocole de publication d'une version. Reprend le layout de changelog de
[`gwm-cli`](https://github.com/kbrdn1/gwm-cli) et le versioning de `kbrdn-docs`,
avec un étage **preprod** qu'aucun des deux n'a : ici le tag ne publie pas
seulement une release, **il déploie**.

## Vue d'ensemble

```
push dev          → image :dev           → preprod    itération quotidienne (deploy.yml)
push main         → image :main          → prod       filet, cf. note plus bas
tag v1.1.0-rc.1   → image :v1.1.0-rc.1   → preprod    candidat figé + pre-release GitHub
tag v1.1.0        → image :v1.1.0        → prod       release GitHub
```

Les images de tag sont **immutables** : `:dev` et `:main` désignent « le
dernier », `:v1.1.0` désigne 1.1.0 pour toujours. C'est ce qui rend un retour
arrière vers une version précise possible.

`deploy.yml` déclenche sur `push: branches`, `release.yml` sur `push: tags` —
les deux ne se réveillent jamais ensemble.

## Knobs du repo

| Knob | Valeur ici |
|---|---|
| Fichier de version | `package.json` (`version`), vérité unique |
| Fichier de changelog | `changelogs/X.Y.Z.md` (**sans** préfixe `v`) |
| Candidats | `changelogs/pre-releases/X.Y.Z-rc.N.md` |
| Branches | `dev` → `main` |
| `main` protégée | **oui** — PR, 1 approbation, 4 checks, historique linéaire |
| Qui publie la release | **la CI** (`release.yml` sur le tag) — ne rien créer à la main |
| Gate de vérif | `bun run lint` + `bun run build` (CI). **Pas de tests** dans ce repo, hors `scripts/*.test.sh` |
| Post-release | vérification `/api/health` automatique dans le workflow |

## Deux contraintes propres à ce repo

Elles ne sont pas dans le protocole générique `me:release` et bloquent le
premier cut si on les découvre en route.

### 1. `main` refuse les merge commits

`required_linear_history` est actif. Le `dev → main` en merge commit du
protocole générique **ne passe pas**. Deux options :

- **Rebase merge** (jamais squash — il écraserait les commits atomiques).
  `main` et `dev` porteront alors des sha différents pour le même contenu.
- **Désactiver `required_linear_history`** sur `main` pour s'aligner sur
  `gwm-cli` et `kbrdn-docs`, qui mergent en merge commit.

```bash
gh api repos/kbrdn1/kbrdn.dev/branches/main/protection --jq '.required_linear_history'
```

### 2. Toute PR vers `main` doit fermer une issue

Le check `Linked issue` de `validate-pr.yml` exige un `Closes #N` dans le corps
de la PR. **Chaque cut de version a donc besoin de sa propre issue de
release** — sans elle, la PR `dev → main` reste rouge.

Le check `Branch convention`, lui, autorise déjà `dev → main` et `hotfix/* →
main`, il ne bloque pas.

## Protocole

### 1. Changelog, sur `dev`

```bash
git checkout dev && git pull --ff-only origin dev
/changelog 1.1.0
```

`## [Unreleased]` migre vers `changelogs/1.1.0.md`, le `CHANGELOG.md` racine
repart avec un `[Unreleased]` vide et gagne sa ligne sous `## Past releases`.

### 2. Bump

`package.json` → `"version": "1.1.0"`. C'est la seule vérité de version ;
`release.yml` refuse de publier si le tag ne correspond pas.

Un candidat `1.1.0-rc.2` est un candidat **de 1.1.0** : `package.json` porte
`1.1.0`, le suffixe ne vit que dans le tag. La comparaison se fait sur le cœur
du SemVer.

```
🔖 chore(release): v1.1.0
```

### 3. Candidat sur preprod (optionnel mais recommandé)

Depuis `dev`, une fois le changelog et le bump commités :

```bash
# les notes du candidat doivent exister, le workflow les exige
/changelog 1.1.0-rc.1          # → changelogs/pre-releases/1.1.0-rc.1.md
git tag -a v1.1.0-rc.1 -m "v1.1.0-rc.1" && git push origin v1.1.0-rc.1
```

`release.yml` construit `:v1.1.0-rc.1`, la déploie sur
https://pre-prod.kbrdn.dev, vérifie `/api/health`, puis ouvre une pre-release.
Valider dessus avant de continuer.

### 4. `dev` → `main`

Ouvrir une PR (obligatoire, cf. contrainte 2), corps contenant `Closes #<issue
de release>`, titre au format conventionnel :

```
🔖 chore(release): v1.1.0
```

Attendre les 4 checks verts, puis merger — **rebase merge**, jamais squash
(sauf si `required_linear_history` a été désactivé, auquel cas merge commit).

### 5. Tag, depuis `main`, APRÈS le merge

```bash
git checkout main && git pull --ff-only origin main
git tag -a v1.1.0 -m "v1.1.0"
git push origin v1.1.0
```

⛔ **Jamais avant le merge** : le tag doit pointer un commit qui porte déjà le
bump et le changelog, sinon la publication n'est pas reproductible depuis le
tag.

Le push du tag suffit — `release.yml` prend la suite : image `:v1.1.0`, deploy
prod, vérification `/api/health`, puis release GitHub avec
`--notes-file changelogs/1.1.0.md` et pour titre `v1.1.0` seul.

**Ne rien créer à la main.** Un `gh release create` doublerait la publication.

### 6. Vérifier

```bash
curl -s https://kbrdn.dev/api/health | jq
# { "status": "ok", "version": "1.1.0", "sha": "...", "env": "prod" }
```

Le workflow le fait déjà et échoue avant de publier la release si le compte n'y
est pas — cette commande sert à contrôler après coup, ou à répondre à « quelle
version est live ».

## Revenir en arrière

Deux mécanismes, à ne pas confondre :

```bash
# d'un cran, instantané : redémarre la couleur précédente, conservée stoppée
ssh <vps> 'ENV=prod rollback'

# vers une version précise, depuis le registry
ssh <vps> 'deploy.sh --env prod --image ghcr.io/kbrdn1/kbrdn.dev:v1.0.0'
```

Le second est le seul qui traverse plusieurs versions et le seul qui survive à
une perte des conteneurs.

Relancer `release.yml` en `workflow_dispatch` sur un ancien tag fonctionne
aussi, mais reconstruit l'image et tente de recréer une release qui existe déjà.

## Notes

- **La release est un snapshot.** Corriger `changelogs/X.Y.Z.md` après coup ne
  la met pas à jour : `gh release edit vX.Y.Z --notes-file changelogs/X.Y.Z.md`.
- **`deploy.yml` a un `paths-ignore` sur `**.md` et `docs/**`.** Un merge de
  release qui ne toucherait que du markdown ne redéploierait pas prod par ce
  chemin — raison de plus pour que le déploiement de prod appartienne au tag.
- **Point ouvert : le wrapper VPS.** `deploy.yml` et `release.yml` envoient
  `ENV=... IMAGE=... deploy` en SSH, c'est-à-dire une commande nue configurée
  par variables d'environnement, alors que `scripts/deploy.sh` de ce repo parse
  des flags. Il existe donc un wrapper sur le VPS, ou une copie qui a drifté.
  Les changements de `scripts/deploy.sh` (rollback, label de version, sonde
  `/api/health`) doivent être propagés à ce qui tourne réellement là-bas, sinon
  ils n'ont aucun effet.

  ```bash
  ssh root@<VPS_HOST> 'type deploy rollback; cat $(command -v deploy)'
  ```
