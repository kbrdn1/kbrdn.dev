---
name: lowpoly-image
description: "Crée, corrige ou décline une image de la banque low-poly de kbrdn.dev (la mascotte dans un monde 3D low-poly, public/images/lowpoly) avec codex et sa génération d'images, puis la branche dans le site (notch, « À découvrir », images OG). Processus et revue de la série d'origine (#127), à l'identique. Déclencheurs : nouvelle image low-poly, nouvelle scène de la mascotte, variante claire, corriger une image de la banque, image OG d'une page, recréer une image comme celles de lowpoly."
---

# Images low-poly de la mascotte

**La vérité est `docs/LOWPOLY.md`** : le brief de style (verbatim dans chaque prompt), le
tableau des images et de leurs prompts, les prompts d'édition, où chaque image sert. Le lire
d'abord. Cette skill porte le **processus** et ses pièges ; elle ne recopie pas le brief.

Travailler dans un worktree (`/me:issue-worktree-pr`), jamais dans le checkout principal où
peut tourner `bun run dev`.

## 0. Pré-vol

```bash
codex --version && codex features list | grep -E '^(image_generation|view_image) '   # stable, true
df -h / | tail -1    # chaque image ≈ 1,5 Mo, plus sa copie dans ~/.codex/generated_images
```

⛔ Disque plein = codex meurt en route (`No space left on device`) après avoir parfois copié
une image à moitié vérifiée. Vérifier l'espace avant un lot, pas après.

Codex se lance en `codex exec` direct. `sessions.start` de MonoCode n'est ouvert qu'aux
threads Operator (« Operator is not enabled for this thread »).

## 1. Les références

Dans un dossier de travail hors du repo (`/tmp/lowpoly-refs`), jamais commité :

```bash
R=/tmp/lowpoly-refs; L=public/images/lowpoly; mkdir -p $R
magick $L/mascot-sheet.png -crop 780x887+994+0 +repage $R/sheet-head.png
magick -background none -density 300 public/images/logo/k-light.svg -resize 512x512 $R/k-light.png
# la planche elle-même seulement : les portraits 2D
for f in full-body hoodie flag-code coffee; do magick public/images/mascot/$f.webp $R/$f.png; done
```

`k-light` (barre claire, deux pièces orange), jamais `k-orange` : la variante tout orange fait
dessiner une simple lettre K.

## 2. Générer

1. Ajouter d'abord la ligne de l'image au tableau de `docs/LOWPOLY.md` (fichier, format, prompt).
   Pose **debout ou assise** : accroupie, la mascotte sort avec une basket de trop ou sans jambe.
2. Un fichier de prompt par image, puis une session codex par image (en parallèle, c'est sûr) :

```bash
WT=$(git rev-parse --show-toplevel); L=$WT/public/images/lowpoly; R=/tmp/lowpoly-refs; D=/tmp/lowpoly-run
nohup codex exec -s workspace-write -C "$WT" --json -o $D/<nom>-last.md \
  -i $L/mascot-sheet.png -i $R/sheet-head.png -i $R/k-light.png -i $L/scene-coding.png \
  - < $D/<nom>.txt > $D/<nom>.jsonl 2> $D/<nom>.err &
```

Le prompt dit, dans l'ordre :
- lire `docs/LOWPOLY.md` ;
- ce qu'est chaque pièce jointe : la planche, le gros plan de tête, le logo, une scène validée pour le monde et la lumière ;
- générer **une** image : le brief verbatim, puis sa ligne du tableau, en 1536×1024 paysage ;
- la copier depuis le dossier `generated_images` de **sa** session vers `public/images/lowpoly/<fichier>` ;
- garder la sortie native : jamais de pad, de recadrage ni de rééchantillonnage (`sips`) ;
- ne toucher à rien d'autre, ne pas commiter, et finir par la source, la destination et la sortie de `file`.

Chaque image tombe dans `~/.codex/generated_images/<thread>/` : le `thread_id` est la première
ligne du `.jsonl`. Ne jamais prendre « le dernier PNG » par date : plusieurs sessions écrivent
en même temps.

Attendre la fin sans que la boucle se trouve elle-même :

```bash
until ! pgrep -f "codex exec.*lowpoly-ru[n]/" >/dev/null; do sleep 15; done
```

(`pgrep -f "lowpoly-run/..."` se trouve dans la ligne de commande de la boucle et ne rend
jamais la main ; la classe `[n]` l'en empêche.)

## 3. La revue, le seul gate

Ouvrir chaque PNG. D'abord la scène entière, puis **la mascotte recadrée en gros plan** : à
l'échelle de la scène, une basket en trop ou un visage de travers ne se voient pas.

```bash
magick $L/<fichier> -crop <w>x<h>+<x>+<y> +repage -resize x500 /tmp/lowpoly-run/zoom.png
```

Contre la planche, un par un :

- [ ] tête de la planche : masque crème cerclé d'une arcade orange, yeux blancs à pupille noire, l'air assuré ; pas un visage rond aux gros iris ;
- [ ] casquette noire à l'envers et sa patte orange (sauf costume voulu, comme le casque de `vellum`) ;
- [ ] logo `k-light` petit, sur la poitrine, **de face seulement** : jamais dans le dos, jamais une lettre K ;
- [ ] mains **beige** (la crème du masque), avant-bras en fourrure orange ;
- [ ] hoodie noir à **manches courtes** ;
- [ ] **pas de queue** ;
- [ ] deux jambes, **deux baskets**, chacune au bout d'une jambe ;
- [ ] aucun texte, chiffre ou glyphe (écrans et papiers : des barres), aucun K hors du hoodie ;
- [ ] aucun logo, produit ou personnage tiers, aucun autre personnage, figurines comprises ;
- [ ] palette du brief, rien de saturé hors des petits accents.

## 4. Corriger

En **édition**, pas en régénérant : l'image fautive en premier `-i`, puis les références utiles,
et le prompt d'édition de `docs/LOWPOLY.md`, qui ne nomme que ce qui change. Une session par
image, revue avant la suite, puis une grille d'ensemble pour vérifier que les décors n'ont pas
bougé. Deux éditions sans effet sur une anatomie : changer la pose plutôt qu'insister.

## 5. Optimiser

```bash
oxipng -o 2 --strip safe public/images/lowpoly/<fichiers>
magick identify -format '%[type]\n' public/images/lowpoly/*.png | sort | uniq -c   # TrueColor seulement
```

Pas de PNG en palette ni de quantification : ipx les regonfle.

## 6. Brancher

Les règles d'intégration sont dans `docs/LOWPOLY.md`, section « Où elles servent ». En bref :
- jamais un PNG brut dans une page : `$img(src, { width, format: 'webp' })`, puis `UiPixelImage` ;
- une variante `-light` seulement là où le site change d'image avec le mode ;
- une OG : le recadrage `og/`, sa clé dans la liste blanche `SCENES` de `OgImage/Default.satori.vue`, la clé `scene` de la page.

Puis les gates. ⛔ Arrêter tout `bun run dev` du worktree avant le build : il vide la sqlite
content.

```bash
nix develop -c bun run lint && nix develop -c bun run fmt:check
nix develop -c bunx vue-tsc -b --noEmit
nix develop -c bun run build && nix develop -c ./scripts/og-smoke.sh --update   # si une OG change
git status --short scripts/og-smoke/   # seules les OG voulues ; /blog/gwm doit rester à l'octet
```

Vérifier dans un vrai navigateur (dev sur un port à part, `--port 3010`) : le notch au
survol, « À découvrir » en clair, sombre et verre, et une URL `/_ipx/...lowpoly...` en 200
de quelques dizaines de Ko.

## 7. Commiter

Le merge vers `dev` se fait en merge commit : chaque version intermédiaire d'un PNG resterait
pour toujours dans l'historique. Avant de pousser, **replier** les révisions d'images dans un
seul commit d'images (`git reset --soft origin/dev`, puis recommiter par sujet, puis
`git push --force-with-lease` sur la branche de feature). Sujets : images, intégration (un
commit par endroit), OG avec ses références, doc, changelog.

Une image visible sur le site a son entrée sous `[Unreleased]` ; une image seulement ajoutée à
la banque n'en a pas.
