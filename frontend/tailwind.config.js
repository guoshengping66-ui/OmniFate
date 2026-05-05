/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: "#C9A84C", light: "#E8CB7A", dark: "#A07C2A" },
        ink:  { DEFAULT: "#1A0F2E", light: "#2D1B4E" },
        jade: { DEFAULT: "#2D6A4F", light: "#52B788" },
        crimson: { DEFAULT: "#C1121F", light: "#E63946" },
        wood:   "#2D6A4F",
        fire:   "#C1121F",
        earth:  "#C9A84C",
        metal:  "#E8D5B7",
        water:  "#2980B9",
      },
      fontFamily: {
        serif: ["Noto Serif SC", "serif"],
        sans:  ["Inter", "Noto Sans SC", "sans-serif"],
      },
      backgroundImage: {
        "star-field": "radial-gradient(ellipse at 50% 0%, #2D1B4E 0%, #1A0F2E 60%, #0D0715 100%)",
        "gold-shine": "linear-gradient(135deg, #C9A84C 0%, #E8CB7A 50%, #C9A84C 100%)",
      },
      animation: {
        "shimmer": "shimmer 2.5s linear infinite",
        "float":   "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        shimmer: { "0%,100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
        float:   { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
      },
    },
  },
  plugins: [],
}