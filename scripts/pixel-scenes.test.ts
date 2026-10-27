// Check de app/utils/pixelScenes.ts — les scènes pixel des heros et de leurs images OG.
// Les couleurs des OG (satori n'a pas de CSS) recopient celles du thème : si theme.css bouge
// sans elles, les OG partent d'une autre palette que le site sans que rien ne casse. Une
// lettre de palette inconnue ne dessine rien, en silence.
//
// usage: bun scripts/pixel-scenes.test.ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  PIXEL_SCENES,
  SCENE_FILL,
  SCENE_H,
  SCENE_W,
  THEME_HEX,
  sceneColor,
} from '../app/utils/pixelScenes'

// THEME_HEX = theme.css, nuance par nuance
const theme = readFileSync(new URL('../app/assets/css/theme.css', import.meta.url), 'utf8')
for (const [name, hex] of Object.entries(THEME_HEX)) {
  const match = theme.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))
  assert.ok(match, `--color-${name} absente de theme.css`)
  assert.equal(hex, match[1]!.toLowerCase(), `--color-${name} a changé dans theme.css`)
}

// Chaque cellule de chaque frame : une lettre de la palette, dans la grille, une couleur en
// sombre (sauf ce qui n'existe qu'en clair)
for (const [name, scene] of Object.entries(PIXEL_SCENES)) {
  for (let tick = 0; tick < scene.ticks; tick++) {
    for (const cell of [...scene.still, ...scene.frame(tick)]) {
      assert.ok(SCENE_FILL[cell.c], `${name}@${tick} : lettre « ${cell.c} » hors palette`)
      assert.ok(cell.x >= 0 && cell.y >= 0, `${name}@${tick} : cellule hors grille`)
      assert.ok(cell.x + (cell.w ?? 1) <= SCENE_W && cell.y + (cell.h ?? 1) <= SCENE_H)
      if (!SCENE_FILL[cell.c]!.includes('transparent'))
        assert.ok(sceneColor(cell.c), `${name} : « ${cell.c} » sans couleur pour l'OG`)
    }
  }
}

console.log('pixel-scenes: ok')
