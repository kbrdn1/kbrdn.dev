// The panels' cameos (UiCameo): now and then, in the free room of a panel's header, a small
// pixel scene grows out of the card below, block by block like Ichigo out of the pointer,
// plays, and folds back into it. One per kind of section; a panel names its own (`cameo` on
// UiPanel). What they paint with: ./art.
import { bookworm } from './bookworm'
import { cameraCameo } from './camera'
import { cap } from './cap'
import { climb } from './climb'
import { coffee } from './coffee'
import { hourglassCameo } from './hourglass'
import { invadersCameo } from './invaders'
import { letter } from './letter'
import { megaphoneCameo } from './megaphone'
import { octocat } from './octocat'
import { pencilCameo } from './pencil'
import { planeCameo } from './plane'
import { rocketCameo } from './rocket'
import { tools } from './tools'
import { ufo } from './ufo'

export { GROW_MS } from './art'

export const CAMEOS = {
  camera: cameraCameo,
  pencil: pencilCameo,
  tools,
  rocket: rocketCameo,
  octocat,
  climb,
  cap,
  ufo,
  plane: planeCameo,
  letter,
  hourglass: hourglassCameo,
  invaders: invadersCameo,
  bookworm,
  coffee,
  megaphone: megaphoneCameo,
}

export type CameoName = keyof typeof CAMEOS
