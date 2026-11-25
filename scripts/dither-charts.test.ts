// Check of the dither charts: app/utils/dither-charts.js, the copy of the shared core (the asserts
// of its own check, the first three being Monocode's tests), and app/utils/contributions.ts,
// which lays the GitHub calendar out as its heatmap. A weekday read in the reader's timezone
// puts every day on the wrong row west of UTC; a week named after its first day writes
// "Dec" over the first week of January.
//
// usage: bun scripts/dither-charts.test.ts
import assert from 'node:assert/strict'
import '../app/utils/dither-charts.js'
import type { DitherCore } from '../app/utils/dither-charts.js'
import { calendarGrid } from '../app/utils/contributions'

process.env.TZ = 'America/Los_Angeles' // west of UTC, where a local weekday goes wrong

const D = (globalThis as unknown as { DitherCharts: DitherCore }).DitherCharts

// A tone of k/16 inks exactly k cells of a 4x4 tile
for (let steps = 0; steps <= 16; steps++) {
  let count = 0
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (D.inked(x, y, steps / 16)) count++
  assert.equal(count, steps, `tone ${steps}/16`)
}

// Round scales that include zero; a flat series keeps a range
const scale = D.Scale.nice([42, 74], true)
assert.deepEqual([scale.min, scale.max, scale.step], [0, 80, 20])
assert.deepEqual(scale.ticks(), [0, 20, 40, 60, 80])
const flat = D.Scale.nice([5, 5], false)
assert.ok(flat.max > flat.min, 'a flat series keeps a range')

// The monotone curve goes through its points without overshooting them
const curve = new D.Curve([
  [0, 10],
  [10, 0],
  [20, 0],
  [30, 10],
])
assert.equal(curve.at(10), 0)
for (let x = 10; x <= 20; x++) assert.ok(Math.abs(curve.at(x)) < 1e-4, 'flat between equal points')
for (let x = 0; x <= 30; x++) {
  const y = curve.at(x)
  assert.ok(y >= 0 && y <= 10, `no overshoot at x=${x}`)
}

// Runs: every inked cell painted once, in its own key, and nothing else
const ink = (col: number, row: number) =>
  D.inked(col, row, ((col * 7 + row * 3) % 17) / 16) ? (col + row) % 3 : null
const seen = new Map<string, number>()
for (const [x, y, w, h, key] of D.runs(23, 11, ink))
  for (let r = y; r < y + h; r++)
    for (let q = x; q < x + w; q++) {
      assert.ok(!seen.has(`${q},${r}`), `cell ${q},${r} painted twice`)
      seen.set(`${q},${r}`, key)
    }
for (let r = 0; r < 11; r++)
  for (let q = 0; q < 23; q++) assert.equal(seen.get(`${q},${r}`) ?? null, ink(q, r), `${q},${r}`)

// The calendar: 2025 opens on a Wednesday, its first week holds four days
const day = (date: string, contributionCount = 1) => ({ date, contributionCount })
const month = (date: Date) => date.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' })
const grid = calendarGrid(
  [
    {
      contributionDays: ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04'].map((d) => day(d)),
    },
    { contributionDays: [day('2025-01-05', 7), day('2025-01-06', 0)] },
  ],
  month,
)
assert.deepEqual(
  grid.values.map((row) => row[0]),
  [null, null, null, 1, 1, 1, 1],
  'Wednesday 1 January on the Wednesday row, the days before it empty, not zero',
)
assert.equal(grid.values[0]![1], 7, 'Sunday heads the next week')
assert.equal(grid.values[1]![1], 0, 'a day without contributions is a zero')
assert.equal(grid.values[2]![1], null, 'a day past the range is empty')
assert.equal(grid.days[3]![0], '2025-01-01')
// The week of 29 December 2024 to 4 January 2025, named after its last day
const turn = calendarGrid(
  [
    {
      contributionDays: ['2024-12-29', '2024-12-30', '2024-12-31', '2025-01-04'].map((d) => day(d)),
    },
  ],
  month,
)
assert.deepEqual(turn.columns, ['Jan'])

console.log('dither-charts: ok')
