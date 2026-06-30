/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Display = Outfit (caractère géométrique), corps = Geist, data = Geist Mono
        display: ['"Outfit Variable"', 'Outfit', 'system-ui', 'sans-serif'],
        sans: ['"Geist Variable"', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono Variable"', '"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Accent UNIQUE : cobalt. `primary` est un alias → bascule globale violet→cobalt.
        cobalt: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C3CEFE',
          300: '#97A9FB',
          400: '#6680F4',
          500: '#2347E6',
          600: '#1C39C9',
          700: '#1A30A0',
          800: '#1A2C80',
          900: '#1A2A66',
          950: '#11183D',
          DEFAULT: '#2347E6',
          fg: '#ffffff',
        },
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C3CEFE',
          300: '#97A9FB',
          400: '#6680F4',
          500: '#2347E6',
          600: '#1C39C9',
          700: '#1A30A0',
          800: '#1A2C80',
          900: '#1A2A66',
          950: '#11183D',
          DEFAULT: '#2347E6',
          fg: '#ffffff',
        },
        // Surfaces : crème en clair, ink (bleu-noir) en sombre
        cream: {
          DEFAULT: '#FAF9F6',
          50: '#FDFCFA',
          100: '#F4F2EC',
        },
        ink: {
          DEFAULT: '#0D0F14',
          950: '#0D0F14',
          900: '#11141B',
          850: '#151922',
          800: '#1B2030',
          700: '#252B3D',
        },
      },
      borderRadius: {
        // Échelle verrouillée : inputs lg(10px) · boutons xl(14px) · cards 2xl(18px) · conteneurs 3xl(26px)
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.125rem',
        '3xl': '1.625rem',
      },
      boxShadow: {
        // Ombres teintées cobalt/navy (jamais noir pur)
        card: '0 1px 2px 0 rgba(13,15,20,0.04), 0 10px 30px -16px rgba(26,44,128,0.22)',
        'card-hover': '0 2px 6px 0 rgba(13,15,20,0.06), 0 22px 48px -20px rgba(35,71,230,0.30)',
        cobalt: '0 10px 34px -10px rgba(35,71,230,0.50)',
        'cobalt-sm': '0 6px 18px -8px rgba(35,71,230,0.45)',
        // alias rétro-compat (anciennes classes shadow-glow)
        glow: '0 10px 34px -10px rgba(35,71,230,0.50)',
        'glow-sm': '0 6px 18px -8px rgba(35,71,230,0.45)',
      },
      zIndex: {
        nav: '50',
        overlay: '60',
        modal: '70',
        toast: '80',
      },
      keyframes: {
        'scan-line': { '0%': { top: '0%' }, '100%': { top: '100%' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        'scan-line': 'scan-line 2.2s ease-in-out infinite alternate',
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
