/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#142536',
          'navy-light': '#1E354D',
          'navy-dark': '#0D1924',
          orange: '#F28C28',
          'orange-hover': '#DD7A1B',
          red: '#D94B45',
          'red-light': '#FDF2F2',
          slate: '#526274',
          'slate-light': '#8A99A8',
          'soft-blue': '#EAF2F8',
          'warm-white': '#F8FAFC',
          'neutral-grey': '#E5E9EF',
          green: '#16A34A',
          'green-light': '#DCFCE7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(20, 37, 54, 0.05), 0 1px 2px 0 rgba(20, 37, 54, 0.03)',
        'card': '0 4px 12px 0 rgba(20, 37, 54, 0.06), 0 1px 2px 0 rgba(20, 37, 54, 0.04)',
        'elevated': '0 10px 25px -5px rgba(20, 37, 54, 0.1), 0 8px 10px -6px rgba(20, 37, 54, 0.05)',
        'modal': '0 20px 40px -10px rgba(20, 37, 54, 0.25)',
      }
    },
  },
  plugins: [],
}

