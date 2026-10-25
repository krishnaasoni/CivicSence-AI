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
        // Deep Space Color Grading
        space: {
          950: "#070B14", // Primary Deep Space Background
          900: "#0B1220", // Secondary Layer
          850: "#0E1729", // Elevated Panel Layer
          800: "#111827", // Tertiary Layer
          700: "#1E293B", // Border Accent Layer
        },
        // Accents
        civic: {
          emerald: "#10B981", // Emerald Intelligence
          cyan: "#06B6D4",    // Civic Cyan
          blue: "#3B82F6",    // AI Blue
          amber: "#F59E0B",   // Saffron Priority
          rose: "#F43F5E",    // Emergency Rose
          violet: "#8B5CF6",  // Neural Purple
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "civic-glow": "linear-gradient(135deg, #10B981 0%, #06B6D4 50%, #3B82F6 100%)",
        "alert-glow": "linear-gradient(135deg, #F59E0B 0%, #F43F5E 100%)",
        "neural-glow": "linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      boxShadow: {
        "neon-emerald": "0 0 25px -3px rgba(16, 185, 129, 0.45)",
        "neon-cyan": "0 0 25px -3px rgba(6, 182, 212, 0.45)",
        "neon-blue": "0 0 25px -3px rgba(59, 130, 246, 0.45)",
        "neon-amber": "0 0 25px -3px rgba(245, 158, 11, 0.45)",
        "neon-rose": "0 0 25px -3px rgba(244, 63, 94, 0.45)",
        "glass-card": "0 8px 32px 0 rgba(0, 0, 0, 0.55)",
        "glow-subtle": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "radar": "radar 4s linear infinite",
        "scan": "scan 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s infinite",
        "spin-slow": "spin 20s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        scan: {
          "0%, 100%": { transform: "translateY(0%)" },
          "50%": { transform: "translateY(100%)" },
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
