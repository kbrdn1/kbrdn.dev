// Generates UiDitherCanvas's noise texture off the main thread: on a slow CPU the
// first, cold run costs more than a long task's 50 ms. Receives a seed, transfers
// the texture back.
import { noiseTexture } from '../utils/dither'

self.onmessage = (e: MessageEvent<number>) => {
  const texture = noiseTexture(e.data, 3)
  self.postMessage(texture, { transfer: [texture.buffer] })
}
