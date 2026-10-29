<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
const colorMode = useColorMode()

// One button cycles light → dark → blur; it shows the mode it switches to.
const NEXT = { light: 'dark', dark: 'blur', blur: 'light' } as const
const MODES = {
  light: {
    icon: 'i-heroicons-sun-20-solid',
    color: 'text-yellow-500',
    label: 'themeSwitch.toLight',
  },
  dark: {
    icon: 'i-heroicons-moon-20-solid',
    color: 'text-primary-500',
    label: 'themeSwitch.toDark',
  },
  blur: { icon: 'i-lucide-blend', color: 'text-cyan-500', label: 'themeSwitch.toBlur' },
}

const next = computed(() => NEXT[colorMode.value as keyof typeof NEXT] ?? 'dark')
const target = computed(() => MODES[next.value])

// The new mode spreads from the button in a dithered wave: small square pixels of the new
// page come through the old one in a 4×4 Bayer order, a front of the new mode's colour
// ahead of them. Through a view transition: the old page is a still snapshot under the
// mask, so nothing fades colour by colour. Without view transitions, under reduced motion,
// with the site's animations paused, or outside Chromium (below), the mode just switches.
const DURATION = 1000
const CELL = 6 // px, one pixel of the wave
const FRAMES = 24
const SPREAD = 0.4 // the share of the wave given to the dither: wider, a softer front
const FRONT = 0.07 // how far behind the front the new mode's colour lingers
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
// The front's colour and opacity: the mode's own accent, frosted white for the glass
const FRONT_COLOR = {
  light: ['--color-yellow-500', 150],
  dark: ['--color-primary-500', 150],
  blur: ['#fff', 90],
} as const

/** A colour (a theme variable, or any syntax the canvas reads) as one RGBA Uint32 pixel */
function pixel(color: string, alpha: number) {
  // The canvas does not resolve var(): the theme's value, read from the root
  if (color.startsWith('--'))
    color = getComputedStyle(document.documentElement).getPropertyValue(color)
  const ctx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext(
    '2d',
    { willReadFrequently: true },
  )!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return new Uint32Array(new Uint8ClampedArray([r!, g!, b!, alpha]).buffer)[0]!
}

/**
 * The wave, frame by frame: one image per frame at one pixel per cell (stretched with
 * image-rendering: pixelated), the mask of the new page and its coloured front. A cell
 * opens when the wave (ease-out, gentle enough for the dither to show) passes its level:
 * its distance from the button, offset by its rank in the Bayer matrix.
 */
function waveFrames(x: number, y: number, front: number) {
  const cols = Math.ceil(innerWidth / CELL)
  const rows = Math.ceil(innerHeight / CELL)
  const cx = x / CELL
  const cy = y / CELL
  const far = Math.hypot(Math.max(cx, cols - cx), Math.max(cy, rows - cy))
  const level = new Float32Array(cols * rows)
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      level[r * cols + c] =
        (Math.hypot(c + 0.5 - cx, r + 0.5 - cy) / far) * (1 - SPREAD) +
        (BAYER[(r % 4) * 4 + (c % 4)]! / 16) * SPREAD

  const canvas = Object.assign(document.createElement('canvas'), { width: cols, height: rows })
  // In memory, not on the GPU: frames read back from a GPU canvas wait each time for the
  // page's own canvases (the dither) to flush, seconds in all
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const image = ctx.createImageData(cols, rows)
  const pixels = new Uint32Array(image.data.buffer)
  // Data URLs, ready the moment a frame shows: a blob URL loads asynchronously, and until it
  // has, the mask drops out and the whole page flashes between the two modes
  const encode = () => {
    ctx.putImageData(image, 0, 0)
    return `url(${canvas.toDataURL()})`
  }
  const masks: string[] = []
  const fronts: string[] = []
  for (let i = 0; i <= FRAMES; i++) {
    // Past 1 on the last frame: every cell is open, the front is gone
    const t = i === FRAMES ? 2 : 1 - (1 - i / FRAMES) ** 3
    for (let c = 0; c < level.length; c++) pixels[c] = level[c]! < t ? 0xffffffff : 0
    masks.push(encode())
    for (let c = 0; c < level.length; c++)
      pixels[c] = level[c]! < t && level[c]! >= t - FRONT ? front : 0
    fronts.push(encode())
  }
  return { masks, fronts }
}

// The wave runs in Chromium only, where it is measured flash-free frame by frame. WebKit
// applies the mask frames late: recorded on video, the page swaps between the two modes
// several times in half a second, a seizure risk (RGAA 13.7). There, the mode just switches.
const waveSafe = () => 'userAgentData' in navigator

async function toggleTheme(event: MouseEvent) {
  const mode = next.value
  if (!document.startViewTransition || isMotionReduced() || !waveSafe()) {
    colorMode.preference = mode
    return
  }

  const button = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const root = document.documentElement
  const [color, alpha] = FRONT_COLOR[mode]
  const { masks, fronts } = waveFrames(
    button.left + button.width / 2,
    button.top + button.height / 2,
    pixel(color, alpha),
  )

  // Every frame decoded before the wave starts, and held until it ends: an engine that
  // decodes a mask late would drop it for a frame, and the page would flash between modes
  const decoded = await Promise.all(
    [...masks, ...fronts].map((url) => {
      const image = new Image()
      image.src = url.slice(4, -1)
      return image.decode().then(
        () => image,
        () => image,
      )
    }),
  )

  // Its own view transition layer (transitions.css): inside the page's, each of its frames
  // would make the browser capture the whole new page again
  const front = document.createElement('div')
  front.className = 'theme-front'

  root.dataset.themeSwitch = ''
  const transition = document.startViewTransition(async () => {
    colorMode.preference = mode
    document.body.append(front)
    await nextTick()
  })

  try {
    await transition.ready
    // Discrete frames (an image does not tween): one step of the wave each
    root.animate(
      { maskImage: masks },
      { duration: DURATION, fill: 'forwards', pseudoElement: '::view-transition-new(root)' },
    )
    front.animate({ backgroundImage: fronts }, { duration: DURATION, fill: 'forwards' })
    await transition.finished
  } catch {
    // ready rejects when the transition is skipped (another one took over): the mode has
    // switched all the same
  } finally {
    front.remove()
    delete root.dataset.themeSwitch
    decoded.length = 0
  }
}
</script>

<template>
  <ClientOnly>
    <UTooltip :text="t(target.label)">
      <button
        type="button"
        class="icon-btn cursor-pointer"
        :aria-label="t(target.label)"
        @click="toggleTheme"
      >
        <UIcon :name="target.icon" :class="cn('w-4 h-4', target.color)" />
      </button>
    </UTooltip>
    <template #fallback>
      <div class="size-9">
        <div class="w-4 h-4" />
      </div>
    </template>
  </ClientOnly>
</template>
