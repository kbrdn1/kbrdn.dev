export default defineAppConfig({
  ui: {
    // Color aliases for Catppuccin Mocha theme
    colors: {
      primary: 'ctp-mauve',
      secondary: 'ctp-blue',
      success: 'ctp-green',
      warning: 'ctp-yellow',
      error: 'ctp-red',
      neutral: 'slate'
    },

    // Button component customization
    button: {
      default: {
        size: 'md',
        color: 'primary',
        variant: 'solid'
      },
      slots: {
        base: 'font-semibold transition-all'
      }
    },

    // Card component customization
    card: {
      slots: {
        root: 'shadow-xl',
        header: 'border-b border-ctp-surface0'
      }
    },

    // Input component customization
    input: {
      default: {
        size: 'md'
      }
    }
  }
})
