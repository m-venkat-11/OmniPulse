import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#183B2B",
          50: "#E8F0EC",
          100: "#C5D8CB",
          200: "#9EBFAA",
          300: "#77A589",
          400: "#508F68",
          500: "#2D7348",
          600: "#255E3B",
          700: "#1E4A2E",
          800: "#183B2B",
          900: "#0E2419",
        },
        ivory: {
          DEFAULT: "#F6F4ED",
          50: "#FDFCF9",
          100: "#F6F4ED",
          200: "#EDEADF",
          300: "#E4E0D1",
          400: "#DAD5C2",
        },
        graphite: {
          DEFAULT: "#292D2B",
          50: "#E8E9E8",
          100: "#C5C8C6",
          200: "#9EA3A0",
          300: "#777E7B",
          400: "#555B58",
          500: "#3C4240",
          600: "#292D2B",
          700: "#1A1E1C",
        },
        sage: {
          DEFAULT: "#DCE5D9",
          50: "#F5F7F4",
          100: "#DCE5D9",
          200: "#C3D1BE",
          300: "#AABCA4",
          400: "#91A78A",
        },
        brass: {
          DEFAULT: "#B39A67",
          50: "#F5EFE3",
          100: "#E6D5B0",
          200: "#D4BA7D",
          300: "#C2A050",
          400: "#B39A67",
          500: "#96803A",
          600: "#7A6630",
          700: "#5D4D23",
        },
        neutral: {
          50: "#F9F9F8",
          100: "#F0F0EE",
          200: "#E0E0DC",
          300: "#C8C8C2",
          400: "#A8A8A0",
          500: "#888880",
          600: "#666660",
          700: "#484843",
          800: "#2E2E2B",
          900: "#1A1A18",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "Georgia", "serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        "display-xl": ["5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["3.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2.75rem", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "display-sm": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
        34: "8.5rem",
        38: "9.5rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "editorial": "0 1px 2px rgba(24,59,43,0.04), 0 4px 16px rgba(24,59,43,0.06)",
        "editorial-lg": "0 2px 4px rgba(24,59,43,0.04), 0 8px 32px rgba(24,59,43,0.10)",
        "brass": "0 4px 24px rgba(179,154,103,0.18)",
        "inset-sage": "inset 0 1px 0 rgba(220,229,217,0.6)",
      },
      backgroundImage: {
        "gradient-editorial": "linear-gradient(135deg, #F6F4ED 0%, #EDE9DF 100%)",
        "gradient-forest": "linear-gradient(135deg, #183B2B 0%, #0E2419 100%)",
        "gradient-brass": "linear-gradient(135deg, #B39A67 0%, #8C7A50 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "fade-up": "fadeUp 0.7s ease-out",
        "slide-right": "slideRight 0.5s ease-out",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
