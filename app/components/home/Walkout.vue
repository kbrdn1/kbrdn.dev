<script setup lang="ts">
// The hero's easter egg (utils/heroes/walkout): Kylian's gitfut card revealed like an FC 26
// walkout, in the illustration's box. HomeHero loads it on the fifth quick click, the card
// already read. It grows out of the box's middle block by block, plays, then holds the card; a
// click or Enter skips to the card (FC's "press to skip"), a click or Escape folds it back into
// the mascot. Under reduced motion, the card at once and nothing moving. The canvas is
// decorative: the card is announced in words, and the button that skips or goes back has the
// focus, given back when it closes.
import type { GitfutCard } from '~~/shared/gitfut'
import { Raster } from '~/utils/cameos/art'
import { walkout, type WalkoutArt } from '~/utils/heroes/walkout'
import { GROWN } from '~/utils/pixelGrow'

const props = defineProps<{ card: GitfutCard }>()
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
let folding = false
let last = 0
let raf = 0
let art: HTMLCanvasElement | undefined
let before: Element | null = null

const dark = () => document.documentElement.matches('.dark, .blur')

/** A picture as art pixels, w × h, its see-through edge cut at half */
function picture(src: string, w: number, h: number) {
  return new Promise<Raster>((resolve, reject) => {
    const image = new Image()
    // GitHub's avatars and gitfut's flags send `Access-Control-Allow-Origin: *`: readable back
    image.crossOrigin = 'anonymous'
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
  const raster = scene.paint(time, dark(), assets, level)
  art.getContext('2d')!.putImageData(raster.toImage(art.getContext('2d')!), 0, 0)
  // Whole screen pixels per art pixel, unless that shrinks it by more than a fifth (HeroCanvas)
  const exact = el.width / scene.w
  const scale =
    Math.floor(exact) >= 1 && Math.floor(exact) / exact >= 0.8 ? Math.floor(exact) : exact
  const [w, h] = [scene.w * scale, scene.h * scale]
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, el.width, el.height)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(art, Math.round((el.width - w) / 2), Math.round((el.height - h) / 2), w, h)
}

function frame(now: number) {
  raf = requestAnimationFrame(frame)
  // About 30 frames a second, like the hero scenes; a hidden tab holds it where it was
  if (now - last < 32) return
  const dt = Math.min(100, now - last)
  last = now
  if (folding) {
    level -= (dt / GROW_MS) * GROWN
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
  time = scene.duration
  level = GROWN
  stop()
  announce()
  draw()
  still.value = true
}

/** Back to the mascot: folded into the middle, or at once under reduced motion */
function close() {
  if (folding) return
  folding = true
  emit('close')
  if (reducedMotion.value) return emit('done')
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
  // The portrait: GitHub's, else the mascot it is drawn from; the flag gitfut prints
  picture(props.card.avatar, 36, 36)
    .catch(() => picture('/images/mascot/hoodie.webp', 36, 36))
    .then((avatar) => {
      assets.avatar = avatar
      // Still (reduced motion, or skipped before it came): drawn again with it
      if (!raf) draw()
    })
    .catch(() => {})
  if (props.card.country)
    picture(`https://gitfut.com/badges/flags/${props.card.country}.png`, 30, 20)
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
  // Reduced motion: no tunnel, the card is there, announced once the live region is in place
  if (reducedMotion.value) {
    level = GROWN
    time = scene.duration
    still.value = true
    draw()
    setTimeout(announce, 150)
  } else play()
})

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
    <!-- FC's "press to skip", bottom right: Enter skips to the card, then goes back -->
    <button
      ref="button"
      type="button"
      class="eyebrow absolute -right-1/4 -bottom-7 flex cursor-pointer items-center gap-1.5 whitespace-nowrap"
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
