/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          fg: '#ffffff',
          600: '#7C3AED',
          500: '#8b5cf6',
          400: '#a78bfa',
        },
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(124,58,237,0.55)',
        'glow-sm': '0 0 20px -6px rgba(124,58,237,0.5)',
      },
      keyframes: {
        'scan-line': {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'scan-line': 'scan-line 2.2s ease-in-out infinite alternate',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
}
