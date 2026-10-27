// Rows of a refilled list (<TransitionGroup :css="false" @enter="rowEnter" @leave="rowLeave">):
// each opens or closes on its own height, its fade and blur in proportion to it (one
// timeline, one curve), for a time that follows the height, one after the other (--i). A
// list showing less shrinks progressively as its removed rows close; a replaced one
// morphs, the old rows closing while the new ones open, never both at full height. At
// once under reduced motion.

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const BLUR = 'blur(6px)'

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
// A tall row takes longer than a short one, at about the same speed
const timeFor = (height: number) => Math.round(Math.min(700, 220 + height * 0.8))
// The row's place in the list, capped so a long list does not keep the last ones waiting
const delay = (el: HTMLElement) => Math.min(Number(el.style.getPropertyValue('--i')) || 0, 8) * 45

export function rowEnter(el: Element, done: () => void) {
  const row = el as HTMLElement
  if (still()) return done()
  const height = row.offsetHeight
  row.animate(
    [
      {
        height: '0px',
        paddingBlock: '0px',
        marginBlock: '0px',
        opacity: 0,
        filter: BLUR,
        overflow: 'hidden',
      },
      { height: `${height}px`, opacity: 1, filter: 'blur(0px)', overflow: 'hidden' },
    ],
    { duration: timeFor(height), easing: EASE, delay: delay(row), fill: 'backwards' },
  ).onfinish = () => done()
}

export function rowLeave(el: Element, done: () => void) {
  const row = el as HTMLElement
  if (still()) return done()
  const height = row.offsetHeight
  row.animate(
    [
      { height: `${height}px`, overflow: 'hidden' },
      {
        height: '0px',
        paddingBlock: '0px',
        marginBlock: '0px',
        opacity: 0,
        filter: BLUR,
        overflow: 'hidden',
      },
    ],
    { duration: timeFor(height), easing: EASE, delay: delay(row) / 2, fill: 'forwards' },
  ).onfinish = () => done()
}
