# Banque d'images low-poly

La mascotte mise en scène dans un monde 3D low-poly, à la palette du site
([#127](https://github.com/kbrdn1/kbrdn.dev/issues/127)). Générée avec codex
(`codex exec`, feature `image_generation`) ; rien n'est encore branché dans les
pages.

Les fichiers vivent dans `public/images/lowpoly/`, en PNG optimisé sans perte
(`oxipng -o 2 --strip safe`). Pas de PNG en palette : ipx les regonfle.

## Régénérer ou étendre la série

1. Références en `-i` : la planche `mascot-sheet.png`, son gros plan de tête
   (`magick mascot-sheet.png -crop 780x887+994+0 +repage sheet-head.png`) et
   `public/images/logo/k-light.svg` rastérisé, le logo tel qu'il est sur le
   hoodie. Pour la planche elle-même : les portraits
   `public/images/mascot/{full-body,hoodie,flag-code,coffee}.webp` convertis en
   PNG. La variante tout orange du logo pousse le générateur à dessiner une
   simple lettre K.
2. Prompt : le **brief de style** ci-dessous, verbatim, puis la ligne de
   l'image dans le tableau.
3. Ouvrir chaque PNG avant de le commiter, mascotte recadrée en gros plan : à
   l'échelle de la scène, une basket en trop ou un visage de travers ne se
   voient pas. Écarter ce qui sort de la planche (tête plus ronde aux gros iris,
   manches longues, mains orange au lieu de beige, queue), tout texte ou glyphe
   qui traîne, un K ailleurs que sur la poitrine (jamais dans le dos), une
   basket sans jambe.
4. Corriger en édition plutôt que régénérer : l'image fautive en premier `-i`,
   puis les références, et un prompt qui ne nomme que ce qui change (« keep
   everything else as it is »). Une session codex par image, revue avant de
   passer à la suite. Codex garde la sortie native de l'outil : jamais de
   `sips` ni de recadrage.
5. Préférer les poses debout ou assises. Accroupie, la mascotte sort avec une
   basket de trop ou sans jambe, et deux éditions n'y ont rien changé : il a
   fallu changer de pose (`scene-gwm`).

Les fonds « monde » vont par paire, clair et `-dark`, comme les bannières
(`app/utils/banner.ts`). Les scènes n'existent qu'en sombre.

## Brief de style

```text
Stylized low-poly 3D render. Faceted, flat-shaded polygons with visible triangle
facets, matte materials, soft global illumination and gentle ambient occlusion,
a small-diorama feeling, three-quarter elevated camera with a slight tilt-shift
depth of field. Clean geometric shapes, no noise, no photographic textures.

Palette, use these exact colours and stay close to them:
- dark theme: background #121212, panels and deep surfaces #0f0f0f, greys
  #1a1a1a #2a2a2a #3a3a3a;
- light theme: background #f5f5f5, surfaces #e0e0e0 #d0d0d0, greys #999999 #666666;
- main accent, both themes: warm orange #d4825d and #c15f3c (lights, glows,
  highlights, key props);
- small secondary accents only: yellow #ffdf61, sky blue #7ab8ff, teal #8abfb8.
Lighting: a warm orange key light and a cool soft fill.

The mascot, always the same character as on the model sheet: an orange-furred
monkey with spiky orange cheek fur. Its head is the model sheet's, never a
rounder or cuter one: a cream face mask framed by an angular orange brow ridge,
thick dark angular brows, white eyes with small black pupils and a half-lidded,
confident look, ears with a cream inside. A black baseball cap worn backwards
with a small orange tab on its front band; a black short-sleeved hoodie with
the K logo small on the left chest, exactly the attached k-light logo (a light
#f5f5f5 diagonal bar and two orange #d4825d pieces), never a plain letter K;
beige hands and fingers, the same cream as the face mask, under orange-furred
forearms; light blue denim shorts; black-and-white sneakers with orange
accents. No tail.
Big head, slightly cartoonish proportions.

Hard rules:
- no text, letters, numbers or readable UI anywhere; screens and documents show
  abstract glowing lines and blocks only. The only glyph allowed is the K logo
  on the hoodie;
- no third-party logos, brands, products or characters;
- no people other than the mascot.
```

## Les images

| Fichier | Format | Prompt (après le brief) |
|---|---|---|
| `mascot-sheet.png` | 2:1 | Character model sheet of the mascot rebuilt in low-poly 3D: front view, three-quarter view and back view standing side by side in a neutral pose, plus a close-up of the head on the right, evenly lit on a plain #121212 backdrop. Faithful to the reference portraits. |
| `bg-world-dark.png` / `bg-world.png` | 1536×1024 | Background, no mascot. A low-poly floating archipelago at dusk (dark) / in daylight (light): small islands with faceted trees, a winding path, tiny glowing orange lamps and a distant lighthouse. The upper half stays calm and low-contrast sky so that panels can sit on top. |
| `bg-studio-dark.png` / `bg-studio.png` | 1536×1024 | Background, no mascot. A cosy low-poly developer studio seen from the side: a desk with monitors showing abstract glowing blocks, shelves, plants, a window. The left half stays an uncluttered, low-contrast wall so that panels can sit on top. |
| `scene-coding.png` | 1536×1024 | The mascot coding at night at a desk with two monitors of abstract glowing lines, a mug of coffee steaming, focused and happy. |
| `scene-debugging.png` | 1536×1024 | The mascot hunting a small faceted bug creature among cables and circuit-like terrain with a magnifying glass, determined. |
| `scene-deploy.png` | 1536×1024 | The mascot pressing a big orange button on a launch pad while two identical low-poly containers, one blue and one green, swap places on rails behind it; a small rocket of light lifts off. |
| `scene-gwm.png` | 1536×1024 | The mascot standing beside a sapling and watering it, at the foot of a large low-poly tree whose branches each carry a small floating platform with its own tiny desk and glowing screen, all linked to the trunk: one repository, many working copies. Orange lanterns along the branches. |
| `scene-vellum.png` | 1536×1024 | The mascot in a hard hat on scaffolding, stacking glowing database cylinders and laying out grid-like tables, a construction site still in progress. |
| `scene-lazycurl.png` | 1536×1024 | The mascot lazily lying in a hammock between two terminals, sending paper planes along a pipe between them with a flick of the finger; a few cobwebs and a closed crate hint that the project is archived. |
| `scene-open-source.png` | 1536×1024 | The mascot carrying a parcel across a small bridge into a busy low-poly town square full of shared workshops and market stalls, adding its piece to a large communal machine. No other characters. |
| `scene-writing.png` | 1536×1024 | The mascot writing an article at night in a cosy nook by a rainy window, a lamp glowing orange, a sheet folding itself into a paper plane that flies out. |
| `scene-reading.png` | 1536×1024 | The mascot reading an old book under an olive tree beside low-poly Greek columns, at golden hour. |
| `scene-gamedev.png` | 1536×1024 | The mascot building a small low-poly game level with floating blocks and platforms, holding a game controller, a tiny cube-shaped creature hopping across the platforms. |
| `scene-journey.png` | 1536×1024 | The mascot riding a small low-poly train along a winding orange track that links several stations: a workshop, a school, an office, each a little diorama. |
| `scene-contact.png` | 1536×1024 | The mascot slipping a letter into a mailbox on a quiet street at dusk, a small bird perched on the box. |
