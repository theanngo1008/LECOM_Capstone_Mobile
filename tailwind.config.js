/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}","./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Project brand colors
        white: "rgb(255, 255, 255)",
        cream: "rgb(248, 243, 237)",
        beige: "rgb(224, 216, 206)",
        lavender: "rgb(205, 182, 219)",
        skyBlue: "rgb(165, 196, 251)",
        mint: "rgb(172, 214, 184)",
        gold: "rgb(255, 203, 102)",
        coral: "rgb(242, 162, 151)",
        
        // Light theme colors
        light: {
          background: "#FFFFFF",
          surface: "rgb(248, 243, 237)",
          card: "#FFFFFF",
          text: "#000000",
          textSecondary: "#6B7280",
          border: "rgb(224, 216, 206)",
        },
        // Dark theme colors
        dark: {
          background: "#000000",
          surface: "#1C1C1E",
          card: "#1C1C1E",
          text: "#FFFFFF",
          textSecondary: "#9CA3AF",
          border: "#38383A",
        },
        primary: {
          light: "rgb(165, 196, 251)",
          dark: "rgb(205, 182, 219)",
          DEFAULT: "rgb(165, 196, 251)",
        },
        secondary: {
          light: "rgb(172, 214, 184)",
          dark: "rgb(255, 203, 102)",
          DEFAULT: "rgb(172, 214, 184)",
        },
      },
    },
  },
  plugins: [],
};