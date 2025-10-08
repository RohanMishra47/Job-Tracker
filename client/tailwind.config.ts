/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'page-bg': '#f4f1eb',
        'card-bg': '#CAC8C9',
        heading: '#161528',
        'body-text': '#464353',
        subtle: '#ABA9AC',
      },
    },
  },
  plugins: [],
};
