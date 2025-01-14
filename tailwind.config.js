/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "App.tsx"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#1D1C21",
        primary: "#8884d8",
        highlight: "#3AFF16",
        secondary: "#2D2C31",
        tertiary: "#3D3C41",
      },
    },
  },
  plugins: [],
};
