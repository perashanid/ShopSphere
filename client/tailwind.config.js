/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f6f3',
          100: '#ede8e1',
          200: '#c2c5aa',
          300: '#a4ac86',
          400: '#656d4a',
          500: '#414833',
          600: '#333d29',
          700: '#582f0e',
          800: '#7f4f24',
          900: '#936639',
        },
        accent: {
          50: '#f5f3f0',
          100: '#e8e4df',
          200: '#b6ad90',
          300: '#a68a64',
          400: '#656d4a',
          500: '#414833',
          600: '#333d29',
        },
        earth: {
          light: '#c2c5aa',
          sage: '#a4ac86', 
          olive: '#656d4a',
          forest: '#414833',
          dark: '#333d29',
          brown: '#582f0e',
          caramel: '#7f4f24',
          bronze: '#936639',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};