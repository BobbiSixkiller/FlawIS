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
          50: "#faf5f7",
          100: "#f6edef",
          200: "#eedce1",
          300: "#e1c0c8",
          400: "#cd99a5",
          500: "#b46b7a",
          600: "#a55d68",
          700: "#8c4a52",
          800: "#753f45",
          900: "#63383d",
          950: "#3a1d20",
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
