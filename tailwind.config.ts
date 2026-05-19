import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#070b12',
          1: '#0a0e17',
          2: '#0d1520',
          3: '#111827',
          4: '#1a2332',
        },
        accent: {
          blue: '#1d6fa8',
          'blue-light': '#3b9fd8',
          red: '#e83333',
          gold: '#c8973b',
          green: '#1a9c5b',
          purple: '#7c3aed',
        },
        risk: {
          1: '#22c55e',
          2: '#84cc16',
          3: '#f59e0b',
          4: '#f97316',
          5: '#ef4444',
        },
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
        strong: 'rgba(255,255,255,0.14)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
