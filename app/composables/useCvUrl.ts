/**
 * The CV in the site's language, the other one if it is missing, or nothing: the PDFs are
 * hosted outside the repository (runtimeConfig.public.cvUrlFr / cvUrlEn).
 */
export function useCvUrl() {
  const { locale } = useI18n()
  const { cvUrlFr, cvUrlEn } = useRuntimeConfig().public
  return computed(() => (locale.value === 'fr' ? cvUrlFr || cvUrlEn : cvUrlEn || cvUrlFr) || '')
}
