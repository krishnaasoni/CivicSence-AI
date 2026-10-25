import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0f19",
        surface: {
          DEFAULT: "rgba(15, 23, 42, 0.65)",
          elevated: "rgba(30, 41, 59, 0.75)",
          border: "rgba(51, 65, 85, 0.45)",
        },
        civic: {
          emerald: "#10b981",
          cyan: "#06b6d4",
          amber: "#f59e0b",
          rose: "#f43f5e",
          violet: "#8b5cf6",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "civic-glow": "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
        "alert-glow": "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      boxShadow: {
        "neon-emerald": "0 0 25px -3px rgba(16, 185, 129, 0.35)",
        "neon-cyan": "0 0 25px -3px rgba(6, 182, 212, 0.35)",
        "neon-amber": "0 0 25px -3px rgba(245, 158, 11, 0.35)",
        "glass-card": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glow-subtle": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
