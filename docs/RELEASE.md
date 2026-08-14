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

⚠️ **L'ordre compte.** La migration du changelog vide `[Unreleased]` : la faire
avant de couper un candidat ne laisserait rien à photographier. Le candidat
passe donc **avant**, et la migration stable ne vient qu'après sa validation.

### 1. Bump, sur `dev`

```bash
git checkout dev && git pull --ff-only origin dev
```

`package.json` → `"version": "1.1.0"`. C'est la seule vérité de version ;
`release.yml` refuse de publier si le tag ne correspond pas.

Un candidat `1.1.0-rc.2` est un candidat **de 1.1.0** : `package.json` porte
`1.1.0`, le suffixe ne vit que dans le tag. La comparaison se fait sur le cœur
du SemVer.

À ce stade, `## [Unreleased]` doit décrire ce que la version apporte — c'est
elle qui deviendra les notes.

```
🔖 chore(release): v1.1.0
```

### 2. Candidat sur preprod (optionnel mais recommandé)

```bash
# photographie [Unreleased] sans la vider — le workflow exige ce fichier
/changelog 1.1.0-rc.1          # → changelogs/pre-releases/1.1.0-rc.1.md
git tag -a v1.1.0-rc.1 -m "v1.1.0-rc.1" && git push origin v1.1.0-rc.1
```

`release.yml` construit `:v1.1.0-rc.1`, la déploie sur
https://pre-prod.kbrdn.dev, vérifie `/api/health`, puis ouvre une pre-release.
Valider dessus avant de continuer.

Un correctif trouvé sur le candidat se commite sur `dev`, complète
`[Unreleased]`, et donne un `-rc.2`.

### 3. Migrer le changelog, une fois le candidat validé

```bash
/changelog 1.1.0
```

`## [Unreleased]` migre vers `changelogs/1.1.0.md`, le `CHANGELOG.md` racine
repart avec un `[Unreleased]` vide et gagne sa ligne sous `## Past releases`.

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
tag. `release.yml` le vérifie — un tag stable qui n'est pas un ancêtre de
`origin/main` est refusé avant tout build, donc un `vX.Y.Z` posé sur `dev` ne
déploiera pas la production.

Les déploiements vers un même environnement sont sérialisés entre `deploy.yml`
et `release.yml` (clé de concurrence partagée) : le merge réveille le premier,
le tag le second, et sans ça les deux `deploy.sh --env prod` se disputeraient
les mêmes conteneurs.

Republier un tag existant (`workflow_dispatch`) **ne reconstruit pas** l'image :
le tag de registre est mutable, mais l'artefact d'origine est conservé et
redéployé tel quel. C'est aussi le rattrapage si un run de release est annulé :
GitHub Actions ne garde qu'un job en attente par groupe de concurrence, donc
trois déploiements qui se chevauchent sur un même environnement peuvent en
évincer un. Relancer le tag est sans effet de bord.

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
# ⚠️ ne marche qu'une fois le VPS synchronisé (cf. « Synchroniser le VPS ») —
#    jusque-là la couleur sortante est détruite à chaque deploy
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
## La chaîne de déploiement

`deploy.yml` et `release.yml` envoient `ENV=... IMAGE=... deploy` en SSH — une
commande nue configurée par variables d'environnement — alors que
`scripts/deploy.sh` parse des flags. Les deux interfaces sont réconciliées par
un maillon qui ne se voyait pas depuis le repo :

```
ssh root@vps "ENV=prod IMAGE=ghcr.io/kbrdn1/kbrdn.dev:v1.1.0 GITHUB_TOKEN=... deploy"
  └─ authorized_keys : restrict,command="/srv/github-deploy.sh"
       ForceCommand ignore la commande du client ; elle reste lisible
       dans $SSH_ORIGINAL_COMMAND
  └─ /srv/github-deploy.sh   exporte les `clé=valeur`, prend le premier token nu
                             comme action (deploy | rollback | status | ping)
       exec /srv/deploy.sh --env prod --image ghcr.io/...
  └─ /srv/deploy.sh          le moteur blue/green
```

`/usr/local/bin/deploy` et `/usr/local/bin/rollback` existent aussi, mais ce
sont des shims pour l'usage manuel sur le VPS — **le CI ne passe pas par eux**,
le `ForceCommand` s'interpose avant.

`/srv/github-deploy.sh` n'était versionné nulle part ; sa copie de référence
vit désormais dans [`scripts/github-deploy.sh`](../scripts/github-deploy.sh).

## Synchroniser le VPS

`/srv/deploy.sh` est aujourd'hui **identique** à `scripts/deploy.sh` (mêmes
sha256). Ce repo ne le déploie pas : le `ForceCommand` n'autorise que
`deploy|rollback|status|ping`, donc ni `scp` ni `rsync` ne passent par la clé du
CI. La synchronisation est **manuelle**, depuis un accès admin :

```bash
scp scripts/deploy.sh        root@<VPS_HOST>:/srv/deploy.sh
scp scripts/github-deploy.sh root@<VPS_HOST>:/srv/github-deploy.sh
ssh root@<VPS_HOST> 'chmod +x /srv/deploy.sh /srv/github-deploy.sh'
ssh root@<VPS_HOST> 'ENV=prod IMAGE=x ping'   # doit répondre "pong from …"
```

⚠️ Les deux fichiers vont **ensemble** : `github-deploy.sh` n'accepte plus que
les variables de son allowlist (`ENV`, `IMAGE`, `GITHUB_TOKEN`,
`RESEND_API_KEY`, `NUXT_STUDIO_TOKEN`) et refuse le reste. Ajouter une variable
au workflow sans l'ajouter à cette liste casse le déploiement — c'est
volontaire, un refus se voit, un `export` silencieux non. Le `ping` ci-dessus
vérifie la chaîne complète sans rien déployer.

Tant que ce n'est pas fait, les changements de cette PR n'ont pas tous le même
sort :

| Change | Effet au merge |
|---|---|
| Version et env dans `/api/health` | **immédiat** — build-args, cuits dans l'image |
| `HEALTHCHECK` du `Dockerfile` → `/api/health` | **immédiat** — cuit dans l'image |
| Gates de `release.yml`, tag → deploy, release GitHub | **immédiat** — côté CI |
| `--health-cmd` du `docker run` | **après sync** — override de celui de l'image, lui-même déjà correct |
| Label `kbrdn.version` | **après sync** — vide sur les conteneurs actuels |
| `-e NUXT_APP_ENV` | **après sync** — sans effet utile, la valeur du build est déjà la bonne |
| Rollback qui conserve la couleur sortante | **après sync** — jusque-là `--rollback` reste cassé, seul `--image ...:vX.Y.Z` fonctionne |

Aucun de ces reports ne casse une release : le workflow ne dépend que de ce qui
est cuit dans l'image ou exécuté côté CI.

### L'état constaté sur le VPS

Diagnostic du 2026-08-14, en lecture seule :

| env | conteneur | couleur | port | image | health |
|---|---|---|---|---|---|
| prod | `kbrdn-prod-green` | green | 3001 | `:main` | healthy |
| preprod | `kbrdn-preprod-blue` | blue | 3002 | `:dev` | healthy |

**Une seule couleur par environnement**, et `docker ps -a` ne liste même pas les
opposées — elles sont détruites en fin de déploiement. C'est ce qui rend le
`--rollback` actuel incapable de fonctionner ailleurs que dans la fenêtre de
drain de 5 s d'un déploiement en cours, et ce que corrige le passage au `docker
stop`.

Le seul déclencheur de déploiement est le SSH de GitHub Actions : ni Dokploy, ni
watchtower, ni webhook, ni cron (vérifié). Le `docker-compose.yml` du repo, que
`deploy.sh` nettoie défensivement en fin de course, n'a plus aucun conteneur
actif — c'est du legacy.

### Suivi

- **Les blocs `server{}` nginx** consommant `kbrdn_app` / `kbrdn_preprod_app`
  n'ont été trouvés ni dans `sites-enabled/` ni dans `conf.d/`. Le mapping
  upstream → port → conteneur est confirmé, le chemin domaine → upstream ne
  l'est pas.
- **Le digest de l'image prod** n'a pas été comparé au dernier `:main` du
  registry : rien ne prouve que la prod tourne sur le dernier build de `main`.
