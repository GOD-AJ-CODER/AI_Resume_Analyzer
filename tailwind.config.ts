import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#FAF6F0", // Warm Editorial Paper
          dark: "#07241D", // Deep Forest Pine
        },
        surface: {
          light: "#FFFFFF", // Crisp Ivory
          dark: "#0C3329", // Primary Card (updated)
          elevatedLight: "#F3EDE2",
          elevatedDark: "#114034", // Elevated/Hover Card (updated)
        },
        border: {
          light: "#E5DFD3", // Subtle ivory border
          dark: "rgba(214, 255, 107, 0.15)", // Subtle crisp lines (updated to /15)
        },
        text: {
          primaryLight: "#281416", // Deep Espresso Burgundy
          mutedLight: "#6D595B", // Warm Taupe
          primaryDark: "#F5F2EB", // Warm Cream White
          mutedDark: "#9EB5AC", // Soft Sage
        },
        accent: {
          lime: "#D6FF6B", // Electric Acid Lime
          espresso: "#281416", // Deep Espresso
        }
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "Plus Jakarta Sans", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "serif"],
        mono: ["var(--font-geist-mono)", "JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
