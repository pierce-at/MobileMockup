import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        midnight: "var(--color-midnight)",
        indigo: "var(--color-indigo)",
        gold: "var(--color-gold)",
        coral: "var(--color-coral)",
        mist: "var(--color-mist)",
        ink: "var(--color-ink)"
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 40px rgba(12, 73, 90, 0.14)",
        glow: "0 0 0 1px rgba(251, 189, 25, 0.18), 0 16px 40px rgba(12, 73, 90, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
