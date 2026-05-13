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
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        clay: "rgb(var(--clay) / <alpha-value>)",
        sage: "rgb(var(--sage) / <alpha-value>)",
        powder: "rgb(var(--powder) / <alpha-value>)",
        butter: "rgb(var(--butter) / <alpha-value>)",
        panel: "rgb(var(--panel-dark) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
      },
      boxShadow: {
        editorial: "0 24px 80px -40px rgba(22, 18, 12, 0.38)",
        soft: "0 2px 12px rgba(22, 18, 12, 0.06), 0 1px 3px rgba(22, 18, 12, 0.04)",
        card: "0 1px 2px rgba(22, 18, 12, 0.04), 0 8px 32px -12px rgba(22, 18, 12, 0.12)",
        panel: "0 32px 80px -20px rgba(22, 18, 12, 0.55)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backgroundImage: {
        veil: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0))",
      },
    },
  },
  plugins: [],
};
export default config;
