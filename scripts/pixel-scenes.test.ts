// Check de app/utils/pixelScenes.ts : les scènes pixel des heros. Une lettre de palette
// inconnue ne dessine rien, en silence.
//
// usage: bun scripts/pixel-scenes.test.ts
import assert from 'node:assert/strict'
import { PIXEL_SCENES, SCENE_FILL, SCENE_H, SCENE_W } from '../app/utils/pixelScenes'

// Chaque cellule de chaque frame : une lettre de la palette, dans la grille
for (const [name, scene] of Object.entries(PIXEL_SCENES)) {
  for (let tick = 0; tick < scene.ticks; tick++) {
    for (const cell of [...scene.still, ...scene.frame(tick)]) {
      assert.ok(SCENE_FILL[cell.c], `${name}@${tick} : lettre « ${cell.c} » hors palette`)
      assert.ok(cell.x >= 0 && cell.y >= 0, `${name}@${tick} : cellule hors grille`)
      assert.ok(cell.x + (cell.w ?? 1) <= SCENE_W && cell.y + (cell.h ?? 1) <= SCENE_H)
    }
  }
}

console.log('pixel-scenes: ok')
