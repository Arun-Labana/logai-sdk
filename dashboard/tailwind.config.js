/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors
        'logai': {
          'bg-primary': '#0a0a0f',
          'bg-secondary': '#12121a',
          'bg-card': '#1a1a24',
          'bg-hover': '#22222e',
          'border': '#2a2a3a',
          'text-primary': '#e8e6e3',
          'text-secondary': '#9ca3af',
          'accent': '#00d4ff',
          'accent-dim': '#00a8cc',
          'success': '#22c55e',
          'warning': '#f59e0b',
          'error': '#ef4444',
          'critical': '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          '100%': { boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 30px #00d4ff' },
        }
      }
    },
  },
  plugins: [],
}

