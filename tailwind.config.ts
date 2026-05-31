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
        primary: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        accent: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        sidebar: {
          bg:         '#0f172a',
          hover:      '#1e293b',
          active:     '#1e3a5f',
          text:       '#94a3b8',
          activeText: '#38bdf8',
          border:     '#1e293b',
        },
        surface: '#fafaf8',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:        '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':'0 10px 30px rgba(0,0,0,0.10), 0 4px 10px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.25rem',
      },
      animation: {
        'fade-in':  'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}

export default config
