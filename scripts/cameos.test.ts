// Check de app/utils/cameos et app/utils/heroes : les scènes pixel des sections (UiCameo) et
// des héros (UiHeroCanvas). Une scène qui lève une exception au milieu ne casse ni le
// typecheck ni le build : elle fige son canvas sur la page. Une couleur qui n'est pas un
// #rrggbb est peinte en noir sans erreur. Un héros dont la fin de boucle n'est pas son début
// saute d'un coup à chaque tour.
//
// usage: bun scripts/cameos.test.ts
import assert from 'node:assert/strict'
import { CAMEOS } from '../app/utils/cameos'
import { HEROES } from '../app/utils/heroes'
import { ORBIT } from '../app/utils/heroes/orbit'

for (const [name, cameo] of Object.entries(CAMEOS)) {
  const [ox, oy] = cameo.origin
  assert.ok(ox >= 0 && ox <= cameo.w && oy >= 0 && oy <= cameo.h, `${name} : origine hors du cadre`)
  for (const dark of [false, true])
    for (let t = 0; t < cameo.duration; t += 17) {
      const art = cameo.paint(t, dark)
      assert.equal(art.cells.length, cameo.w * cameo.h, `${name}@${t} : raster d'une autre taille`)
      for (const color of art.cells)
        if (color) assert.match(color, /^#[0-9a-f]{6}$/i, `${name}@${t} : couleur « ${color} »`)
    }
  // Au milieu de sa scène, une scène montre quelque chose
  const middle = cameo.paint(cameo.duration / 2, false)
  assert.ok(middle.cells.some(Boolean), `${name} : rien à mi-scène`)
}

for (const [name, hero] of Object.entries(HEROES)) {
  if (!hero) continue
  for (const dark of [false, true]) {
    for (const color of hero.still(dark).cells)
      if (color) assert.match(color, /^#[0-9a-f]{6}$/i, `héros ${name} : couleur « ${color} »`)
    for (let t = 0; t < hero.period; t += 33)
      for (const color of hero.paint(t, dark).cells)
        if (color)
          assert.match(color, /^#[0-9a-f]{6}$/i, `héros ${name}@${t} : couleur « ${color} »`)
    const [start, end] = [hero.paint(0, dark).cells, hero.paint(hero.period, dark).cells]
    assert.ok(
      start.every((c, i) => c === end[i]),
      `héros ${name} : la boucle ne se referme pas`,
    )
  }
}

// L'orbite de l'accueil : ses deux calques, derrière et devant la mascotte
for (const dark of [false, true]) {
  for (let t = 0; t < ORBIT.period; t += 33)
    for (const layer of ORBIT.layers(t, dark))
      for (const color of layer.cells)
        if (color) assert.match(color, /^#[0-9a-f]{6}$/i, `orbite@${t} : couleur « ${color} »`)
  const [start, end] = [ORBIT.layers(0, dark), ORBIT.layers(ORBIT.period, dark)]
  start.forEach((layer, i) =>
    assert.ok(
      layer.cells.every((c, j) => c === end[i]!.cells[j]),
      "l'orbite ne se referme pas",
    ),
  )
}

console.log(
  `cameos: ok (${Object.keys(CAMEOS).length} scènes, ${Object.keys(HEROES).length} héros)`,
)
