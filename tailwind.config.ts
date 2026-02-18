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
        display: ['var(--font-cormorant)', 'serif'],
        body: ['var(--font-montserrat)', 'sans-serif'],
        script: ['var(--font-great-vibes)', "Great Vibes", "cursive"],
      },
      colors: {
        primary: "#4d5d53", // Green - Updated TBD
        "primary-light": "#4A7A51",
        secondary: "#9E7BB5", // Lavender accent (darker for text/icons) - usado en confirmaciones
        accent: "#E6E6FA", // Light Lavender - para backgrounds suaves
        "accent-lavender": "#E6E6FA",
        "highlight-lavender": "#d3c3db", // New lavender for badges
        "background-light": "#fbf8ef", // Updated to match design
        "cream": "#fbf8f0", // Specific background requested
        "hunter-green": "#4a5951", // Specific button color
        "warm-grey": "#807d7c", // New icon color
        "text-main": "#151216", // Main text color
        "text-muted": "#747472", // Muted text color
        "surface-light": "#FFFFFF",
        "text-main-light": "#1C1C1E",
        "text-muted-light": "#8E8E93",
        "text-light": "#2D3748",
        "accent-light": "#967bb6",
        'neutral-bg': '#FCF9F7',
        'neutral-text': '#2B1105',
        'lavender-border': '#D3CDE6',
        'cream-bg': '#fbf8f0',
        admin: {
          primary: '#C6754D',
          rose: '#f5cbcc',
          lavender: '#d1c1d9',
          purple: '#9579B4',
          beige: '#F1DBD0',
          sage: '#ADB697',
          forest: '#4D5D53',
        },
      },
    },
  },
  plugins: [],
}
export default config
