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
        display: ["Noto Serif", "var(--font-noto-serif)", "Playfair Display", "serif"],
        body: ["Noto Sans", "var(--font-noto-sans)", "Lato", "sans-serif"],
      },
      colors: {
        primary: "#355E3B", // Hunter Green
        "primary-light": "#4A7A51",
        secondary: "#9E7BB5", // Lavender accent (darker for text/icons) - usado en confirmaciones
        accent: "#E6E6FA", // Light Lavender - para backgrounds suaves
        "accent-lavender": "#E6E6FA",
        "accent-lavender-dark": "#363640",
        "highlight-lavender": "#d3c3db", // New lavender for badges
        "background-light": "#F9F7F2", // Cream/Off-white actualizado
        "background-dark": "#121212", // Dark background
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E1E1E",
        "text-main-light": "#1C1C1E",
        "text-main-dark": "#EAEAEA",
        "text-muted-light": "#8E8E93",
        "text-muted-dark": "#A1A1AA",
        "text-light": "#2D3748",
        "text-dark": "#FDFBF7",
        "accent-light": "#967bb6",
        'neutral-bg': '#FCF9F7',
        'neutral-text': '#2B1105',
        'lavender-border': '#D3CDE6',
        'cream-bg': '#fbf8f0',
        wedding: {
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
