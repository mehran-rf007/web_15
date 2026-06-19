import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "system-ui", "sans-serif"],
      },
      colors: {
        // پالت برند ژورینو
        cream: "#F7F1E6",
        sand: "#EFE4D2",
        clay: "#E7D8BF",
        gold: {
          DEFAULT: "#C9962E",
          light: "#D9AE4D",
          dark: "#A87B1E",
        },
        ink: {
          DEFAULT: "#1F1B16",
          soft: "#3B342B",
          muted: "#7A6F5F",
        },
      },
      borderRadius: {
        blob: "42% 58% 57% 43% / 45% 42% 58% 55%",
      },
      boxShadow: {
        soft: "0 20px 60px -20px rgba(31,27,22,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
