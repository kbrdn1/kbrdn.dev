import { TOOLTIP_CLASS } from './utils/tooltip'

// Nuxt 4 reads the app config from app/ (srcDir): the root app.config.ts is never loaded.
export default defineAppConfig({
  ui: {
    // Tooltips in the site's own language (utils/tooltip)
    tooltip: {
      slots: { content: TOOLTIP_CLASS },
    },
    // The articles' content (ContentRenderer, on /blog/[slug] only) in the site's design: code
    // and tables are cards, opaque in glass (the shiki contrast is measured on an opaque
    // block), table heads are eyebrows, bullets orange as on /experience. Headings keep Nuxt
    // UI's own theme.
    prose: {
      // Underlined in prose.css: Nuxt UI's hover border drew a second line under it
      a: { base: 'border-b-0' },
      pre: {
        slots: { base: 'rounded-[1rem] border-(--card-border) bg-(--card-bg) blur:bg-neutral-950' },
      },
      code: {
        variants: { color: { neutral: 'border-(--control-border) bg-(--control-bg)' } },
      },
      blockquote: { base: 'border-s-2 border-primary-500 text-(--label)' },
      ul: { base: 'marker:text-primary-500' },
      ol: { base: 'marker:text-(--accent-text)' },
      table: {
        slots: {
          root: 'rounded-[1rem]',
          base: 'rounded-[1rem] bg-(--card-bg) blur:bg-neutral-950',
        },
      },
      thead: { base: 'bg-transparent' },
      tr: {
        base: '[&:first-child>th:first-child]:rounded-ss-[1rem] [&:first-child>th:last-child]:rounded-se-[1rem] [&:last-child>td:first-child]:rounded-es-[1rem] [&:last-child>td:last-child]:rounded-ee-[1rem]',
      },
      th: { base: 'eyebrow text-[11px] font-normal border-(--card-border)' },
      td: { base: 'border-(--card-border)' },
      hr: { base: 'border-dashed border-(--card-border)' },
    },
  },
})
