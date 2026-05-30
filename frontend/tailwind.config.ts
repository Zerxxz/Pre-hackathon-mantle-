import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#05060f",
        panel: "rgba(13, 18, 38, 0.55)",
        neon: {
          cyan: "#22d3ee",
          blue: "#3b82f6",
          magenta: "#e879f9",
          violet: "#8b5cf6",
          lime: "#a3e635",
        },
      },
      fontFamily: {
        display: ["Orbitron", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Rajdhani", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(34, 211, 238, 0.35)",
        "glow-magenta": "0 0 24px rgba(232, 121, 249, 0.35)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-24px) translateX(12px)" },
        },
        pulseBar: {
          "0%,100%": { opacity: "0.85" },
          "50%": { opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        floaty: "floaty 14s ease-in-out infinite",
        pulseBar: "pulseBar 2s ease-in-out infinite",
        scan: "scan 6s linear infinite",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
