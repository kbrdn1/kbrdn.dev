export function useFormatDate() {
  const { locale } = useI18n()

  function formatDate(dateStr: string, format: 'short' | 'long' = 'short') {
    return new Date(dateStr).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: format === 'long' ? 'long' : 'short',
      day: 'numeric',
      // A bare date ("2026-07-06") parses as midnight UTC: read it in UTC, or a reader west
      // of it gets the day before, and the client a different text than the server
      ...(/^\d{4}-\d{2}-\d{2}$/.test(dateStr) && { timeZone: 'UTC' }),
    })
  }

  return { formatDate }
}
