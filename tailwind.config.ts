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
        sage: "rgb(var(--sage) / <alpha-value>)",
        powder: "rgb(var(--powder) / <alpha-value>)",
        butter: "rgb(var(--butter) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-fraunces)", "serif"],
      },
      boxShadow: {
        editorial: "0 24px 70px -42px rgba(26, 26, 26, 0.42)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        veil:
          "linear-gradient(115deg, rgba(220,237,233,0.52), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.62), rgba(255,255,255,0))",
      },
    },
  },
  plugins: [],
};
export default config;
