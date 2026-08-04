/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        'gym-bg':      'var(--background)',
        'gym-fg':      'var(--foreground)',
        'gym-card':    'var(--card)',
        'gym-surface': 'var(--muted)',
        'gym-muted':   'var(--muted-foreground)',
        'gym-accent':  'var(--primary)',
        'gym-border':  'var(--border)',
        'gym-success': 'var(--success)',
        'chart-1':     'var(--chart-1)',
        'chart-2':     'var(--chart-2)',
        'chart-3':     'var(--chart-3)',
        'chart-4':     'var(--chart-4)',
        'chart-5':     'var(--chart-5)',
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
