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
        // Luxury Obsidian Canvas (Apple / Linear / Vercel style)
        obsidian: {
          950: "#020408", // Purest deep space obsidian
          900: "#060913", // Card base
          850: "#0B101E", // Elevated surface
          800: "#10172A", // Hover state
          700: "#1A243B", // Border highlight
        },
        // Hyper-Vibrant Luxury Accents (Stripe / Apple / Linear)
        luxury: {
          mint: "#00F5A0",       // Electric Mint / Emerald
          cyan: "#00D9F5",       // Hyper Cyan
          indigo: "#6366F1",     // Royal Iris
          violet: "#8B5CF6",     // Cyber Violet
          fuchsia: "#D946EF",    // Neon Fuchsia
          gold: "#FFB800",       // Imperial Gold
          amber: "#F59E0B",      // Amber Glow
          crimson: "#FF3366",    // Emergency Crimson
        },
        civic: {
          emerald: "#00F5A0",
          cyan: "#00D9F5",
          blue: "#3B82F6",
          amber: "#FFB800",
          rose: "#FF3366",
          violet: "#8B5CF6",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "civic-glow": "linear-gradient(135deg, #00F5A0 0%, #00D9F5 50%, #6366F1 100%)",
        "alert-glow": "linear-gradient(135deg, #FFB800 0%, #FF3366 100%)",
        "luxury-glow": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #D946EF 100%)",
        "gold-glow": "linear-gradient(135deg, #FFE259 0%, #FFA751 100%)",
        "silver-gradient": "linear-gradient(180deg, #FFFFFF 0%, #CBD5E1 50%, #64748B 100%)",
        "aurora-gradient": "radial-gradient(ellipse at 50% 0%, rgba(0, 245, 160, 0.18) 0%, rgba(0, 217, 245, 0.15) 30%, rgba(99, 102, 241, 0.1) 60%, transparent 100%)",
      },
      boxShadow: {
        "luxury-mint": "0 0 35px -5px rgba(0, 245, 160, 0.45)",
        "luxury-cyan": "0 0 35px -5px rgba(0, 217, 245, 0.45)",
        "luxury-indigo": "0 0 35px -5px rgba(99, 102, 241, 0.45)",
        "luxury-gold": "0 0 35px -5px rgba(255, 184, 0, 0.45)",
        "luxury-crimson": "0 0 35px -5px rgba(255, 51, 102, 0.45)",
        "glass-specular": "inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 20px 45px -15px rgba(0, 0, 0, 0.8)",
        "card-ambient": "0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "aurora": "aurora 10s ease infinite alternate",
        "shimmer": "shimmer 3s linear infinite",
        "spin-slow": "spin 25s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        aurora: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
