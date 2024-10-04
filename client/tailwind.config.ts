import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fcf3f9",
          100: "#f9e7f6",
          200: "#f0cee9",
          300: "#e3a6d4",
          400: "#d270b6",
          500: "#97357c",
          600: "#71335f",
          700: "#5e294d",
          800: "#4d223f",
          900: "#3f1f34",
          950: "#2a0d20",
        },
      },
      fontFamily: {
        UKsans: ["UKsans"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
