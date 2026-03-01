import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0B0B14',
          2: '#111120',
          3: '#191929',
        },
        card: '#14142A',
        gold: {
          DEFAULT: '#C8A55A',
          light: '#E8C97A',
          dim: 'rgba(200,165,90,0.20)',
        },
        brand: {
          text: '#F4EFE6',
          muted: '#9A97B0',
          faint: '#5A5870',
        },
        rose: '#E8583A',
        teal: '#3AAFA9',
      },
      fontFamily: {
        head: ['Georgia', 'Times New Roman', 'serif'],
        body: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(200,165,90,0.12)',
      },
      boxShadow: {
        card: '0 8px 40px rgba(0,0,0,0.6)',
        'card-sm': '0 4px 20px rgba(0,0,0,0.4)',
      },
      borderRadius: {
        card: '16px',
        'card-sm': '10px',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.32,0.72,0,1)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
