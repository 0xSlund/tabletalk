/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // Enable dark mode with CSS class
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
        clash: ["ClashDisplay", "system-ui", "sans-serif"],
      },
      colors: {
        // Primary Colors - Using CSS variables for dark mode support
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
          light: "#F2A08B",
          hover: "var(--color-primary-hover)",
        },
        // Secondary Colors
        secondary: {
          DEFAULT: "#2D7D8A",
          dark: "#256974",
          light: "#3B97A6",
          hover: "#348F9E",
        },
        // Background Colors
        background: {
          peach: "#FFECD9",
          cream: "#FFF6E9",
        },
        // Text Colors
        text: {
          heading: "var(--color-text-primary)",
          body: "var(--color-text-secondary)",
          muted: "var(--color-text-tertiary)",
          primary: "var(--color-text-primary)",
        },
        // Accent Colors
        accent: {
          mint: "var(--color-accent-mint)",
          mustard: "var(--color-accent-mustard)",
          rust: "var(--color-accent-rust)",
        },
        // Card Colors
        card: {
          DEFAULT: "var(--color-card)",
          border: "var(--color-card-border)",
        },
      },
      opacity: {
        5: "0.05",
        10: "0.1",
        15: "0.15",
        20: "0.2",
        30: "0.3",
        70: "0.7",
        80: "0.8",
        85: "0.85",
        90: "0.9",
        95: "0.95",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 6px 24px rgba(0, 0, 0, 0.12)",
        nav: "0 8px 24px rgba(0, 0, 0, 0.08)",
        inner: "inset 0 1px 2px rgba(0, 0, 0, 0.05)",
        glow: "0 0 1.5px rgba(232, 133, 107, 0.25)",
        "dark-card": "0 2px 8px rgba(0, 0, 0, 0.25)",
        "dark-card-hover": "0 6px 24px rgba(0, 0, 0, 0.4)",
        "dark-nav": "0 8px 24px rgba(0, 0, 0, 0.25)",
      },
      backdropBlur: {
        nav: "10px",
      },
      fontSize: {
        xs: "0.694rem",
        sm: "0.833rem",
        base: "1rem",
        lg: "1.2rem",
        xl: "1.44rem",
        "2xl": "1.728rem",
        "3xl": "2.074rem",
        "4xl": "2.488rem",
      },
      dropShadow: {
        glow: "0 0 8px rgba(232, 133, 107, 0.3)",
        "dark-glow": "0 0 8px rgba(248, 153, 122, 0.4)",
      },
      transitionDuration: {
        280: "280ms",
        320: "320ms",
      },
      transitionTimingFunction: {
        "custom-ease": "cubic-bezier(0.2, 0, 0.2, 1)",
      },
      borderRadius: {
        full: "9999px",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      strokeWidth: {
        2: "2px",
      },
      keyframes: {
        tiltHover: {
          "0%, 100%": {
            transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
          },
          "50%": {
            transform: "perspective(1000px) rotateX(2deg) rotateY(2deg)",
          },
        },
        quickDecisionRotate: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(15deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        cardGlow: {
          "0%": { boxShadow: "0 0 0 rgba(232, 133, 107, 0)" },
          "50%": { boxShadow: "0 0 1.5px rgba(232, 133, 107, 0.25)" },
          "100%": { boxShadow: "0 0 0 rgba(232, 133, 107, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.7 },
        },
      },
      animation: {
        "tilt-hover": "tiltHover 3s ease-in-out infinite",
        "quick-decision-rotate": "quickDecisionRotate 2s ease-in-out infinite",
        "card-glow": "cardGlow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        pulse: "pulse 2s ease-in-out infinite",
      },
      lineHeight: {
        tight: "var(--line-height-tight)",
        normal: "var(--line-height-normal)",
        relaxed: "var(--line-height-relaxed)",
      },
      spacing: {
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
      },
    },
  },
  plugins: [],
};
