import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#fffbfe",
        gray: {
          100: "#dedcdd",
          200: "#bcb9bb",
          300: "#9b9698",
          400: "#797476",
          500: "#565254",
          600: "#454243",
          700: "#333132",
          800: "#222122",
          900: "#111011",
        },
        blue: {
          200: "#9BD6F4",
          300: "#5fbeed",
          400: "#37ade9",
          500: "#1899d9",
          600: "#137aaE",
        },
        purple: {
          200: "#c3ccf8",
          400: "#8799F2",
          600: "#1838d9",
          800: "#0e2282",
          900: "#071141",
        },
        red: {
          200: "#f07b8e",
          500: "#e72445",
          600: "#c73a60",
          700: "#a64f7b",
        },
        "blue-primary": "#24a6e7",
        "royal-secondary": "#2445e7",
        "turquoise-tertiary": "#24e7c7",
        "dark-bg": "#0e0e0e",
        "stroke-dark": "#2b292a",
        "dark-secondary": "#1d1b1c",
        "dark-tertiary": "#393738",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;
