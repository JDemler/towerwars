/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {    
        'smw-orange': {        
          500: '#ff8100',
        },
        'smw-yellow': {        
          500: '#fcb608',
        },
        'smw-blue': {
          500: '#1da1b8',
          700: '#003047',
        },
        'smw-purple': {
          500: '#b27ba5',
          700: '#7c2d6e'
        }        
      },
    },
  },
  plugins: [],
}
