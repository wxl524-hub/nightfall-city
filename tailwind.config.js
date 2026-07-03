/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A0A1F',
        secondary: '#8B0000',
        accent: '#D4AF37',
        'bg-dark': '#0D0D0D',
        'bg-panel': '#1A1A1A',
        'bg-hover': '#2A2A2A',
        'text-primary': '#E8E0D0',
        'text-secondary': '#A0A0A0',
        'text-accent': '#D4AF37',
        'color-health': '#8B0000',
        'color-mana': '#4A0080',
        'color-success': '#2E8B57',
        'color-warning': '#DAA520',
        'color-border': '#3A3A3A',
        'color-border-accent': '#D4AF37',
      },
      fontFamily: {
        gothic: ['Cinzel', 'serif'],
        body: ['Crimson Text', 'serif'],
        ui: ['IM Fell English', 'serif'],
      },
    },
  },
  plugins: [],
}
