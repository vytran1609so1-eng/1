/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ------------------------------------------------------------------
         *  PALETTE — white · soft blue · navy
         *  Change these hex values and the whole site changes tone.
         * ---------------------------------------------------------------- */
        paper: {
          DEFAULT: "#FCFDFF", // page background
          100: "#F7FAFE", // lightest panel
          200: "#F0F6FD", // alternating section background
          300: "#E4EFFB", // cards, chips
          400: "#D6E6F7", // hairlines, borders
        },
        navy: {
          DEFAULT: "#16365F", // body text
          soft: "#5B7896", // secondary text
          deep: "#0F2947", // inverted sections
          line: "#D6E6F7", // rules
        },
        azure: {
          DEFAULT: "#1D63D2", // links + numbers (passes contrast on white)
          bright: "#3B82F6", // decorative accents
          light: "#8FBBF9", // accents on navy
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Times New Roman", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
      },
      maxWidth: {
        page: "1200px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(4deg)" },
        },
        /* Translation only: scaling a large gradient forces the browser to
           redraw it every frame, which is felt as a heavy page. */
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(22px,-26px,0)" },
        },
      },
      animation: {
        marquee: "marquee 34s linear infinite",
        floaty: "floaty 9s ease-in-out infinite",
        drift: "drift 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
