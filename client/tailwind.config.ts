import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'page-bg': '#f4f1eb',
        heading: '#161528',
        'body-text': '#444250',
        subtle: '#ABA9AC',
      },
    },
  },
  plugins: [],
};

export default config;
