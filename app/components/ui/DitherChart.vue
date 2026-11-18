<script lang="ts">
// Monocode's dither charts (its /visualize command, MIT) on the site. app/utils/dither-charts.js
// is the shared core, a verbatim copy never edited here (CLAUDE.md, "Dither charts"); this
// gives it a place in the page, the theme's colours, the site's pause button, and the keyboard
// on a heatmap. The core is plain JS: imported for its side effect, it sits on globalThis.
import '~/utils/dither-charts.js'

export type DitherColor =
  | 'ink'
  | 'muted'
  | 'faint'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'warning'
  | `series${1 | 2 | 3 | 4 | 5 | 6}`

/** A readout row: its swatch (null: none), a name, a value */
type ReadoutRow = [DitherColor | null, string, string]

export type DitherChartSpec =
  | {
      kind: 'bar' | 'line' | 'area'
      series: { label: string; values: (number | null)[]; color?: DitherColor }[]
      labels?: string[]
      height?: number
    }
  | { kind: 'trend'; values: number[]; color?: DitherColor; height?: number }
  | {
      kind: 'donut'
      slices: { label: string; value: number; color?: DitherColor }[]
      size?: number
      legend?: boolean
    }
  | {
      kind: 'gauge'
      label?: string
      value: number
      min?: number
      max?: number
      unit?: string
      color?: DitherColor
    }
  | {
      kind: 'progress'
      label?: string
      value: number
      max?: number
      detail?: string
      color?: DitherColor
    }
  | {
      kind: 'heatmap'
      /** Rows of columns; null is no day at all, never zero */
      values: (number | null)[][]
      /** One name per column, written where it changes */
      columns?: string[]
      color?: DitherColor
      readout?: (row: number, column: number) => { title: string; rows: ReadoutRow[] }
    }

// The core's tokens on the theme's variables, which light, dark and blur each define
const TOKENS: Record<DitherColor | 'surface', string> = {
  ink: 'ui-text',
  muted: 'label',
  faint: 'ui-text-dimmed',
  accent: 'ui-primary',
  positive: 'ui-success',
  negative: 'ui-error',
  warning: 'ui-warning',
  surface: 'card-bg',
  series1: 'series-1',
  series2: 'series-2',
  series3: 'series-3',
  series4: 'series-4',
  series5: 'series-5',
  series6: 'series-6',
}

/** A token as CSS, for what sits beside a chart in its colours (a legend's dots) */
export const ditherColor = (color: DitherColor) => `var(--${TOKENS[color]})`

interface Visual {
  el: HTMLElement
  canvas: HTMLCanvasElement
  /** The core's own "entrance over" flag: once set, every paint draws the final state */
  settled: boolean
  update(options: object): void
  redraw(): void
  destroy(): void
}
type Make = (options: object) => Visual
type Core = Record<'chart' | 'trend' | 'donut' | 'gauge' | 'progress' | 'heatmap', Make> & {
  configure(options: object): void
}
const core = () => (globalThis as unknown as { DitherCharts: Core }).DitherCharts
let configured = false

// The core's heatmap geometry: squares of 4 cells at a pitch of 5, the column names in 18px
// on top. Cells are 3 CSS px rounded to whole screen pixels
const SQUARE = 4
const PITCH = 5
const NAMES = 18
const STEPS: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
}
</script>

<script setup lang="ts">
const props = defineProps<{
  chart: DitherChartSpec
  /** What the chart says, for screen readers. None: it is decorative, the text beside says it */
  label?: string
}>()

const host = ref<HTMLElement>()
const reduced = useReducedMotion()
// 3 on the server, the screen's own once mounted
const cell = ref(3)
// The day the keyboard is on, said aloud
const announced = ref('')
let visual: Visual | undefined

const options = () => ({ ...props.chart, aria: props.label })

// Room for the drawing before it is drawn, server side too, so nothing moves when it is. A
// heatmap is exactly as wide as its columns: wider, a cameo would count the rest as graph;
// narrower, the core would drop the oldest ones (the parent scrolls instead)
const box = computed(() => {
  const c = props.chart
  if (c.kind === 'heatmap') {
    const columns = Math.max(0, ...c.values.map((row) => row.length))
    return {
      width: `${Math.ceil((columns * PITCH - 1) * cell.value)}px`,
      minHeight: `${(c.columns?.length ? NAMES : 0) + c.values.length * PITCH * cell.value}px`,
    }
  }
  if (c.kind === 'donut') return { minHeight: `${c.size ?? 184}px` }
  if (c.kind === 'trend') return { minHeight: `${c.height ?? 56}px` }
  if (c.kind === 'bar' || c.kind === 'line' || c.kind === 'area')
    return { minHeight: `${c.height ?? 220}px` }
  return undefined
})

// A heatmap from the keyboard: the arrows walk the cells, Home and End go to the first and last.
// The core's readout follows (a pointer event at the cell's centre, as a mouse shows it), and
// the cell is said aloud.
function keyboard(v: Visual) {
  const canvas = v.canvas
  let at: [number, number] | undefined
  canvas.tabIndex = 0
  // Not an image to browse past: its arrows are its own
  canvas.setAttribute('role', 'application')
  const leave = () => {
    canvas.dispatchEvent(new PointerEvent('pointerleave'))
    at = undefined
    announced.value = ''
  }
  canvas.addEventListener('blur', leave)
  canvas.addEventListener('keydown', (event) => {
    const spec = props.chart
    if (spec.kind !== 'heatmap') return
    const { values } = spec
    const live = (r: number, c: number) => typeof values[r]?.[c] === 'number'
    const width = Math.max(0, ...values.map((row) => row.length))
    // In time order: down a column, then the next one
    const order: [number, number][] = []
    for (let c = 0; c < width; c++)
      for (let r = 0; r < values.length; r++) if (live(r, c)) order.push([r, c])
    if (!order.length) return

    let next: [number, number] | undefined
    const step = STEPS[event.key]
    if (step && at) {
      let [r, c] = at
      do {
        r += step[0]
        c += step[1]
      } while (r >= 0 && r < values.length && c >= 0 && c < width && !live(r, c))
      next = live(r, c) ? [r, c] : at
    } else if (step || event.key === 'End') next = order.at(-1) // first press: the latest
    else if (event.key === 'Home') next = order[0]
    else if (event.key === 'Escape') return leave()
    else return
    event.preventDefault()

    at = next!
    const [row, column] = at
    const rect = canvas.getBoundingClientRect()
    const centre = (SQUARE / 2) * cell.value
    canvas.dispatchEvent(
      new PointerEvent('pointermove', {
        clientX: rect.left + column * PITCH * cell.value + centre,
        clientY: rect.top + (spec.columns?.length ? NAMES : 0) + row * PITCH * cell.value + centre,
      }),
    )
    const readout = spec.readout?.(row, column)
    announced.value = readout
      ? [...readout.rows.map(([, name, value]) => `${value} ${name}`), readout.title].join(', ')
      : String(values[row]![column])
  })
}

onMounted(() => {
  const DC = core()
  if (!configured) {
    DC.configure({ tokens: TOKENS })
    configured = true
  }
  cell.value = Math.max(1, Math.round(3 * devicePixelRatio)) / devicePixelRatio
  const { kind } = props.chart
  const make = kind === 'bar' || kind === 'line' || kind === 'area' ? DC.chart : DC[kind]
  visual = make(options())
  // The core reads prefers-reduced-motion only, not the site's pause button
  if (reduced.value) visual.settled = true
  host.value!.append(visual.el)
  if (kind === 'heatmap') keyboard(visual)
  // Names and readings are drawn in the mono font: again once it has loaded
  document.fonts.ready.then(() => visual?.redraw())
})

watch([() => props.chart, () => props.label], () => visual?.update(options()))

// Paused while a chart comes in: it lands where it ends
watch(reduced, (value) => {
  if (!value || !visual) return
  visual.settled = true
  visual.redraw()
})

onBeforeUnmount(() => visual?.destroy())
</script>

<template>
  <div ref="host" :style="box" :aria-hidden="label ? undefined : 'true'">
    <span v-if="chart.kind === 'heatmap'" class="sr-only" aria-live="polite">{{ announced }}</span>
  </div>
</template>
