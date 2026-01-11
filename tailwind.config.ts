import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
        montaga: ['Montaga', 'serif'],
      },
      colors: {
        'neutral-bg': '#FCF9F7',
        'neutral-text': '#2B1105',
        wedding: {
          primary: '#C6754D',
          rose: '#f5cbcc',
          lavender: '#d1c1d9',
          purple: '#9579B4',
          beige: '#F1DBD0',
          sage: '#ADB697',
          forest: '#4D5D53',
        },
        primary: {
          DEFAULT: '#9579B4',
          50: '#F1DBD0',
          100: '#D1C2D9',
          200: '#F4CCCC',
          300: '#9579B4',
          400: '#9579B4',
          500: '#9579B4',
          600: '#4D5D53',
          700: '#4D5D53',
          800: '#3d4a42',
          900: '#2d3731',
        },
      },
    },
  },
  plugins: [],
}
export default config
