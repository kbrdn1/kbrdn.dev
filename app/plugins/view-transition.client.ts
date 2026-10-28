import type { RouteLocationNormalized } from 'vue-router'

// Page navigation, like the panels scrolled to (Panel.vue): the old page's blocks swing out
// to the side away from the one the navbar goes to, then the new page's swing in from it (from
// the right going right; within a section, out upwards and in from below), staggered on the
// way in, blurred while fast. Animated on the live page, not in the view transition's
// snapshots: a glass panel under a named, faded or filtered ancestor blurs nothing. The view
// transition only fades out what stays of the old page (transitions.css).
//
// A page that takes longer than the browser allows (a few seconds) makes its view transition
// give up: the page still shows, only the animation is skipped. Nuxt leaves that rejection
// unhandled, and it lands in the console as an error.

// Off to one side (rem, deg, px), and the panels' own curves: quick out, soft end
const SWING = { x: 2, rise: 1.5, tilt: 1.5, blur: 5 }
const LEAVE = { duration: 220, easing: 'cubic-bezier(0.4, 0, 1, 1)' } // accelerating, seen from the start
const ENTER = {
  duration: 700,
  stagger: 60,
  maxStagger: 5,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
}

// A block off to side s (1 right, -1 left, 0 neither), dy rem down
const off = (s: number, dy: number) => ({
  opacity: 0,
  translate: `${s * SWING.x}rem ${dy}rem`,
  rotate: `${s * SWING.tilt}deg`,
  filter: `blur(${SWING.blur}px)`,
})

// Where a route sits in the navbar: its page, a post under the blog's. Route names are the
// page's file path, with the language after ___ (index___fr, blog-slug___en)
function section(name: unknown) {
  const page = String(name ?? '')
    .split('___')[0]!
    .split('-')[0]
  return SITE_PAGES.findIndex(({ name }) => name === page)
}

// The side the new page comes from, or nothing to animate: the first page, the same page (an
// anchor), reduced motion
function sideOf(to: RouteLocationNormalized, from: RouteLocationNormalized) {
  if (!from.matched.length || to.path === from.path || isMotionReduced()) return undefined
  const [a, b] = [section(from.name), section(to.name)]
  return a < 0 || b < 0 ? 0 : Math.sign(b - a)
}

// The blocks that swing: a glass element (a panel), or anything holding none, and never what
// holds something pinned on screen (fixed, sticky): a transform on it would unpin it. What is
// pinned swings itself (the tables of contents). Only those in view (the new page's, once it
// has scrolled where it goes); panels still waiting below the fold keep their own reveal
// (useReveal)
function blocks() {
  const roots = [...document.querySelectorAll<HTMLElement>('#main-content, #main-content ~ footer')]
  const glassy = new Set<Element>()
  const pinned = new Set<Element>()
  const mark = (el: Element, set: Set<Element>) => {
    for (
      let at: Element | null = el;
      at && !roots.includes(at as HTMLElement);
      at = at.parentElement
    )
      set.add(at)
  }
  for (const root of roots)
    for (const el of root.querySelectorAll('*')) {
      const style = getComputedStyle(el)
      if (el.matches('.panel') || style.backdropFilter !== 'none') mark(el, glassy)
      if (style.position === 'fixed' || style.position === 'sticky') mark(el, pinned)
    }
  const found: HTMLElement[] = []
  const walk = (el: Element) => {
    for (const child of el.children) {
      if (!(child instanceof HTMLElement) || child.hasAttribute('data-hidden')) continue
      const holdsGlass = [...child.children].some((c) => glassy.has(c))
      const holdsPinned = [...child.children].some((c) => pinned.has(c))
      if (holdsGlass || holdsPinned) walk(child)
      else {
        const box = child.getBoundingClientRect()
        if (box.height && box.bottom > 0 && box.top < window.innerHeight) found.push(child)
      }
    }
  }
  roots.forEach(walk)
  return found.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
}

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()
  const root = document.documentElement
  let side: number | undefined
  // The old page's blocks, held out until the new page replaces them
  let leaving: Animation[] = []
  let fallback: ReturnType<typeof setTimeout> | undefined

  const restore = () => {
    leaving.forEach((animation) => animation.cancel())
    leaving = []
  }

  // Out first: the navigation waits for it, so the view transition captures the old page
  // without its blocks
  router.beforeEach(async (to, from) => {
    restore()
    const s = sideOf(to, from)
    if (s === undefined) return
    leaving = blocks().map((block) =>
      block.animate([off(-s, s ? 0 : -SWING.rise)], { ...LEAVE, fill: 'forwards' }),
    )
    await Promise.all(leaving.map((animation) => animation.finished.catch(() => {})))
  })
  router.afterEach((to, from, failure) => {
    // Cancelled or redirected: the old page comes back as it was
    if (failure) restore()
    side = failure ? undefined : sideOf(to, from)
  })
  router.onError(restore)

  // The new page is in: hidden until it has scrolled where it goes, so its blocks all start
  // from their side. What stays across pages (the footer) drops its way out, unseen.
  nuxtApp.hook('page:finish', () => {
    // Whatever was decided since (the pause control pressed during the way out): never left out
    restore()
    if (side === undefined) return
    root.dataset.pageEnter = ''
    // Never left hidden, whatever happens to the navigation
    fallback = setTimeout(() => {
      side = undefined
      delete root.dataset.pageEnter
    }, 1500)
  })
  // Nuxt scrolls in the next frame (router.options): the blocks are picked after it
  nuxtApp.hook('page:loading:end', () => {
    if (side !== undefined) requestAnimationFrame(() => setTimeout(enter))
  })

  function enter() {
    clearTimeout(fallback)
    if (side === undefined || !('pageEnter' in root.dataset)) return
    const s = side
    side = undefined
    blocks().forEach((block, i) =>
      block.animate([off(s, SWING.rise), { opacity: 1 }], {
        duration: ENTER.duration,
        delay: Math.min(i, ENTER.maxStagger) * ENTER.stagger,
        easing: ENTER.easing,
        fill: 'backwards',
      }),
    )
    delete root.dataset.pageEnter
  }

  nuxtApp.hook('page:view-transition:start', (transition) => {
    // The site's pause control counts as reduced motion, like the system setting
    if (isMotionReduced()) transition.skipTransition()
    transition.ready.catch(() => {})
    transition.updateCallbackDone.catch(() => {})
  })
})
