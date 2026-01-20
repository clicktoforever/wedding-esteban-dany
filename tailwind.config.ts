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
        display: ["Playfair Display", "serif"],
        body: ["Lato", "sans-serif"],
      },
      colors: {
        primary: "#355E3B", // Hunter Green
        secondary: "#9E7BB5", // Lavender accent (darker for text/icons) - usado en confirmaciones
        accent: "#E6E6FA", // Light Lavender - para backgrounds suaves
        "background-light": "#FDFCF8", // Cream actualizado para confirmaciones
        "background-dark": "#1a1a1a",
        "text-light": "#2D3748",
        "text-dark": "#FDFBF7",
        "accent-light": "#967bb6",
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
      },
    },
  },
  plugins: [],
}
export default config
