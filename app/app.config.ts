import { TOOLTIP_CLASS } from './utils/tooltip'

// Nuxt 4 reads the app config from app/ (srcDir): the root app.config.ts is never loaded.
export default defineAppConfig({
  ui: {
    // Tooltips in the site's own language (utils/tooltip)
    tooltip: {
      slots: { content: TOOLTIP_CLASS },
    },
  },
})
