// Check de app/utils/cameos et app/utils/heroes : les scènes pixel des sections (UiCameo), des
// héros (UiHeroCanvas) et le walkout de l'easter egg (HomeWalkout). Une scène qui lève une exception au milieu ne casse ni le
// typecheck ni le build : elle fige son canvas sur la page. Une couleur qui n'est pas un
// #rrggbb est peinte en noir sans erreur. Un héros dont la fin de boucle n'est pas son début
// saute d'un coup à chaque tour.
//
// usage: bun scripts/cameos.test.ts
import assert from 'node:assert/strict'
import { CAMEOS } from '../app/utils/cameos'
import { HEROES } from '../app/utils/heroes'
import { ORBIT } from '../app/utils/heroes/orbit'
import { LEAVE, walkout } from '../app/utils/heroes/walkout'
import { Raster } from '../app/utils/cameos/art'
import { GROWN } from '../app/utils/pixelGrow'

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

// Le walkout : toute sa timeline, sa sortie et sa pousse, en clair et en sombre, avec et sans
// drapeau, pour la carte de Kylian, une carte sans pays ni langage, et une carte aux valeurs
// qui piègent un objet littéral (`constructor`)
const KYLIAN = {
  name: 'Kylian Bardini',
  overall: 84,
  position: 'CM',
  country: 'fr',
  language: 'TypeScript',
  finish: 'totw',
  stats: { pac: 77, sho: 63, pas: 83, dri: 75, def: 61, phy: 94 },
}
const flag = new Raster(3, 2)
flag.cells.fill('#3355aa')
const cards = [
  KYLIAN,
  { ...KYLIAN, country: null, language: null, overall: 90 },
  { ...KYLIAN, finish: 'constructor', language: 'constructor', position: 'CAM', overall: 70 },
]
const colors = (art: Raster, at: string) => {
  for (const color of art.cells)
    if (color) assert.match(color, /^#[0-9a-f]{6}$/i, `${at} : « ${color} »`)
}
for (const card of cards) {
  const scene = walkout(card)
  for (const dark of [false, true])
    for (const assets of [{}, { flag }]) {
      for (let t = 0; t <= scene.duration; t += 33) {
        colors(scene.paint(t, dark, assets), `walkout@${t}`)
        const at = scene.card(t)
        if (at)
          assert.ok([at.x, at.y, at.w, at.h, at.k].every(Number.isFinite), `walkout@${t} : carte`)
      }
      for (let leave = 0; leave <= LEAVE + 33; leave += 33) {
        colors(scene.paint(scene.duration, dark, assets, GROWN, leave), `walkout, sortie@${leave}`)
        scene.card(scene.duration, leave)
      }
      for (let level = 0; level <= GROWN; level += 0.1)
        colors(scene.paint(100, dark, assets, level), `walkout, pousse ${level}`)
    }
  assert.ok(scene.card(scene.revealed), 'walkout : pas de carte une fois révélée')
  assert.equal(scene.card(scene.duration, LEAVE), undefined, 'walkout : la carte reste en partant')
}

console.log(
  `cameos: ok (${Object.keys(CAMEOS).length} scènes, ${Object.keys(HEROES).length} héros, walkout)`,
)
