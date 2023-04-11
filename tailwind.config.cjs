/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
      },
      colors: {
        white: '#F2F2F2',
        grey: {
          1: '#7C7F82',
          2: '#393939',
          3: '#282828',
        },
        black: {
          1: '#161616',
          2: '#1C1C1C',
          3: '#2B2B2B',
        },
        accent: '#FFAA00',
      },
      screens: {
        '2xl': '1440px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
