/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'page-bg': '#F3F0EC',
        'card-bg': '#CAC8C9',
        heading: '#343149',
        'body-text': '#464353',
        subtle: '#ABA9AC',
      },
    },
  },
  plugins: [],
};
