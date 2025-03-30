/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        clash: ['ClashDisplay', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#E8856B',
          dark: '#D67559', // 10% darker for pressed states
          light: '#F2A08B',
          hover: '#EC9780',
        },
        // Secondary Colors
        secondary: {
          DEFAULT: '#2D7D8A',
          dark: '#256974',
          light: '#3B97A6',
          hover: '#348F9E',
        },
        // Background Colors
        background: {
          peach: '#FFECD9',
          cream: '#FFF6E9',
        },
        // Text Colors
        text: {
          heading: '#32302C', // Charcoal
          body: '#555555', // Dark Gray
          muted: '#777777',
          primary: '#32302C',
        },
        // Accent Colors
        accent: {
          mint: '#A9D9C6',
          mustard: '#F3CA40',
          rust: '#C1614F',
        },
        // Card Colors
        card: {
          DEFAULT: '#FDFDFD',
          border: '#E8856B',
        },
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 6px 24px rgba(0, 0, 0, 0.12)',
        'nav': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'inner': 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 1.5px rgba(232, 133, 107, 0.25)',
      },
      backdropBlur: {
        'nav': '10px',
      },
      fontSize: {
        'xs': '0.694rem',
        'sm': '0.833rem',
        'base': '1rem',
        'lg': '1.2rem',
        'xl': '1.44rem',
        '2xl': '1.728rem',
        '3xl': '2.074rem',
        '4xl': '2.488rem',
      },
      dropShadow: {
        'glow': '0 0 8px rgba(232, 133, 107, 0.3)',
      },
      transitionDuration: {
        '280': '280ms',
        '320': '320ms',
      },
      transitionTimingFunction: {
        'custom-ease': 'cubic-bezier(0.2, 0, 0.2, 1)',
      },
      borderRadius: {
        'full': '9999px',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      strokeWidth: {
        '2': '2px',
      },
      keyframes: {
        tiltHover: {
          '0%, 100%': { transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)' },
          '50%': { transform: 'perspective(1000px) rotateX(2deg) rotateY(2deg)' },
        },
        quickDecisionRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(15deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        cardGlow: {
          '0%': { boxShadow: '0 0 0 rgba(232, 133, 107, 0)' },
          '50%': { boxShadow: '0 0 1.5px rgba(232, 133, 107, 0.25)' },
          '100%': { boxShadow: '0 0 0 rgba(232, 133, 107, 0)' },
        },
      },
      animation: {
        'tilt-hover': 'tiltHover 3s ease-in-out infinite',
        'quick-decision-rotate': 'quickDecisionRotate 2s ease-in-out infinite',
        'card-glow': 'cardGlow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};