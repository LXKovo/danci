import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './content/**/*.mdx',
    './public/**/*.svg',
  ],
  theme: {
    extend: {
      // 「Sunny Study」温暖阅读风格配色
      colors: {
        cream: '#FFF6EF',
        ink: '#30262E',
        brand: {
          DEFAULT: '#FF6B6B',
          soft: '#FFE3E0',
          light: '#FFB4A7',
          dark: '#E95050',
        },
        leaf: {
          DEFAULT: '#0FA98A',
          soft: '#DFF3EE',
          dark: '#0B8A71',
        },
        sun: {
          DEFAULT: '#FFB933',
          soft: '#FFF0D1',
          dark: '#E89D0F',
        },
      },
      boxShadow: {
        floaty: '0 8px 24px -12px rgba(233, 80, 80, 0.35)',
        card: '0 4px 20px -8px rgba(48, 38, 46, 0.12)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'pop-in': {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      animation: {
        'pop-in': 'pop-in .35s cubic-bezier(.2,.8,.3,1.2) both',
        'fade-in': 'fade-in .25s ease-out both',
        float: 'float 4s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 2.4s ease-in-out infinite',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
} satisfies Config;