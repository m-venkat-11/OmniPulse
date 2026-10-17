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
        // ── OmniPulse Dark Bento Design System (Finance_app_design.jpg) ──
        canvas:   "#6B6B6B",
        app:      "#050505",
        card:     "#161616",
        "card-subtle": "#1E1E1E",
        pill:     "#111111",
        input:    "#1C1C1C",
        track:    "#2A2A2A",

        // Accent Tokens
        "accent-green":  "#2BD64F",
        "accent-yellow": "#FFE234",
        "accent-red":    "#FF5C5C",
        "accent-blue":   "#60A5FA",

        // Border tokens
        "border-subtle": "#222222",
        "border-active": "#333333",

        // Text tokens
        "text-muted": "#A3A3A3",
        "text-dim":   "#666666",

        // ── Legacy semantic aliases (keep for backward compat) ──
        forest: {
          DEFAULT: "#2BD64F",
          50: "#F0FFF4",
          100: "#C6F6D5",
          200: "#9AE6B4",
          300: "#68D391",
          400: "#48BB78",
          500: "#2BD64F",
          600: "#22A63C",
          700: "#1A7D2E",
          800: "#145921",
          900: "#0D3614",
        },
        ivory: {
          DEFAULT: "#1E1E1E",
          50: "#2A2A2A",
          100: "#222222",
        },
        graphite: {
          DEFAULT: "#FFFFFF",
          50: "#FFFFFF",
          100: "#E5E5E5",
        },
        sage: {
          DEFAULT: "#2A2A2A",
          50: "#333333",
          100: "#2A2A2A",
          200: "#222222",
        },
        brass: {
          DEFAULT: "#FFE234",
          50: "#FFFACC",
          100: "#FFF59D",
          200: "#FFE234",
          300: "#F9CA00",
          400: "#E6B800",
        },
        neutral: {
          50: "#F5F5F5",
          100: "#E5E5E5",
          200: "#D4D4D4",
          300: "#A3A3A3",
          400: "#737373",
          500: "#525252",
          600: "#404040",
          700: "#262626",
          800: "#171717",
          900: "#0A0A0A",
        },
      },
      fontFamily: {
        sans:    ["Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif:   ["Poppins", "sans-serif"],
        display: ["Poppins", "sans-serif"],
        mono:    ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
        "pill": "9999px",
      },
      boxShadow: {
        "bento": "0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)",
        "bento-lg": "0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
        "green-glow": "0 0 24px rgba(43,214,79,0.25)",
        "editorial": "0 1px 2px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)",
        "editorial-lg": "0 2px 4px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.4)",
        "brass": "0 4px 24px rgba(255,226,52,0.18)",
        "inset-sage": "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease-out both",
        "fade-up":    "fadeUp 0.6s ease-out both",
        "slide-left": "slideInLeft 0.4s ease-out both",
        "pulse-green": "pulseGreen 2s ease-in-out infinite",
        "spin-slow":  "spin 20s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGreen: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(43,214,79,0.4)" },
          "50%":       { boxShadow: "0 0 0 8px rgba(43,214,79,0)" },
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
