export function useFormatDate() {
  const { locale } = useI18n()

  function formatDate(dateStr: string, format: 'short' | 'long' = 'short') {
    return new Date(dateStr).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: format === 'long' ? 'long' : 'short',
      day: 'numeric',
    })
  }

  return { formatDate }
}
