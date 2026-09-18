import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#fafafa', // zinc-50
          card: '#ffffff',    // pure white
          border: '#e4e4e7',  // zinc-200
          muted: '#f4f4f5',   // zinc-100
        },
        solar: {
          light: '#10b981',   // emerald-500
          DEFAULT: '#059669', // emerald-600
          dark: '#047857',    // emerald-700
        },
        grid: {
          light: '#3b82f6',   // blue-500
          DEFAULT: '#2563eb', // blue-600 (Royal Cobalt Blue)
          dark: '#1d4ed8',    // blue-700
        },
        battery: {
          light: '#f59e0b',   // amber-500
          DEFAULT: '#d97706', // amber-600 (Industrial Ochre)
          dark: '#b45309',    // amber-700
        },
        demand: {
          light: '#18181b',   // zinc-900
          DEFAULT: '#09090b', // zinc-950 (Carbon Black)
          dark: '#000000',
        },
      },
      boxShadow: {
        micro: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        subtle: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
