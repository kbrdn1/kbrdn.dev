// The API of app/utils/dither-charts.js, the verbatim copy of the shared core (CLAUDE.md, "Dither
// charts"), for the site and its check. Written by hand from the core's header and code: a new
// copy that changes the API must change this too, nothing detects the drift. Imported for its
// side effect, the core sits on globalThis.DitherCharts.

/** A core token (accent, positive, series1…), a CSS variable's name without its dashes, or a CSS colour */
type DitherCoreColor = string

/** Every visual: `id` enters once per id, `aria` replaces the core's own (French) summary */
interface DitherCoreBase {
  id?: string
  aria?: string
}

/** A visual's controller: insert `el` */
export interface DitherVisual<Options = object> {
  el: HTMLElement
  canvas: HTMLCanvasElement
  /** Not in the core's documented API: its "entrance over" flag. Set, every paint draws the final state */
  settled: boolean
  update(options: Partial<Options>): DitherVisual<Options>
  redraw(): DitherVisual<Options>
  destroy(): void
}

export interface DitherChartOptions extends DitherCoreBase {
  kind: 'bar' | 'line' | 'area'
  /** A NaN or null value draws nothing ("no data" is never a zero) */
  series: { label: string; values: (number | null)[]; color?: DitherCoreColor }[]
  labels?: string[]
  height?: number | 'fill'
  onHover?(index: number | null): void
  onSelect?(index: number): void
}

export interface DitherTrendOptions extends DitherCoreBase {
  values: number[]
  color?: DitherCoreColor
  height?: number
}

export interface DitherDonutOptions extends DitherCoreBase {
  slices: { label: string; value: number; color?: DitherCoreColor }[]
  label?: string
  value?: number | string
  size?: number
  legend?: boolean
}

export interface DitherGaugeOptions extends DitherCoreBase {
  label?: string
  value: number
  min?: number
  max?: number
  unit?: string
  color?: DitherCoreColor
  size?: number
}

export interface DitherProgressOptions extends DitherCoreBase {
  label?: string
  value: number
  max?: number
  detail?: string
  color?: DitherCoreColor
}

export interface DitherHeatmapOptions extends DitherCoreBase {
  /** Rows of columns; null is no cell at all, never zero */
  values: (number | null)[][]
  rows?: string[]
  columns?: string[]
  color?: DitherCoreColor
  /** The hovered cell's card: a title, then [swatch or null, name, value] rows */
  readout?(
    row: number,
    column: number,
  ): {
    title?: string
    rows: [DitherCoreColor | null, string, string][]
  } | null
  /** The cell under the pointer, or none (null) */
  onHover?(row: number | null, column?: number): void
  /** Read only when set: a click (a tap) then lights the cell as a hover would */
  onSelect?(row: number, column: number): void
}

export interface DitherCore {
  /** A cell's side, in CSS px */
  CELL: number
  /** Is cell (col, row) inked for `tone` (0..1)? */
  inked(col: number, row: number, tone: number): boolean
  /** The inked cells as rectangles [col, row, width, height, key], one per run of a key (null: blank) */
  runs(
    cols: number,
    rows: number,
    ink: (col: number, row: number) => number | null,
  ): [number, number, number, number, number][]
  Scale: {
    nice(
      values: number[],
      zero: boolean,
    ): { min: number; max: number; step: number; ticks(): number[] }
  }
  /** Monotone curve (Fritsch-Carlson) through the points */
  Curve: new (points: [number, number][]) => { at(x: number): number }
  /** Remaps the tokens to the page's CSS variables (names without their dashes) */
  configure(options: { tokens?: Record<string, string>; monoVar?: string }): void
  chart(options: DitherChartOptions): DitherVisual<DitherChartOptions>
  trend(options: DitherTrendOptions): DitherVisual<DitherTrendOptions>
  donut(options: DitherDonutOptions): DitherVisual<DitherDonutOptions>
  gauge(options: DitherGaugeOptions): DitherVisual<DitherGaugeOptions>
  progress(options: DitherProgressOptions): DitherVisual<DitherProgressOptions>
  heatmap(options: DitherHeatmapOptions): DitherVisual<DitherHeatmapOptions>
}
