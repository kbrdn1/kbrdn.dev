// The pages' hero scenes at the cameos' level (UiPixelScene, and the pages' OG images), by the
// names of the flat scenes they replace (utils/pixelScenes): /parcours, /apps, /activity,
// /blog, /contact.
import { commits } from './commits'
import type { Hero } from './hero'
import { journey } from './journey'
import { mail } from './mail'
import { nook } from './nook'
import { terminal } from './terminal'

export type { Hero } from './hero'

export const HEROES: Partial<Record<string, Hero>> = {
  climb: journey,
  terminal,
  commits,
  blog: nook,
  mail,
}
