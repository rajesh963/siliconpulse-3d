/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        silicon: {
          950: '#06080d',
          900: '#0a0f1d',
          850: '#0e162b',
          800: '#141e3a',
          700: '#1e2c52',
          600: '#2d3f70',
          500: '#3f5799',
        },
        eda: {
          cyan: '#00f2fe',
          teal: '#4facfe',
          green: '#10b981',
          red: '#f43f5e',
          amber: '#f59e0b',
          purple: '#a855f7',
          violet: '#8b5cf6',
          pink: '#ec4899',
          gold: '#eab308'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 242, 254, 0.35)',
        'glow-green': '0 0 15px rgba(16, 185, 129, 0.35)',
        'glow-red': '0 0 15px rgba(244, 63, 94, 0.45)',
        'glow-purple': '0 0 15px rgba(168, 85, 247, 0.35)',
      }
    },
  },
  plugins: [],
}
