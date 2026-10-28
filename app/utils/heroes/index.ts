// The pages' hero scenes at the cameos' level (UiPixelScene), by the names of the flat scenes
// of utils/pixelScenes, which the OG images still draw.
import { climb } from './climb'
import type { Hero } from './hero'

export type { Hero } from './hero'

export const HEROES: Partial<Record<string, Hero>> = { climb }
