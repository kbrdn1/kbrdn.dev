// The site's tooltip: a pill like the nav's segments and the tags, mono capitals, on the
// panels' surface (their border, shadow, and the glass in blur mode). Text: neutral-700 on
// white, neutral-200 on the dark card, both over 4.5:1. Nuxt UI's tooltips take it through
// app.config, the hand-made ones (the GitHub calendar's) through their class.
export const TOOLTIP_CLASS =
  'h-7 rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.06em] bg-(--card-bg) text-neutral-700 dark:text-neutral-200 ring ring-(--panel-border) shadow-(--panel-shadow) [backdrop-filter:var(--glass)]'
