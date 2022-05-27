module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(-4px)" },
          "100%": { opacity: 1, transform: "translateY(0px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-in",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
