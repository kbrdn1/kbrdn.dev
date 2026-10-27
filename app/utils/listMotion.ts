// Rows of a refilled list (<TransitionGroup :css="false" @enter="rowEnter" @leave="rowLeave">):
// each opens or closes on its own height, its fade and blur in proportion to it (one
// timeline, one curve), for a time that follows the height, one after the other: from the
// top on the way in (--i), from the end on the way out. A list showing less shrinks
// progressively as its removed rows close; a replaced one morphs, the old rows closing
// before the new ones open. At once under reduced motion.

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
const STEP = 110
const delay = (el: HTMLElement) =>
  Math.min(Number(el.style.getPropertyValue('--i')) || 0, 10) * STEP

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

// Rows leaving together are gathered for a tick, then go from the last one up: a list
// empties from its end, the way it filled. Only the leaving rows count in the stagger.
let leaving: { row: HTMLElement; done: () => void }[] = []

function closeLeaving() {
  const rows = leaving.reverse()
  leaving = []
  rows.forEach(({ row, done }, order) => {
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
      {
        duration: timeFor(height) * 1.4,
        easing: EASE_OUT,
        delay: Math.min(order, 10) * STEP,
        fill: 'forwards',
      },
    ).onfinish = () => done()
  })
}

export function rowLeave(el: Element, done: () => void) {
  if (still()) return done()
  leftAt = performance.now()
  if (!leaving.length) queueMicrotask(closeLeaving)
  leaving.push({ row: el as HTMLElement, done })
}
