// A page's hero scene (UiPixelScene), painted like the panels' cameos (../cameos/art) but on a
// loop: what never moves once per mode, then at time t what moves, over it. Everything that
// moves is a function of where t is in the loop, so the end of a loop is its start again.
import type { Raster } from '../cameos/art'

export interface Hero {
  /** Art pixels */
  w: number
  h: number
  /** ms */
  period: number
  /** The moment shown when it does not play (reduced motion), ms into the loop */
  rest: number
  /** What never moves, outlined */
  still: (dark: boolean) => Raster
  /** What moves at t (ms), outlined, laid over the still */
  paint: (t: number, dark: boolean) => Raster
}

/** Where t is in a loop of `period` ms (0 to 1) */
export const phase = (t: number, period: number) => (((t % period) + period) % period) / period

/** A sine that goes round `turns` whole times a loop, so it ends where it starts */
export const wave = (u: number, turns: number, offset = 0) =>
  Math.sin(2 * Math.PI * (u * turns + offset))
