/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Comprehensive responsive breakpoints
      screens: {
        'xs': '320px',      // Small mobile
        'sm': '480px',      // Large mobile
        'md': '768px',      // Tablet
        'lg': '1024px',     // Small laptop
        'xl': '1280px',     // Desktop
        '2xl': '1536px',    // Large desktop
        '3xl': '1920px',    // Extra large screens
      },
      // Fluid typography scale with better responsive scaling
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
        // Enhanced fluid typography using clamp() for better responsive scaling
        'fluid-xs': ['clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)', { lineHeight: '1.4' }],
        'fluid-sm': ['clamp(0.875rem, 0.8rem + 0.375vw, 1rem)', { lineHeight: '1.5' }],
        'fluid-base': ['clamp(1rem, 0.9rem + 0.5vw, 1.125rem)', { lineHeight: '1.6' }],
        'fluid-lg': ['clamp(1.125rem, 1rem + 0.625vw, 1.25rem)', { lineHeight: '1.6' }],
        'fluid-xl': ['clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)', { lineHeight: '1.5' }],
        'fluid-2xl': ['clamp(1.5rem, 1.3rem + 1vw, 2rem)', { lineHeight: '1.3' }],
        'fluid-3xl': ['clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem)', { lineHeight: '1.2' }],
        'fluid-4xl': ['clamp(2.25rem, 1.9rem + 1.75vw, 3rem)', { lineHeight: '1.1' }],
        'fluid-5xl': ['clamp(3rem, 2.5rem + 2.5vw, 4rem)', { lineHeight: '1' }],
        'fluid-6xl': ['clamp(3.75rem, 3rem + 3.75vw, 5rem)', { lineHeight: '1' }],
        'fluid-7xl': ['clamp(4.5rem, 3.5rem + 5vw, 6rem)', { lineHeight: '1' }],
      },
      // Enhanced responsive spacing system
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        // Responsive spacing utilities
        'responsive-1': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'responsive-2': 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
        'responsive-3': 'clamp(0.75rem, 0.6rem + 0.75vw, 1.5rem)',
        'responsive-4': 'clamp(1rem, 0.8rem + 1vw, 2rem)',
        'responsive-6': 'clamp(1.5rem, 1.2rem + 1.5vw, 3rem)',
        'responsive-8': 'clamp(2rem, 1.6rem + 2vw, 4rem)',
        'responsive-12': 'clamp(3rem, 2.4rem + 3vw, 6rem)',
        'responsive-16': 'clamp(4rem, 3.2rem + 4vw, 8rem)',
        'responsive-20': 'clamp(5rem, 4rem + 5vw, 10rem)',
        'responsive-24': 'clamp(6rem, 4.8rem + 6vw, 12rem)',
      },
      // Enhanced container configuration
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          xs: '1.5rem',
          sm: '2rem',
          md: '2.5rem',
          lg: '3rem',
          xl: '4rem',
          '2xl': '5rem',
        },
        screens: {
          xs: '320px',
          sm: '480px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      // Enhanced responsive grid system
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(280px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(280px, 1fr))',
        'responsive-1': 'repeat(1, 1fr)',
        'responsive-2': 'repeat(auto-fit, minmax(250px, 1fr))',
        'responsive-3': 'repeat(auto-fit, minmax(300px, 1fr))',
        'responsive-4': 'repeat(auto-fit, minmax(250px, 1fr))',
      },
      // Enhanced responsive aspect ratios
      aspectRatio: {
        'auto': 'auto',
        'square': '1 / 1',
        'video': '16 / 9',
        'portrait': '3 / 4',
        'landscape': '4 / 3',
        'mobile': '9 / 16',
        'tablet': '4 / 3',
        'desktop': '16 / 10',
      },
      // Responsive animation durations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      // Responsive keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Responsive z-index scale
      zIndex: {
        'modal': '1000',
        'overlay': '999',
        'dropdown': '100',
        'sticky': '50',
        'tooltip': '200',
      },
    },
  },
  plugins: [
    // Custom plugin for responsive utilities
    function({ addUtilities, theme }) {
      const responsiveUtilities = {
        '.touch-target': {
          'min-height': '44px',
          'min-width': '44px',
        },
        '.safe-area-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-area-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-area-left': {
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.safe-area-right': {
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
      };
      addUtilities(responsiveUtilities);
    },
  ],
};
