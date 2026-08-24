/** @type {import('tailwindcss').Config} */

// Modern Heritage design system (_stitch/DESIGN.md)
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — Lapis Blue
        lapis: '#00113a',
        'lapis-container': '#002366',
        'lapis-fixed': '#dbe1ff',
        // Accent — Gold
        gold: '#c5a059',
        'gold-container': '#fed488',
        'gold-dim': '#e9c176',
        // Surfaces — Parchment
        parchment: '#f5f2e9',
        'surface-bright': '#fcf9f8',
        'surface-low': '#f6f3f2',
        'surface-mid': '#f0eded',
        'surface-high': '#eae7e7',
        'surface-highest': '#e5e2e1',
        // Ink
        charcoal: '#1b1b1b',
        'charcoal-secondary': '#444650',
        outline: '#757682',
        'outline-variant': '#c5c6d2',
        // Status (historical tones)
        'oxide-red': '#ba1a1a',
        verdigris: '#0f6b52',
      },
      borderRadius: {
        sm: '0.25rem',   // buttons, chips
        DEFAULT: '0.375rem',
        md: '0.5rem',    // inputs, chat bubbles
        lg: '0.75rem',   // cards, sidebars
      },
    },
  },
  plugins: [],
}
