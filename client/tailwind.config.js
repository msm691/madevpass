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
      // Échelle typographique fluide (clamp) — titres éditoriaux premium
      fontSize: {
        'display-2xl': ['clamp(3rem, 1.8rem + 5.4vw, 6rem)', { lineHeight: '0.96', letterSpacing: '-0.035em', fontWeight: '600' }],
        'display-xl': ['clamp(2.4rem, 1.6rem + 3.6vw, 4.5rem)', { lineHeight: '0.98', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-lg': ['clamp(2rem, 1.4rem + 2.6vw, 3.25rem)', { lineHeight: '1.02', letterSpacing: '-0.025em', fontWeight: '600' }],
        'display-md': ['clamp(1.6rem, 1.2rem + 1.6vw, 2.25rem)', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '600' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.18em', fontWeight: '600' }],
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
        // Accent secondaire chaud (rareté maîtrisée : highlights, badges "nouveau")
        amber: {
          400: '#FBBF6A',
          500: '#F59E32',
          600: '#E07C12',
        },
        // Statuts sémantiques accordés à la palette (jamais criards)
        success: { DEFAULT: '#0F9E74', 500: '#0F9E74', 400: '#2FC79A', bg: '#E7F7F1' },
        warning: { DEFAULT: '#E0900F', 500: '#E0900F', 400: '#F5B342', bg: '#FBF2DE' },
        danger: { DEFAULT: '#E1394B', 500: '#E1394B', 400: '#F26576', bg: '#FCE8EA' },
        info: { DEFAULT: '#2347E6', 500: '#2347E6', 400: '#6680F4', bg: '#EEF2FF' },
        // Palette data-viz harmonisée pour Recharts (dégradé chromatique cohérent)
        chart: {
          1: '#2347E6', // cobalt
          2: '#0F9E74', // teal-emerald
          3: '#F59E32', // amber
          4: '#7C5CFF', // violet
          5: '#E1394B', // rose
          6: '#12A5C9', // cyan
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
        '4xl': '2.25rem',
      },
      boxShadow: {
        // Ombres teintées cobalt/navy (jamais noir pur)
        card: '0 1px 2px 0 rgba(13,15,20,0.04), 0 10px 30px -16px rgba(26,44,128,0.22)',
        'card-hover': '0 2px 6px 0 rgba(13,15,20,0.06), 0 22px 48px -20px rgba(35,71,230,0.30)',
        cobalt: '0 10px 34px -10px rgba(35,71,230,0.50)',
        'cobalt-sm': '0 6px 18px -8px rgba(35,71,230,0.45)',
        // Échelle d'élévation continue (e1 posé → e5 flottant)
        e1: '0 1px 2px -1px rgba(13,15,20,0.08), 0 1px 3px 0 rgba(26,44,128,0.06)',
        e2: '0 2px 4px -2px rgba(13,15,20,0.08), 0 6px 16px -8px rgba(26,44,128,0.14)',
        e3: '0 4px 8px -4px rgba(13,15,20,0.08), 0 14px 34px -14px rgba(26,44,128,0.20)',
        e4: '0 8px 18px -8px rgba(13,15,20,0.10), 0 26px 56px -22px rgba(26,44,128,0.28)',
        e5: '0 16px 40px -12px rgba(13,15,20,0.14), 0 40px 90px -34px rgba(35,71,230,0.34)',
        // alias rétro-compat (anciennes classes shadow-glow)
        glow: '0 10px 34px -10px rgba(35,71,230,0.50)',
        'glow-sm': '0 6px 18px -8px rgba(35,71,230,0.45)',
      },
      backgroundImage: {
        'grid-line':
          'linear-gradient(to right, rgba(26,44,128,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,44,128,0.06) 1px, transparent 1px)',
        'mesh-cobalt':
          'radial-gradient(60% 60% at 15% 0%, rgba(35,71,230,0.18) 0%, transparent 60%), radial-gradient(50% 60% at 100% 20%, rgba(124,92,255,0.14) 0%, transparent 55%), radial-gradient(70% 70% at 60% 100%, rgba(18,165,201,0.12) 0%, transparent 60%)',
        shine: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)',
        'cobalt-fade': 'linear-gradient(135deg, #2347E6 0%, #1C39C9 55%, #1A2C80 100%)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      transitionTimingFunction: {
        // Easings premium partagés (motion cohérente app-wide)
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)', // sortie expo — apparitions
        snappy: 'cubic-bezier(0.16, 1, 0.3, 1)', // sortie vive — hovers
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // léger dépassement — press
        'in-out-quint': 'cubic-bezier(0.65, 0, 0.35, 1)',
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
        // Apparitions séquentielles (stagger via delay)
        'reveal-up': { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'reveal-blur': { from: { opacity: '0', filter: 'blur(12px)', transform: 'translateY(10px)' }, to: { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        // Ambiances de fond
        'gradient-pan': { '0%,100%': { 'background-position': '0% 50%' }, '50%': { 'background-position': '100% 50%' } },
        aurora: { '0%,100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: '0.7' }, '50%': { transform: 'translate3d(3%,-4%,0) scale(1.08)', opacity: '1' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'pulse-ring': { '0%': { boxShadow: '0 0 0 0 rgba(35,71,230,0.45)' }, '70%,100%': { boxShadow: '0 0 0 12px rgba(35,71,230,0)' } },
      },
      animation: {
        'scan-line': 'scan-line 2.2s ease-in-out infinite alternate',
        shimmer: 'shimmer 1.6s infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease-out both',
        'reveal-up': 'reveal-up 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'reveal-blur': 'reveal-blur 0.8s cubic-bezier(0.22,1,0.36,1) both',
        'scale-in': 'scale-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
        'gradient-pan': 'gradient-pan 10s ease infinite',
        aurora: 'aurora 16s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.66,0,0,1) infinite',
      },
    },
  },
  plugins: [],
}
