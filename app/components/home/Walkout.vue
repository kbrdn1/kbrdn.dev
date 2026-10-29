<script setup lang="ts">
// The hero's easter egg (utils/heroes/walkout): Kylian's gitfut card revealed like an FC 26
// walkout, in the illustration's box. HomeHero loads it on the fifth quick click, the card
// already read. It grows out of the box's middle block by block, plays, then holds the card; a
// click or Enter skips to the card (FC's "press to skip"), a click or Escape folds it back into
// the mascot. Under reduced motion, the card at once and nothing moving. The scene is pixels;
// gitfut's card is drawn over them sharp, at the screen's resolution. The canvas is
// decorative: the card is announced in words, and the button that skips or goes back has the
// focus, given back when it closes.
import type { GitfutWalkout } from '~~/shared/gitfut'
import { Raster, smooth } from '~/utils/cameos/art'
import { LEAVE, walkout, type WalkoutArt } from '~/utils/heroes/walkout'
import { drawGrowing, GROWN } from '~/utils/pixelGrow'

const props = defineProps<{ card: GitfutWalkout }>()
// `close` as it starts folding (the mascot comes back under it), `done` once folded
const emit = defineEmits<{ close: []; done: [] }>()

const { t, locale } = useI18n()
const reducedMotion = useReducedMotion()

const GROW_MS = 320
const scene = walkout(props.card)
const canvas = ref<HTMLCanvasElement>()
const button = ref<HTMLButtonElement>()
const still = ref(false)
const announcement = ref('')
const assets: WalkoutArt = {}

let time = 0
let level = 0
// Leaving: ms since, the scene's own exit (LEAVE), then the fold into the mascot
let folding = false
let leave = -1
let leftAt = GROWN
let last = 0
let raf = 0
let art: HTMLCanvasElement | undefined
// gitfut's card, decoded, and the canvas it is drawn on at its size on screen with its shine
let picture: HTMLImageElement | undefined
let face: HTMLCanvasElement | undefined
let before: Element | null = null

const dark = () => document.documentElement.matches('.dark, .blur')

/** A picture (a data URI from the route: readable back) as art pixels, w × h, its
 * see-through edge cut at half */
function pixels(src: string, w: number, h: number) {
  return new Promise<Raster>((resolve, reject) => {
    const image = new Image()
    image.onerror = reject
    image.onload = () => {
      const paint = document.createElement('canvas')
      paint.width = w
      paint.height = h
      const ctx = paint.getContext('2d', { willReadFrequently: true })!
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(image, 0, 0, w, h)
      const data = ctx.getImageData(0, 0, w, h).data
      const raster = new Raster(w, h)
      for (let i = 0; i < w * h; i++)
        if (data[i * 4 + 3]! >= 128)
          raster.cells[i] =
            `#${((data[i * 4]! << 16) | (data[i * 4 + 1]! << 8) | data[i * 4 + 2]!).toString(16).padStart(6, '0')}`
      resolve(raster)
    }
    image.src = src
  })
}

function announce() {
  if (announcement.value) return
  const c = props.card
  const country = c.country
    ? new Intl.DisplayNames([locale.value], { type: 'region' }).of(c.country.toUpperCase())
    : undefined
  const details = [
    t('walkout.rating', { n: c.overall }),
    t('walkout.position', { p: c.position }),
    country,
    c.language && t('walkout.language', { l: c.language }),
    Object.entries(c.stats)
      .map(([name, value]) => `${name.toUpperCase()} ${value}`)
      .join(', '),
  ].filter(Boolean)
  announcement.value = t('walkout.card', { name: c.name, details: details.join(', ') })
}

function draw() {
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx || !art) return
  const raster = scene.paint(time, dark(), assets, level, leave)
  art.getContext('2d')!.putImageData(raster.toImage(art.getContext('2d')!), 0, 0)
  // Whole screen pixels per art pixel, unless that shrinks it by more than a fifth (HeroCanvas)
  const exact = el.width / scene.w
  const scale =
    Math.floor(exact) >= 1 && Math.floor(exact) / exact >= 0.8 ? Math.floor(exact) : exact
  const [w, h] = [scene.w * scale, scene.h * scale]
  const [ox, oy] = [Math.round((el.width - w) / 2), Math.round((el.height - h) / 2)]
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, el.width, el.height)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(art, ox, oy, w, h)

  // gitfut's card, sharp: squashed from its foot as it lands, a band of light across it, and
  // block by block with the scene while it folds
  const at = scene.card(time, leave)
  // Decoded (HomeHero only hatches it once it is): a broken picture is never drawn
  if (!at || !picture?.complete || !picture.naturalWidth) return
  const [cw, ch] = [
    Math.round(at.w * scale * (1 + at.k * 0.6)),
    Math.round(at.h * scale * (1 - at.k)),
  ]
  const [cx, cy] = [
    Math.round(ox + (at.x + at.w / 2) * scale - cw / 2),
    Math.round(oy + (at.y + at.h) * scale - ch),
  ]
  face ??= document.createElement('canvas')
  face.width = cw
  face.height = ch
  const paint = face.getContext('2d')!
  paint.imageSmoothingQuality = 'high'
  paint.drawImage(picture, 0, 0, cw, ch)
  if (at.shine > 0 && at.shine < 1) {
    const x = -cw * 0.6 + at.shine * cw * 2.2
    const band = paint.createLinearGradient(x, 0, x + cw * 0.4, ch * 0.3)
    band.addColorStop(0, 'rgb(255 255 255 / 0)')
    band.addColorStop(0.5, 'rgb(255 255 255 / 0.55)')
    band.addColorStop(1, 'rgb(255 255 255 / 0)')
    paint.globalCompositeOperation = 'source-atop'
    paint.fillStyle = band
    paint.fillRect(0, 0, cw, ch)
    paint.globalCompositeOperation = 'source-over'
  }
  // The fold's blocks are the scene's, three art pixels; its middle is the scene's
  const block = Math.max(1, Math.round(3 * scale))
  drawGrowing(
    ctx,
    face,
    [0, 0, cw, ch],
    [cx, cy],
    [ox + w / 2 - cx, oy + h / 2 - cy],
    level,
    block,
    76 * scale,
  )
}

function frame(now: number) {
  raf = requestAnimationFrame(frame)
  // About 30 frames a second, like the hero scenes; a hidden tab holds it where it was
  if (now - last < 32) return
  const dt = Math.min(100, now - last)
  last = now
  if (folding) {
    leave += dt
    // The mascot comes back under it as the fold starts
    if (leave >= LEAVE && leave - dt < LEAVE) emit('close')
    level = leftAt * (1 - smooth(leave, LEAVE, LEAVE + GROW_MS))
    if (level <= 0) {
      stop()
      emit('done')
      return
    }
  } else {
    level = Math.min(GROWN, level + (dt / GROW_MS) * GROWN)
    time = Math.min(scene.duration, time + dt)
  }
  if (time >= scene.revealed) announce()
  draw()
  if (!folding && time >= scene.duration && level >= GROWN) {
    stop()
    still.value = true
  }
}

function stop() {
  cancelAnimationFrame(raf)
  raf = 0
}

function play() {
  stop()
  last = performance.now()
  raf = requestAnimationFrame(frame)
}

/** Straight to the card, still */
function skip() {
  // Leaving already: the fold goes on, a skip would freeze it half folded
  if (folding) return
  time = scene.duration
  level = GROWN
  stop()
  announce()
  draw()
  still.value = true
}

/** Back to the mascot: everything put away, then folded into the middle; at once under
 * reduced motion */
function close() {
  if (folding) return
  folding = true
  leave = 0
  leftAt = level
  if (reducedMotion.value) {
    emit('close')
    emit('done')
    return
  }
  play()
}

const press = () => (still.value ? close() : skip())

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

function size() {
  const el = canvas.value
  if (!el) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  el.width = Math.round(el.clientWidth * dpr)
  el.height = Math.round(el.clientHeight * dpr)
  draw()
}

let resize: ResizeObserver | undefined
let theme: MutationObserver | undefined
onMounted(() => {
  if (!canvas.value) return
  art = document.createElement('canvas')
  art.width = scene.w
  art.height = scene.h
  // The card and the flag, both in the route's answer; still (reduced motion, or skipped
  // before they were decoded), it is drawn again with them
  picture = new Image()
  picture.onload = () => raf || draw()
  picture.src = props.card.image
  if (props.card.flag)
    pixels(props.card.flag, 30, 20)
      .then((flag) => {
        assets.flag = flag
        if (!raf) draw()
      })
      .catch(() => {})
  resize = new ResizeObserver(size)
  resize.observe(canvas.value)
  theme = new MutationObserver(() => raf || draw())
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  document.addEventListener('keydown', onKey)
  before = document.activeElement
  button.value?.focus({ preventScroll: true })
  // Reduced motion: nothing moves, all of it there at once, the card announced once the live
  // region is in place
  if (reducedMotion.value) {
    level = GROWN
    time = scene.duration
    still.value = true
    draw()
    setTimeout(announce, 150)
  } else play()
})
// The site's pause button, pressed while it plays: straight to the card, like the hero scenes stop
watch(reducedMotion, (on) => on && !still.value && !folding && skip())

onBeforeUnmount(() => {
  stop()
  resize?.disconnect()
  theme?.disconnect()
  document.removeEventListener('keydown', onKey)
  if (before instanceof HTMLElement && before.isConnected) before.focus({ preventScroll: true })
})
</script>

<template>
  <div class="absolute inset-0 z-20" @click.stop="press">
    <canvas
      ref="canvas"
      :width="scene.w"
      :height="scene.h"
      class="walkout absolute top-1/2 left-1/2 aspect-[3/2] w-[150%] -translate-x-1/2 -translate-y-1/2"
      aria-hidden="true"
    />
    <!-- FC's "press to skip": a click does it, so it shows only once reached from the
         keyboard, where Enter skips to the card, then goes back -->
    <button
      ref="button"
      type="button"
      class="eyebrow absolute -right-1/4 -bottom-7 flex cursor-pointer items-center gap-1.5 whitespace-nowrap opacity-0 focus-visible:opacity-100"
      @click.stop="press"
    >
      <i18n-t :keypath="still ? 'walkout.back' : 'walkout.skip'" tag="span" scope="global">
        <template #key>
          <kbd class="rounded border border-(--card-border) px-1 normal-case">{{
            t(still ? 'walkout.escape' : 'walkout.enter')
          }}</kbd>
        </template>
      </i18n-t>
    </button>
    <p role="status" class="sr-only">{{ announcement }}</p>
  </div>
</template>

<style scoped>
/* The site's other pixel figures' halo in the dark modes (Ichigo, the cameos): a very dark grey */
:is(.dark, .blur) .walkout {
  filter: drop-shadow(0 0 2px var(--color-neutral-700));
}
</style>
