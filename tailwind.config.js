/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        'gym-bg':      '#0f0f0f',
        'gym-card':    '#1c1c1e',
        'gym-surface': '#2c2c2e',
        'gym-border':  '#38383a',
        'gym-accent':  '#e8462a',
        'gym-muted':   '#8e8e93',
        'gym-success': '#30d158',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      screens: {
        'xs': '375px',
      },
    },
  },
  plugins: [],
}
