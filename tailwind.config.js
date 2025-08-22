/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neumo': {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1a1e22',
        },
        'soft': {
          green: '#d4edda',
          blue: '#d1ecf1',
          yellow: '#fff3cd',
          red: '#f8d7da',
          purple: '#e2d9f3',
        }
      },
      boxShadow: {
        'neumo': '8px 8px 16px #c5c5c5, -8px -8px 16px #ffffff',
        'neumo-sm': '4px 4px 8px #c5c5c5, -4px -4px 8px #ffffff',
        'neumo-lg': '12px 12px 24px #c5c5c5, -12px -12px 24px #ffffff',
        'neumo-inset': 'inset 6px 6px 12px #c5c5c5, inset -6px -6px 12px #ffffff',
        'neumo-inset-sm': 'inset 3px 3px 6px #c5c5c5, inset -3px -3px 6px #ffffff',
        'neumo-pressed': 'inset 4px 4px 8px #c5c5c5, inset -4px -4px 8px #ffffff',
      }
    },
  },
  plugins: [],
}
