import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0a0a",
          900: "#171717",
          800: "#262626",
          700: "#404040",
          600: "#525252",
          500: "#737373",
          400: "#a3a3a3",
          300: "#d4d4d4",
          200: "#e5e5e5",
          100: "#f5f5f5",
          50: "#fafafa",
        },
        // Verde-esmeralda da marca (logo): cor primária de interação.
        brand: {
          50: "#eafaf1",
          100: "#c9f3dd",
          200: "#97e9bf",
          300: "#5fd99c",
          400: "#34c97f",
          500: "#16b06a",
          600: "#0e9659",
          700: "#0b7547",
          800: "#0a5b38",
        },
        // Acento secundário: amarelo de sinalização viária (estado "visitado").
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
        },
        // Superfície do pátio: asfalto.
        asphalt: {
          950: "#16171a",
          900: "#1b1d21",
          800: "#212327",
          700: "#2a2d32",
          600: "#34373d",
          line: "#f2c94c",
        },
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(10, 10, 10, 0.04), 0 1px 2px 0 rgba(10, 10, 10, 0.04)",
        lift: "0 4px 16px -8px rgba(23, 23, 23, 0.12)",
        car: "0 6px 14px -6px rgba(0, 0, 0, 0.55)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        "drive-in": "driveIn 520ms cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        driveIn: {
          "0%": { opacity: "0", transform: "translateY(-118%) scale(0.96)" },
          "70%": { opacity: "1", transform: "translateY(4%) scale(1)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
