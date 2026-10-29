export interface TocItem {
  id: string
  text: string
  level: number
}

/**
 * An article's table of contents read as a checklist, after disarto's "Getting started":
 * every top-level section is a step, a subsection belongs to the step above it, and the
 * reader's step is the one the active heading falls in (-1 before the first).
 */
export function useTocSteps(items: () => TocItem[], activeHeading: () => string) {
  const steps = computed(() => items().filter((item) => item.level < 3))
  const current = computed(() => {
    const list = items()
    const at = list.findIndex((item) => item.id === activeHeading())
    for (let i = at; i >= 0; i--) {
      if (list[i]!.level < 3) return steps.value.indexOf(list[i]!)
    }
    return -1
  })
  const stepOf = (id: string) => steps.value.findIndex((step) => step.id === id)
  return { steps, current, stepOf }
}
