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
          DEFAULT: '#020617', // slate-950
          card: '#0f172a',    // slate-900
          border: '#1e293b',  // slate-800
          muted: '#334155',   // slate-700
        },
        solar: {
          light: '#34d399',   // emerald-400
          DEFAULT: '#10b981', // emerald-500
          dark: '#059669',    // emerald-600
        },
        grid: {
          light: '#22d3ee',   // cyan-400
          DEFAULT: '#06b6d4', // cyan-500
          dark: '#0891b2',    // cyan-600
        },
        battery: {
          light: '#fbbf24',   // amber-400
          DEFAULT: '#f59e0b', // amber-500
          dark: '#d97706',    // amber-600
        },
        demand: {
          light: '#c084fc',   // purple-400
          DEFAULT: '#a855f7', // purple-500
          dark: '#9333ea',    // purple-600
        },
      },
    },
  },
  plugins: [],
};

export default config;
