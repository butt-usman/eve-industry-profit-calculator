import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        eve: {
          dark: '#0a0d14',
          card: '#121824',
          border: '#1e293b',
          accent: '#38bdf8',
          gold: '#fbbf24',
          green: '#22c55e',
          red: '#ef4444',
        }
      }
    },
  },
  plugins: [],
}
export default config
