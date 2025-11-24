/** @type {import('tailwindcss').Config} */
module.exports = {
  // This tells Tailwind to look in all files in the 'src' directory 
  // with extensions .js, .jsx, .ts, or .tsx for Tailwind classes.
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-color": "#00927c",
        "secondary-color": "#EAF0F1"
    },
  },
  plugins: [],
}
}
