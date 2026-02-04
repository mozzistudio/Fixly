import type { Config } from 'tailwindcss';
import { tailwindTheme } from '@fixly/ui';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    ...tailwindTheme,
  },
  plugins: [],
};

export default config;
