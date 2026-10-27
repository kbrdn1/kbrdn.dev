// Rows of a refilled list (<TransitionGroup :css="false" @enter="rowEnter" @leave="rowLeave">):
// each opens or closes on its own height, its fade and blur in proportion to it (one
// timeline, one curve), for a time that follows the height, one after the other (--i). A
// list showing less shrinks progressively as its removed rows close; a replaced one
// morphs, the old rows closing while the new ones open, never both at full height. At
// once under reduced motion.

// In: quick then soft. Out: in-out, so a row is seen fading rather than gone at once
const EASE_IN = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)'
const BLUR = 'blur(6px)'
// Rows going away first, the new ones after: Vue runs leaves during the render and enters
// right after it, so an enter that follows a leave this closely belongs to the same swap
const HANDOFF = 350
let leftAt = -Infinity

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
// A tall row takes longer than a short one, at about the same speed; slow enough to be
// followed row by row
const timeFor = (height: number) => Math.round(Math.min(1100, 450 + height * 1.2))
// The row's place in the list, one after the other at a readable pace, capped so a long
// list does not keep the last ones waiting
const delay = (el: HTMLElement) => Math.min(Number(el.style.getPropertyValue('--i')) || 0, 10) * 110

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
    {
      duration: timeFor(height),
      easing: EASE_IN,
      delay: delay(row) + (performance.now() - leftAt < 100 ? HANDOFF : 0),
      fill: 'backwards',
    },
  ).onfinish = () => done()
}

export function rowLeave(el: Element, done: () => void) {
  const row = el as HTMLElement
  if (still()) return done()
  leftAt = performance.now()
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
    { duration: timeFor(height) * 1.4, easing: EASE_OUT, delay: delay(row), fill: 'forwards' },
  ).onfinish = () => done()
}
