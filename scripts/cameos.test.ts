// Check de app/utils/cameos : les scènes pixel des en-têtes de panneau (UiCameo). Une scène
// qui lève une exception au milieu ne casse ni le typecheck ni le build : elle fige son canvas
// sur la page. Une couleur qui n'est pas un #rrggbb est peinte en noir sans erreur.
//
// usage: bun scripts/cameos.test.ts
import assert from 'node:assert/strict'
import { CAMEOS } from '../app/utils/cameos'

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

console.log(`cameos: ok (${Object.keys(CAMEOS).length})`)
