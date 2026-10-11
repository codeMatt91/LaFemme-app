/** @type {import('tailwindcss').Config} */
// Stessa palette del backoffice web (app/globals.css, tema chiaro).
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(340, 10%, 10%)",
        border: "hsl(340, 10%, 90%)",
        input: "hsl(340, 10%, 90%)",
        primary: {
          DEFAULT: "hsl(346, 77%, 49%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        muted: {
          DEFAULT: "hsl(340, 10%, 96%)",
          foreground: "hsl(340, 5%, 45%)",
        },
        accent: {
          DEFAULT: "hsl(346, 77%, 95%)",
          foreground: "hsl(346, 77%, 30%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)",
          foreground: "hsl(0, 0%, 100%)",
        },
      },
    },
  },
  plugins: [],
};
