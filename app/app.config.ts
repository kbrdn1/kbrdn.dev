// Nuxt 4 reads the app config from app/ (srcDir): the root app.config.ts is never loaded.
export default defineAppConfig({
  ui: {
    // Tooltips in the site's own language: a pill like the nav's segments and the tags, mono
    // capitals, on the panels' surface (their border, shadow, and the glass in blur mode).
    // Text: neutral-700 on white, neutral-200 on the dark card, both over 4.5:1.
    tooltip: {
      slots: {
        content:
          'h-7 rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.06em] bg-(--card-bg) text-neutral-700 dark:text-neutral-200 ring ring-(--panel-border) shadow-(--panel-shadow) [backdrop-filter:var(--glass)]',
      },
    },
  },
})
