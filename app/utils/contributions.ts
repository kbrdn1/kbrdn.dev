// The GitHub calendar laid out for UiDitherChart's heatmap: seven rows, Sunday first as on
// GitHub, one column per week. The weeks the range cuts (the first, the last) leave their other
// days empty, never zero: no contribution and no day at all are not the same thing.
interface Day {
  contributionCount: number
  date: string
}

/** `monthName` gets each week's last day at UTC midnight: format it with `timeZone: 'UTC'` */
export function calendarGrid(
  weeks: { contributionDays: Day[] }[],
  monthName: (date: Date) => string,
) {
  const values = Array.from({ length: 7 }, () => weeks.map((): number | null => null))
  const days = Array.from({ length: 7 }, () => weeks.map((): string | null => null))
  weeks.forEach((week, column) => {
    for (const day of week.contributionDays) {
      // "2026-11-18" reads as UTC midnight: its UTC weekday is the day's own, wherever the reader is
      const row = new Date(day.date).getUTCDay()
      values[row]![column] = day.contributionCount
      days[row]![column] = day.date
    }
  })
  // A week goes under the month of its last day: the week of 1 January reads January, not December
  const columns = weeks.map((week) => {
    const last = week.contributionDays.at(-1)
    return last ? monthName(new Date(last.date)) : ''
  })
  return { values, days, columns }
}
