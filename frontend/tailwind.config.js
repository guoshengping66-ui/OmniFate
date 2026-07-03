/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ── Stellar Codex palette ──
        cosmos: {
          950: "#020617",  // Deepest void (body bg)
          900: "#030B1A",  // Primary background
          850: "#061025",  // Section alternate
          800: "#081530",  // Elevated surfaces
          700: "#0A1A3A",  // Borders & dividers
        },
        parchment: {
          900: "#1C1814",  // Card solid bg
          800: "#24201C",  // Card hover
          700: "#2C2824",  // Card active
          600: "#3A3630",  // Borders on parchment
          400: "#8B8578",  // Secondary text on parchment
          200: "#C4BFB0",  // Body text on parchment
          100: "#E8E3D4",  // Heading text
        },
        stellar: {
          blue:   "#7B9EC7",
          violet: "#8B7EC7",
          teal:   "#5A9E8E",
          rose:   "#C77B8B",
        },
        // ── Legacy (keep for backward compat) ──
        gold:    { DEFAULT: "#C9A84C", light: "#E8CB7A", dark: "#A07C2A" },
        ink:     { DEFAULT: "#020617", light: "#0A1A3A" },
        jade:    { DEFAULT: "#2D6A4F", light: "#52B788" },
        crimson: { DEFAULT: "#C1121F", light: "#E63946" },
        wood:   "#5A9E8E",
        fire:   "#C77B8B",
        earth:  "#C9A84C",
        metal:  "#C4BFB0",
        water:  "#7B9EC7",
      },
      fontFamily: {
        display: ["Noto Serif SC", "Source Han Serif SC", "Songti SC", "SimSun", "serif"],
        serif:   ["Noto Serif SC", "PingFang SC", "Microsoft YaHei", "Songti SC", "SimSun", "serif"],
        sans:    ["Inter", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "sans-serif"],
      },
      backgroundImage: {
        "star-field":    "radial-gradient(ellipse at 50% 0%, #0A1A3A 0%, #030B1A 50%, #020617 100%)",
        "gold-shine":    "linear-gradient(135deg, #C9A84C 0%, #E8CB7A 50%, #C9A84C 100%)",
        "star-grid":     "radial-gradient(circle, rgba(123,158,199,0.12) 0px, transparent 1px)",
        "parchment-grad": "linear-gradient(180deg, #1C1814 0%, #24201C 100%)",
      },
      animation: {
        "shimmer":           "shimmer 2.5s linear infinite",
        "float":             "float 6s ease-in-out infinite",
        "pulse-slow":        "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "constellation-draw": "constellationDraw 3s ease-out forwards",
        "star-appear":       "starAppear 0.6s ease-out forwards",
        "card-lift":         "cardLift 0.3s ease-out forwards",
      },
      keyframes: {
        shimmer:  { "0%,100%": { opacity: "0.6" }, "50%": { opacity: "1" } },
        float:    { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
        constellationDraw: { "0%": { strokeDashoffset: "1000" }, "100%": { strokeDashoffset: "0" } },
        starAppear: { "0%": { opacity: "0", transform: "scale(0.5)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        cardLift:   { "0%": { transform: "translateY(0)" }, "100%": { transform: "translateY(-4px)" } },
      },
    },
  },
  plugins: [],
}